"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Clock,
    Plus,
    Trash2,
    Edit2,
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    ChevronDown,
    ChevronUp,
    X,
} from "lucide-react";
import type { WorkLog, AuditEntry } from "@/types";
import {
    getLogsForIssue,
    createLog,
    updateLog,
    deleteLog,
    totalMinutesForIssue,
    canModifyLog,
    formatDuration,
    todayIso,
    getAuditLog,
} from "@/lib/timeTracker";
import { useAuth } from "@/context/AuthContext";

interface TimeTrackingPanelProps {
    issueId: string;
    issueAssignee?: string;  // assignee name for display
    sprint?: string;
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({
    message,
    onConfirm,
    onCancel,
}: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{message}</p>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Log Form ──────────────────────────────────────────────────────────────────
function LogForm({
    initial,
    onSave,
    onCancel,
}: {
    initial?: Partial<WorkLog>;
    onSave: (date: string, duration: number, description: string) => string | null;
    onCancel: () => void;
}) {
    const [date, setDate] = useState(initial?.date || todayIso());
    const [hours, setHours] = useState(initial ? String(Math.floor((initial.duration || 0) / 60)) : "0");
    const [mins, setMins] = useState(initial ? String((initial.duration || 0) % 60) : "30");
    const [desc, setDesc] = useState(initial?.description || "");
    const [error, setError] = useState("");

    const handleSave = () => {
        const duration = (parseInt(hours || "0") * 60) + parseInt(mins || "0");
        const err = onSave(date, duration, desc);
        if (err) setError(err);
    };

    return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-blue-700">
                {initial?.id ? "Edit Work Log" : "Log Work"}
            </h4>

            {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            {/* Date */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Date *</label>
                <input
                    type="date"
                    value={date}
                    max={todayIso()}
                    onChange={(e) => { setDate(e.target.value); setError(""); }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[10px] text-gray-400">Future dates are not allowed.</p>
            </div>

            {/* Duration */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Duration *</label>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-1">
                        <input
                            type="number"
                            min={0} max={23}
                            value={hours}
                            onChange={(e) => { setHours(e.target.value); setError(""); }}
                            className="w-16 rounded-md border border-gray-300 px-2 py-2 text-center text-sm outline-none focus:border-blue-500"
                            placeholder="0"
                        />
                        <span className="text-xs text-gray-500">h</span>
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                        <input
                            type="number"
                            min={0} max={59}
                            value={mins}
                            onChange={(e) => { setMins(e.target.value); setError(""); }}
                            className="w-16 rounded-md border border-gray-300 px-2 py-2 text-center text-sm outline-none focus:border-blue-500"
                            placeholder="30"
                        />
                        <span className="text-xs text-gray-500">m</span>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400">Duration must be positive (no negative time).</p>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Description of Work *</label>
                <textarea
                    value={desc}
                    onChange={(e) => { setDesc(e.target.value); setError(""); }}
                    placeholder="Describe what you worked on…"
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
            </div>

            <div className="flex gap-2">
                <button onClick={handleSave} className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                    {initial?.id ? "Save Changes" : "Log Time"}
                </button>
                <button onClick={onCancel} className="rounded-md border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
const TimeTrackingPanel: React.FC<TimeTrackingPanelProps> = ({ issueId, sprint }) => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<WorkLog[]>([]);
    const [totalMins, setTotalMins] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ msg: string; fn: () => void } | null>(null);
    const [showAudit, setShowAudit] = useState(false);
    const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
    const [successMsg, setSuccessMsg] = useState("");

    const reload = useCallback(() => {
        const l = getLogsForIssue(issueId);
        setLogs(l);
        setTotalMins(totalMinutesForIssue(issueId));
        setAuditEntries(getAuditLog().filter((a) => a.issueId === issueId));
    }, [issueId]);

    useEffect(() => { reload(); }, [reload]);

    const flash = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const handleCreate = (date: string, duration: number, description: string): string | null => {
        if (!user) return "You must be logged in to log time.";
        const err = createLog(issueId, user.id, user.name, date, duration, description, sprint);
        if (err) return err;
        reload();
        setShowForm(false);
        flash("Work logged successfully!");
        return null;
    };

    const handleUpdate = (date: string, duration: number, description: string): string | null => {
        if (!user || !editingLog) return "Not authorised.";
        if (!canModifyLog(editingLog, user.id, user.role)) return "Only the log author or a Project Manager can edit this entry.";
        const err = updateLog(editingLog.id, user.id, user.name, date, duration, description);
        if (err) return err;
        reload();
        setEditingLog(null);
        flash("Work log updated!");
        return null;
    };

    const handleDeleteRequest = (log: WorkLog) => {
        if (!user) return;
        if (!canModifyLog(log, user.id, user.role)) {
            flash("⛔ Only the log author or a Project Manager can delete this entry.");
            return;
        }
        setConfirmAction({
            msg: `Delete work log of ${formatDuration(log.duration)} on ${log.date}? This will be recorded in the audit log.`,
            fn: () => {
                deleteLog(log.id, user.id, user.name);
                reload();
                setConfirmAction(null);
                flash("Work log deleted.");
            },
        });
    };

    const handleEditRequest = (log: WorkLog) => {
        if (!user) return;
        if (!canModifyLog(log, user.id, user.role)) {
            flash("⛔ Only the log author or a Project Manager can edit this entry.");
            return;
        }
        setConfirmAction({
            msg: `Edit this work log? The change will be recorded in the audit log.`,
            fn: () => { setEditingLog(log); setConfirmAction(null); },
        });
    };

    const actionColors: Record<string, string> = {
        CREATE: "bg-green-100 text-green-700",
        EDIT:   "bg-blue-100 text-blue-700",
        DELETE: "bg-red-100 text-red-700",
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Work Logs
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Log and track time spent on this task.</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">{formatDuration(totalMins)}</p>
                    <p className="text-[10px] text-gray-400">Total Logged</p>
                </div>
            </div>

            {/* Success message */}
            {successMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700">{successMsg}</p>
                </div>
            )}

            {/* Log Form */}
            {showForm && !editingLog && (
                <LogForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
            )}
            {editingLog && (
                <LogForm initial={editingLog} onSave={handleUpdate} onCancel={() => setEditingLog(null)} />
            )}

            {/* Log List */}
            {logs.length === 0 && !showForm ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
                    <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No work logged yet.</p>
                    <p className="text-xs text-gray-400">Track your time by clicking below.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map((log) => {
                        const canModify = user ? canModifyLog(log, user.id, user.role) : false;
                        return (
                            <div key={log.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 hover:border-gray-200">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-blue-700">{formatDuration(log.duration)}</span>
                                            <span className="text-xs text-gray-500">on {log.date}</span>
                                            <span className="text-xs text-gray-400">by {log.userName}</span>
                                            {log.updatedAt && (
                                                <span className="text-[10px] text-gray-400 italic">(edited)</span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{log.description}</p>
                                    </div>
                                    {canModify && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => handleEditRequest(log)} className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600" title="Edit">
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteRequest(log)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                    {!canModify && user && (
                                        <span className="text-[10px] text-gray-300 shrink-0">view only</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Log Time button */}
            {!showForm && !editingLog && (
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Log time
                </button>
            )}

            {/* Audit Log section */}
            <div className="border-t border-gray-100 pt-4">
                <button
                    onClick={() => setShowAudit((v) => !v)}
                    className="flex w-full items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                    <span className="flex items-center gap-1.5">
                        <ClipboardList className="h-3.5 w-3.5" />
                        Audit Log ({auditEntries.length})
                    </span>
                    {showAudit ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showAudit && (
                    <div className="mt-3 space-y-2">
                        {auditEntries.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-3">No audit entries yet.</p>
                        ) : (
                            auditEntries.map((entry) => (
                                <div key={entry.id} className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2.5 border border-gray-100">
                                    <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${actionColors[entry.action]}`}>
                                        {entry.action}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-600 leading-relaxed">{entry.details}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            by {entry.userName} · {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            {confirmAction && (
                <ConfirmDialog
                    message={confirmAction.msg}
                    onConfirm={confirmAction.fn}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
        </div>
    );
};

export default TimeTrackingPanel;
