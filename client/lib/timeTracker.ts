/**
 * timeTracker.ts — Client-side work log & audit log manager.
 * Stored in localStorage under "jira_work_logs" and "jira_audit_log".
 *
 * Rules enforced here:
 *  • No negative or zero duration
 *  • No future dates
 *  • Totals computed on demand (per issue, per sprint)
 *  • Every create / edit / delete is appended to the audit log
 */

import type { WorkLog, AuditEntry } from "@/types";

const LOGS_KEY  = "jira_work_logs";
const AUDIT_KEY = "jira_audit_log";

// ─── persistence ─────────────────────────────────────────────────────────────

function loadLogs(): WorkLog[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(LOGS_KEY) || "[]"); }
    catch { return []; }
}
function saveLogs(logs: WorkLog[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

function loadAudit(): AuditEntry[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]"); }
    catch { return []; }
}
function saveAudit(entries: AuditEntry[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}

function appendAudit(entry: Omit<AuditEntry, "id" | "timestamp">) {
    const audit = loadAudit();
    audit.push({ ...entry, id: `audit-${Date.now()}`, timestamp: new Date().toISOString() });
    saveAudit(audit);
}

// ─── validation ───────────────────────────────────────────────────────────────

export interface LogValidation {
    valid: boolean;
    error?: string;
}

export function validateLog(date: string, duration: number, description: string): LogValidation {
    if (!date) return { valid: false, error: "Date is required." };

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (new Date(date) > today) return { valid: false, error: "Date cannot be in the future." };

    if (!duration || duration <= 0) return { valid: false, error: "Duration must be greater than 0." };
    if (duration > 1440) return { valid: false, error: "Duration cannot exceed 24 hours (1440 min)." };
    if (!description.trim()) return { valid: false, error: "Description of work is required." };

    return { valid: true };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function getLogsForIssue(issueId: string): WorkLog[] {
    return loadLogs().filter((l) => l.issueId === issueId);
}

export function getLogsForSprint(sprint: string): WorkLog[] {
    return loadLogs().filter((l) => l.sprint === sprint);
}

export function getAllLogs(): WorkLog[] {
    return loadLogs();
}

export function getAuditLog(): AuditEntry[] {
    return loadAudit().slice().reverse(); // newest first
}

/** Create a new work log entry. Returns error string or null. */
export function createLog(
    issueId: string,
    userId: string,
    userName: string,
    date: string,
    duration: number,
    description: string,
    sprint?: string
): string | null {
    const v = validateLog(date, duration, description);
    if (!v.valid) return v.error!;

    const log: WorkLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        issueId,
        userId,
        userName,
        date,
        duration,
        description: description.trim(),
        sprint,
        createdAt: new Date().toISOString(),
    };

    const logs = loadLogs();
    logs.push(log);
    saveLogs(logs);

    appendAudit({
        action: "CREATE",
        workLogId: log.id,
        issueId,
        userId,
        userName,
        details: `Logged ${formatDuration(duration)} on ${date}: "${description.trim()}"`,
    });

    return null;
}

/** Update an existing log. Returns error string or null. */
export function updateLog(
    logId: string,
    userId: string,
    userName: string,
    date: string,
    duration: number,
    description: string
): string | null {
    const v = validateLog(date, duration, description);
    if (!v.valid) return v.error!;

    const logs = loadLogs();
    const idx = logs.findIndex((l) => l.id === logId);
    if (idx === -1) return "Work log not found.";

    const old = logs[idx];
    logs[idx] = { ...old, date, duration, description: description.trim(), updatedAt: new Date().toISOString() };
    saveLogs(logs);

    appendAudit({
        action: "EDIT",
        workLogId: logId,
        issueId: old.issueId,
        userId,
        userName,
        details: `Edited log ${logId}: ${formatDuration(old.duration)}→${formatDuration(duration)}, "${old.description}"→"${description.trim()}"`,
    });

    return null;
}

/** Delete a log entry. */
export function deleteLog(logId: string, userId: string, userName: string): string | null {
    const logs = loadLogs();
    const idx = logs.findIndex((l) => l.id === logId);
    if (idx === -1) return "Work log not found.";

    const [removed] = logs.splice(idx, 1);
    saveLogs(logs);

    appendAudit({
        action: "DELETE",
        workLogId: logId,
        issueId: removed.issueId,
        userId,
        userName,
        details: `Deleted log: ${formatDuration(removed.duration)} on ${removed.date} — "${removed.description}"`,
    });

    return null;
}

// ─── totals ───────────────────────────────────────────────────────────────────

/** Total logged minutes for a single issue. */
export function totalMinutesForIssue(issueId: string): number {
    return getLogsForIssue(issueId).reduce((sum, l) => sum + l.duration, 0);
}

/** Total logged minutes for a sprint across all issues. */
export function totalMinutesForSprint(sprint: string): number {
    return getLogsForSprint(sprint).reduce((sum, l) => sum + l.duration, 0);
}

// ─── permission check ────────────────────────────────────────────────────────

/**
 * Returns true if the current user can modify a work log.
 * Allowed: the log's original author OR the Project Manager / Admin role.
 */
export function canModifyLog(
    log: WorkLog,
    currentUserId: string,
    currentUserRole?: string
): boolean {
    if (log.userId === currentUserId) return true;
    const role = (currentUserRole || "").toUpperCase();
    return role === "MANAGER" || role === "ADMIN";
}

// ─── helpers ─────────────────────────────────────────────────────────────────

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

export function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}
