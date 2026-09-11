/**
 * notificationManager.ts
 * In-App Notification System (localStorage-backed)
 *
 * Features:
 *  • Store typed notifications (TASK_ASSIGNED, STATUS_CHANGED, DUE_DATE_REMINDER, SPRINT_START, SPRINT_END)
 *  • Deduplication via unique event key (prevents same event firing twice)
 *  • Mark as read / unread / mark all read
 *  • Email preference check (reads jira_notif_prefs from localStorage)
 *  • 24-hour before deadline reminder scheduler
 *  • Simulated email via console + backend API call
 */

export type NotifType =
    | "TASK_ASSIGNED"
    | "STATUS_CHANGED"
    | "DUE_DATE_REMINDER"
    | "SPRINT_START"
    | "SPRINT_END"
    | "COMMENT_ADDED";

export interface AppNotification {
    id: string;
    type: NotifType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;       // optional deep-link
    issueId?: string;
    dedupKey: string;    // prevents duplicate for the same event
}

export interface NotifPreferences {
    emailEnabled: boolean;
    taskAssigned: boolean;
    statusChanged: boolean;
    dueDateReminder: boolean;
    sprintEvents: boolean;
    commentAdded: boolean;
}

const NOTIF_KEY   = "jira_notifications";
const PREFS_KEY   = "jira_notif_prefs";
const DEDUP_KEY   = "jira_notif_dedup";
const SCHED_KEY   = "jira_notif_scheduled"; // issueIds already scheduled

// ─── defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_PREFS: NotifPreferences = {
    emailEnabled: false,
    taskAssigned: true,
    statusChanged: true,
    dueDateReminder: true,
    sprintEvents: true,
    commentAdded: true,
};

// ─── persistence helpers ───────────────────────────────────────────────────────

function load(): AppNotification[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"); } catch { return []; }
}
function save(n: AppNotification[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(n.slice(0, 100))); // keep last 100
}
function loadDedup(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem(DEDUP_KEY) || "[]")); } catch { return new Set(); }
}
function saveDedup(s: Set<string>) {
    if (typeof window === "undefined") return;
    const arr = Array.from(s);
    localStorage.setItem(DEDUP_KEY, JSON.stringify(arr.slice(-300)));
}
function loadScheduled(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem(SCHED_KEY) || "[]")); } catch { return new Set(); }
}
function saveScheduled(s: Set<string>) {
    if (typeof window === "undefined") return;
    localStorage.setItem(SCHED_KEY, JSON.stringify(Array.from(s)));
}

// ─── prefs ────────────────────────────────────────────────────────────────────

export function getPrefs(): NotifPreferences {
    if (typeof window === "undefined") return DEFAULT_PREFS;
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") }; } catch { return DEFAULT_PREFS; }
}
export function savePrefs(p: NotifPreferences) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

// ─── core: push notification ───────────────────────────────────────────────────

export function pushNotification(n: Omit<AppNotification, "id" | "isRead" | "createdAt">): boolean {
    const dedup = loadDedup();
    if (dedup.has(n.dedupKey)) return false;   // duplicate — skip

    const prefs = getPrefs();
    // Check per-type preference
    if (n.type === "TASK_ASSIGNED"    && !prefs.taskAssigned)    return false;
    if (n.type === "STATUS_CHANGED"   && !prefs.statusChanged)   return false;
    if (n.type === "DUE_DATE_REMINDER"&& !prefs.dueDateReminder) return false;
    if ((n.type === "SPRINT_START" || n.type === "SPRINT_END") && !prefs.sprintEvents) return false;
    if (n.type === "COMMENT_ADDED"    && !prefs.commentAdded)    return false;

    const notif: AppNotification = {
        ...n,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        isRead: false,
        createdAt: new Date().toISOString(),
    };

    const all = load();
    all.unshift(notif);
    save(all);

    dedup.add(n.dedupKey);
    saveDedup(dedup);

    // Dispatch custom event so NotificationBell re-renders
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("jira_notification", { detail: notif }));

        // Simulate email if enabled
        if (prefs.emailEnabled) {
            sendEmailNotification(notif);
        }
    }

    return true;
}

// ─── email simulation ──────────────────────────────────────────────────────────

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://jira-clone-app.onrender.com").replace(/\/+$/, "");

async function sendEmailNotification(notif: AppNotification) {
    const user = (() => { try { return JSON.parse(localStorage.getItem("jira_user") || "{}"); } catch { return {}; } })();
    if (!user?.email) return;

    try {
        await fetch(`${API_URL}/api/notifications/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: user.email,
                subject: notif.title,
                body: notif.message,
                type: notif.type,
            }),
        });
    } catch {
        // Email API not available — log for audit
        console.info(`[Email Notification] To: ${user.email} | ${notif.title}: ${notif.message}`);
    }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function getNotifications(): AppNotification[] { return load(); }

export function getUnreadCount(): number { return load().filter((n) => !n.isRead).length; }

export function markAsRead(id: string) {
    const all = load().map((n) => n.id === id ? { ...n, isRead: true } : n);
    save(all);
}
export function markAsUnread(id: string) {
    const all = load().map((n) => n.id === id ? { ...n, isRead: false } : n);
    save(all);
}
export function markAllRead() {
    save(load().map((n) => ({ ...n, isRead: true })));
}
export function deleteNotification(id: string) {
    save(load().filter((n) => n.id !== id));
}
export function clearAll() { save([]); }

// ─── 24h deadline scheduler ────────────────────────────────────────────────────

/**
 * Call this on app boot with the current list of issues.
 * It schedules a DUE_DATE_REMINDER for issues due within 24-48h that haven't been scheduled yet.
 */
export function scheduleDueDateReminders(issues: Array<{ id?: string; _id?: string; key?: string; title: string; dueDate?: string; status?: string }>) {
    const scheduled = loadScheduled();
    const now = Date.now();
    const h24 = 24 * 60 * 60 * 1000;
    const h48 = 48 * 60 * 60 * 1000;

    issues.forEach((issue) => {
        if (!issue.dueDate) return;
        if (issue.status === "DONE") return;

        const issueId = issue._id || issue.id || issue.key || "";
        const due = new Date(issue.dueDate).getTime();
        const diff = due - now;

        // Remind if due is between 0 and 48h from now
        if (diff > 0 && diff <= h48) {
            const dedupKey = `due-${issueId}-${issue.dueDate}`;
            if (!scheduled.has(dedupKey)) {
                pushNotification({
                    type: "DUE_DATE_REMINDER",
                    title: "⏰ Due Date Reminder",
                    message: `"${issue.title}" is due ${diff <= h24 ? "in less than 24 hours" : "tomorrow"}.`,
                    dedupKey,
                    issueId,
                    link: "/kanban",
                });
                scheduled.add(dedupKey);
            }
        }
    });

    saveScheduled(scheduled);
}

// ─── event helpers (call these from Kanban / IssueDetails) ────────────────────

export function notifyTaskAssigned(issueId: string, issueTitle: string, assigneeName: string) {
    pushNotification({
        type: "TASK_ASSIGNED",
        title: "📌 Task Assigned",
        message: `"${issueTitle}" has been assigned to ${assigneeName}.`,
        dedupKey: `assign-${issueId}-${assigneeName}`,
        issueId,
        link: "/kanban",
    });
}

export function notifyStatusChanged(issueId: string, issueTitle: string, newStatus: string, byUser: string) {
    pushNotification({
        type: "STATUS_CHANGED",
        title: "🔄 Status Updated",
        message: `"${issueTitle}" was moved to ${newStatus.replace(/_/g, " ")} by ${byUser}.`,
        dedupKey: `status-${issueId}-${newStatus}-${Date.now().toString().slice(0, -4)}`, // group per ~10s
        issueId,
        link: "/kanban",
    });
}

export function notifyCommentAdded(issueId: string, issueTitle: string, commenter: string) {
    pushNotification({
        type: "COMMENT_ADDED",
        title: "💬 New Comment",
        message: `${commenter} commented on "${issueTitle}".`,
        dedupKey: `comment-${issueId}-${Date.now().toString().slice(0, -3)}`,
        issueId,
        link: "/kanban",
    });
}

export function notifySprintEvent(sprintName: string, event: "start" | "end") {
    const type = event === "start" ? "SPRINT_START" : "SPRINT_END";
    pushNotification({
        type,
        title: event === "start" ? "🚀 Sprint Started" : "🏁 Sprint Ended",
        message: `Sprint "${sprintName}" has ${event === "start" ? "started" : "ended"}.`,
        dedupKey: `sprint-${sprintName}-${event}`,
        link: "/kanban",
    });
}
