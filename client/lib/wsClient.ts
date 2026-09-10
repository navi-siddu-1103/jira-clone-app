/**
 * wsClient.ts — Real-Time Collaboration Engine
 *
 * Transport strategy (in priority order):
 *  1. Native WebSocket (wss://<backend>/ws) — used when backend supports it
 *  2. BroadcastChannel API — cross-tab real-time within same browser/origin (demo fallback)
 *
 * Features:
 *  • Auto-reconnect with exponential back-off (max 30s)
 *  • Event deduplication via event ID cache (prevents duplicate triggers)
 *  • Project-scoped filtering (only receive events for your project)
 *  • Active user session tracking (presence)
 *  • Conflict resolution: last-write-wins via updatedAt timestamp
 *  • Typed event system
 */

export type RTEventType =
    | "ISSUE_CREATED"
    | "ISSUE_UPDATED"
    | "ISSUE_STATUS_CHANGED"
    | "ISSUE_DELETED"
    | "COMMENT_ADDED"
    | "USER_JOINED"
    | "USER_LEFT"
    | "PING"
    | "PONG";

export interface RTEvent {
    id: string;           // unique event ID for deduplication
    type: RTEventType;
    projectId: string;    // only subscribers of this project receive it
    senderId: string;     // user who triggered the event
    senderName: string;
    payload: unknown;
    timestamp: number;    // ms epoch — used for conflict resolution
}

export interface ActiveUser {
    id: string;
    name: string;
    joinedAt: number;
    lastSeen: number;
}

type Listener = (event: RTEvent) => void;

// ─── ID generation ────────────────────────────────────────────────────────────
function genId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── RTClient ─────────────────────────────────────────────────────────────────
class RTClient {
    private ws: WebSocket | null = null;
    private bc: BroadcastChannel | null = null;
    private listeners: Set<Listener> = new Set();
    private seenIds: Set<string> = new Set();         // deduplication cache
    private activeUsers: Map<string, ActiveUser> = new Map();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectDelay = 1000;
    private maxReconnectDelay = 30000;
    private destroyed = false;
    private pingTimer: ReturnType<typeof setInterval> | null = null;
    private presenceTimer: ReturnType<typeof setInterval> | null = null;

    private projectId = "";
    private userId = "";
    private userName = "";
    private wsUrl = "";

    // ── Init ──────────────────────────────────────────────────────────────────
    init(wsUrl: string, projectId: string, userId: string, userName: string) {
        this.wsUrl = wsUrl;
        this.projectId = projectId;
        this.userId = userId;
        this.userName = userName;
        this.destroyed = false;

        // BroadcastChannel — always available (cross-tab fallback)
        if (typeof BroadcastChannel !== "undefined") {
            this.bc = new BroadcastChannel(`jira_rt_${projectId}`);
            this.bc.onmessage = (ev) => this.handleIncoming(ev.data as RTEvent);
        }

        // Announce presence
        this.announcePresence();

        // Start WebSocket (will gracefully fail if backend doesn't support it)
        this.connectWS();

        // Ping to keep presence alive every 15s
        this.presenceTimer = setInterval(() => this.announcePresence(), 15000);

        // Prune stale users every 30s (inactive > 45s)
        this.pingTimer = setInterval(() => this.pruneStaleUsers(), 30000);
    }

    // ── WebSocket ─────────────────────────────────────────────────────────────
    private connectWS() {
        if (this.destroyed || !this.wsUrl) return;

        try {
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => {
                console.log("[RT] WebSocket connected");
                this.reconnectDelay = 1000; // reset back-off
                // Subscribe to project
                this.wsSend({ type: "PING", payload: { projectId: this.projectId } });
            };

            this.ws.onmessage = (ev) => {
                try {
                    const event = JSON.parse(ev.data) as RTEvent;
                    this.handleIncoming(event);
                } catch { /* ignore malformed */ }
            };

            this.ws.onclose = () => {
                if (!this.destroyed) this.scheduleReconnect();
            };

            this.ws.onerror = () => {
                // Silently fail — BroadcastChannel still works
                this.ws?.close();
            };
        } catch {
            // WebSocket not supported or URL invalid — BroadcastChannel only
        }
    }

    private scheduleReconnect() {
        if (this.destroyed) return;
        this.reconnectTimer = setTimeout(() => {
            console.log(`[RT] Reconnecting in ${this.reconnectDelay / 1000}s…`);
            this.connectWS();
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        }, this.reconnectDelay);
    }

    private wsSend(data: object) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    // ── Event handling ────────────────────────────────────────────────────────
    private handleIncoming(event: RTEvent) {
        // 1. Project filter — ignore events for other projects
        if (event.projectId !== this.projectId) return;

        // 2. Ignore our own events (already applied locally)
        if (event.senderId === this.userId && event.type !== "USER_JOINED" && event.type !== "USER_LEFT") return;

        // 3. Deduplication — prevent duplicate triggers
        if (this.seenIds.has(event.id)) return;
        this.seenIds.add(event.id);
        if (this.seenIds.size > 500) {
            const arr = Array.from(this.seenIds);
            arr.splice(0, 100).forEach((id) => this.seenIds.delete(id));
        }

        // 4. Track presence
        if (event.type === "USER_JOINED" || event.type === "PING") {
            this.activeUsers.set(event.senderId, {
                id: event.senderId,
                name: event.senderName,
                joinedAt: this.activeUsers.get(event.senderId)?.joinedAt || event.timestamp,
                lastSeen: event.timestamp,
            });
        }
        if (event.type === "USER_LEFT") {
            this.activeUsers.delete(event.senderId);
        }

        // 5. Dispatch to listeners
        this.listeners.forEach((fn) => fn(event));
    }

    // ── Publish ───────────────────────────────────────────────────────────────
    publish(type: RTEventType, payload: unknown) {
        const event: RTEvent = {
            id: genId(),
            type,
            projectId: this.projectId,
            senderId: this.userId,
            senderName: this.userName,
            payload,
            timestamp: Date.now(),
        };

        // Add to seen set so we don't re-process our own event via BC echo
        this.seenIds.add(event.id);

        // Broadcast via BroadcastChannel (other tabs)
        this.bc?.postMessage(event);

        // Broadcast via WebSocket (other users on other machines)
        this.wsSend(event);
    }

    // ── Presence ──────────────────────────────────────────────────────────────
    private announcePresence() {
        const event: RTEvent = {
            id: genId(),
            type: "USER_JOINED",
            projectId: this.projectId,
            senderId: this.userId,
            senderName: this.userName,
            payload: null,
            timestamp: Date.now(),
        };

        // Track ourselves
        this.activeUsers.set(this.userId, {
            id: this.userId,
            name: this.userName,
            joinedAt: this.activeUsers.get(this.userId)?.joinedAt || Date.now(),
            lastSeen: Date.now(),
        });

        this.bc?.postMessage(event);
        this.wsSend(event);
    }

    private pruneStaleUsers() {
        const cutoff = Date.now() - 45000;
        this.activeUsers.forEach((u, id) => {
            if (u.lastSeen < cutoff) this.activeUsers.delete(id);
        });
    }

    // ── Subscribe / Unsubscribe ───────────────────────────────────────────────
    subscribe(fn: Listener) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    getActiveUsers(): ActiveUser[] {
        return Array.from(this.activeUsers.values());
    }

    // ── Conflict resolution ───────────────────────────────────────────────────
    /**
     * Last-write-wins: returns true if the incoming event should override
     * the current local state based on timestamp.
     */
    static shouldApply(incomingTimestamp: number, localUpdatedAt?: string): boolean {
        if (!localUpdatedAt) return true;
        return incomingTimestamp > new Date(localUpdatedAt).getTime();
    }

    // ── Destroy ───────────────────────────────────────────────────────────────
    destroy() {
        this.destroyed = true;

        // Announce leaving
        const event: RTEvent = {
            id: genId(),
            type: "USER_LEFT",
            projectId: this.projectId,
            senderId: this.userId,
            senderName: this.userName,
            payload: null,
            timestamp: Date.now(),
        };
        this.bc?.postMessage(event);
        this.wsSend(event);

        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this.pingTimer) clearInterval(this.pingTimer);
        if (this.presenceTimer) clearInterval(this.presenceTimer);
        this.ws?.close();
        this.bc?.close();
        this.listeners.clear();
        this.activeUsers.clear();
    }
}

// Singleton instance
export const rtClient = new RTClient();
