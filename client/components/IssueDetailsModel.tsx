"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    X,
    User,
    CalendarDays,
    CircleDot,
    Plus,
    Trash2,
    CheckSquare,
    Square,
    Link2,
    AlertTriangle,
    ChevronDown,
    Loader2,
} from "lucide-react";
import type { Issue, Subtask } from "@/types";
import {
    getSubtasks,
    addSubtask,
    updateSubtaskStatus,
    deleteSubtask,
    allSubtasksDone,
    getDependencies,
    addDependency,
    removeDependency,
} from "@/lib/subtaskManager";

interface IssueDetailsModalProps {
    issue: Issue;
    allIssues?: Issue[];                       // needed for dependency picker
    onClose: () => void;
    onStatusChange?: (id: string, status: string) => void;
}

type Tab = "details" | "subtasks" | "dependencies";

// ─── helpers ─────────────────────────────────────────────────────────────────
const priorityStyles: Record<string, string> = {
    LOW: "bg-green-50 text-green-700",
    MEDIUM: "bg-yellow-50 text-yellow-700",
    HIGH: "bg-orange-50 text-orange-700",
    URGENT: "bg-red-50 text-red-700",
};
const typeStyles: Record<string, string> = {
    TASK: "bg-blue-50 text-blue-700",
    BUG: "bg-red-50 text-red-700",
    STORY: "bg-green-50 text-green-700",
    EPIC: "bg-purple-50 text-purple-700",
};
const statusLabels: Record<string, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
};
const statusColors: Record<string, string> = {
    TODO: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    DONE: "bg-green-100 text-green-700",
};

function issueId(issue: Issue) {
    return issue._id || issue.id || issue.key || "";
}

// ─── Subtask row ─────────────────────────────────────────────────────────────
function SubtaskRow({
    sub,
    parentId,
    onUpdate,
    onDelete,
}: {
    sub: Subtask;
    parentId: string;
    onUpdate: () => void;
    onDelete: () => void;
}) {
    const [saving, setSaving] = useState(false);

    const toggle = async () => {
        setSaving(true);
        const next: Subtask["status"] = sub.status === "DONE" ? "TODO" : "DONE";
        updateSubtaskStatus(parentId, sub.id, next);
        onUpdate();
        setSaving(false);
    };

    const cycleStatus = () => {
        const order: Subtask["status"][] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
        const idx = order.indexOf(sub.status);
        const next = order[(idx + 1) % order.length];
        updateSubtaskStatus(parentId, sub.id, next);
        onUpdate();
    };

    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 hover:border-gray-200">
            <button onClick={toggle} disabled={saving} className="shrink-0 text-gray-400 hover:text-blue-600">
                {sub.status === "DONE"
                    ? <CheckSquare className="h-4 w-4 text-green-600" />
                    : <Square className="h-4 w-4" />}
            </button>
            <span className={`flex-1 text-sm ${sub.status === "DONE" ? "line-through text-gray-400" : "text-gray-700"}`}>
                {sub.title}
            </span>
            <button
                onClick={cycleStatus}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[sub.status]}`}
            >
                {statusLabels[sub.status]}
            </button>
            <button onClick={() => { deleteSubtask(parentId, sub.id); onDelete(); }} className="shrink-0 text-gray-300 hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
const IssueDetailsModal = ({ issue, allIssues = [], onClose, onStatusChange }: IssueDetailsModalProps) => {
    const id = issueId(issue);
    const [activeTab, setActiveTab] = useState<Tab>("details");

    // — subtask state —
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [addingSubtask, setAddingSubtask] = useState(false);
    const [subtaskError, setSubtaskError] = useState("");

    // — dependency state —
    const [deps, setDeps] = useState<string[]>([]);
    const [depError, setDepError] = useState("");
    const [selectedDepId, setSelectedDepId] = useState("");

    // — status change —
    const [status, setStatus] = useState(issue.status || "TODO");
    const [blockMsg, setBlockMsg] = useState("");

    const reload = useCallback(() => {
        setSubtasks(getSubtasks(id));
        setDeps(getDependencies(id));
    }, [id]);

    useEffect(() => { reload(); }, [reload]);

    // progress bar calculation
    const doneCount = subtasks.filter((s) => s.status === "DONE").length;
    const progress = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0;

    // assignee display
    const assigneeName =
        typeof issue.assignee === "object" && issue.assignee !== null
            ? issue.assignee.name
            : typeof issue.assignee === "string" ? issue.assignee : undefined;
    const assigneeEmail =
        typeof issue.assignee === "object" && issue.assignee !== null
            ? issue.assignee.email : undefined;

    // ── handlers ──────────────────────────────────────────────────────────────

    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) { setSubtaskError("Title required."); return; }
        const projId = typeof issue.projectId === "string" ? issue.projectId : undefined;
        addSubtask(id, newSubtaskTitle, projId, issue.sprint);
        setNewSubtaskTitle("");
        setAddingSubtask(false);
        setSubtaskError("");
        reload();
    };

    const handleAddDep = () => {
        if (!selectedDepId) { setDepError("Select an issue to add as dependency."); return; }
        const err = addDependency(id, selectedDepId);
        if (err) { setDepError(err); return; }
        setDepError("");
        setSelectedDepId("");
        reload();
    };

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === "DONE" && !allSubtasksDone(id)) {
            setBlockMsg("⚠️ Cannot mark as Done — all subtasks must be completed first.");
            return;
        }
        setBlockMsg("");
        setStatus(newStatus);
        onStatusChange?.(id, newStatus);
    };

    // issues available for dependency picker (exclude self + already-added)
    const depCandidates = allIssues.filter(
        (iss) => issueId(iss) !== id && !deps.includes(issueId(iss))
    );

    const getDepIssue = (depId: string) =>
        allIssues.find((iss) => issueId(iss) === depId);

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col"
                style={{ maxHeight: "90vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5 shrink-0">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-medium text-gray-400">{id}</p>
                        <h2 className="text-xl font-bold text-gray-900">{issue.title}</h2>
                        {issue.parentId && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                                SUBTASK
                            </span>
                        )}
                    </div>
                    <button type="button" onClick={onClose} className="ml-4 rounded-md p-2 text-gray-400 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6 shrink-0">
                    {(["details", "subtasks", "dependencies"] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`mr-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                                activeTab === tab
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab}
                            {tab === "subtasks" && subtasks.length > 0 && (
                                <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                                    {subtasks.length}
                                </span>
                            )}
                            {tab === "dependencies" && deps.length > 0 && (
                                <span className="ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
                                    {deps.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* ── DETAILS TAB ── */}
                    {activeTab === "details" && (
                        <>
                            {/* Status change */}
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusChange(s)}
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                                status === s
                                                    ? statusColors[s] + " ring-2 ring-offset-1 ring-blue-400"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            }`}
                                        >
                                            {statusLabels[s]}
                                        </button>
                                    ))}
                                </div>
                                {blockMsg && (
                                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                                        <p className="text-xs text-amber-700">{blockMsg}</p>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-gray-700">Description</h3>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm leading-6 text-gray-600">{issue.description || "No description provided."}</p>
                                </div>
                            </div>

                            {/* Type / Priority / Status badges */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="mb-2 text-xs font-medium text-gray-500">Type</p>
                                    <span className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold ${typeStyles[issue.type || "TASK"] || "bg-gray-50 text-gray-700"}`}>
                                        {issue.type || "TASK"}
                                    </span>
                                </div>
                                <div>
                                    <p className="mb-2 text-xs font-medium text-gray-500">Priority</p>
                                    <span className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold ${priorityStyles[issue.priority || "MEDIUM"] || "bg-gray-50 text-gray-700"}`}>
                                        {issue.priority || "MEDIUM"}
                                    </span>
                                </div>
                                <div>
                                    <p className="mb-2 text-xs font-medium text-gray-500">Current Status</p>
                                    <span className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${statusColors[status]}`}>
                                        <CircleDot className="h-3.5 w-3.5" />
                                        {statusLabels[status] || status}
                                    </span>
                                </div>
                            </div>

                            {/* Assignee / Due Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <h3 className="text-sm font-semibold text-gray-700">Assignee</h3>
                                    </div>
                                    {assigneeName ? (
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{assigneeName}</p>
                                            {assigneeEmail && <p className="mt-1 text-xs text-gray-500">{assigneeEmail}</p>}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">Unassigned</p>
                                    )}
                                </div>
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-gray-500" />
                                        <h3 className="text-sm font-semibold text-gray-700">Due Date</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString("en-GB") : "No due date"}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── SUBTASKS TAB ── */}
                    {activeTab === "subtasks" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">Subtasks</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Subtasks inherit this issue&apos;s project and sprint.
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500">{doneCount}/{subtasks.length} done</span>
                            </div>

                            {/* Progress bar */}
                            {subtasks.length > 0 && (
                                <div>
                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="mt-1 text-right text-[10px] text-gray-400">{progress}% complete</p>
                                </div>
                            )}

                            {/* Subtask list */}
                            {subtasks.length === 0 && !addingSubtask && (
                                <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
                                    <CheckSquare className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-400">No subtasks yet.</p>
                                    <p className="text-xs text-gray-400">Break this issue into smaller steps.</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                {subtasks.map((sub) => (
                                    <SubtaskRow
                                        key={sub.id}
                                        sub={sub}
                                        parentId={id}
                                        onUpdate={reload}
                                        onDelete={reload}
                                    />
                                ))}
                            </div>

                            {/* Add subtask */}
                            {addingSubtask ? (
                                <div className="space-y-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Subtask title…"
                                        value={newSubtaskTitle}
                                        onChange={(e) => { setNewSubtaskTitle(e.target.value); setSubtaskError(""); }}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleAddSubtask(); if (e.key === "Escape") { setAddingSubtask(false); setNewSubtaskTitle(""); } }}
                                        className="w-full rounded-md border border-blue-400 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                    {subtaskError && <p className="text-xs text-red-500">{subtaskError}</p>}
                                    <div className="flex gap-2">
                                        <button onClick={handleAddSubtask} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                                            Add
                                        </button>
                                        <button onClick={() => { setAddingSubtask(false); setNewSubtaskTitle(""); setSubtaskError(""); }} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAddingSubtask(true)}
                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add subtask
                                </button>
                            )}

                            {/* Warning: parent can't be done until all subtasks done */}
                            {subtasks.length > 0 && !allSubtasksDone(id) && (
                                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700">
                                        This issue cannot be marked as <strong>Done</strong> until all subtasks are completed.
                                    </p>
                                </div>
                            )}
                            {subtasks.length > 0 && allSubtasksDone(id) && (
                                <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
                                    <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-green-700">
                                        All subtasks completed! This issue can now be marked as <strong>Done</strong>.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── DEPENDENCIES TAB ── */}
                    {activeTab === "dependencies" && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800">Blocked By</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    This issue cannot be started until the issues below are <strong>Done</strong>.
                                </p>
                            </div>

                            {deps.length === 0 ? (
                                <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
                                    <Link2 className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-400">No dependencies.</p>
                                    <p className="text-xs text-gray-400">Add blocking issues below.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {deps.map((depId) => {
                                        const depIssue = getDepIssue(depId);
                                        const depStatus = depIssue?.status || "TODO";
                                        const isDone = depStatus === "DONE";
                                        return (
                                            <div key={depId} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${isDone ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
                                                <span className={`h-2 w-2 rounded-full shrink-0 ${isDone ? "bg-green-500" : "bg-orange-400"}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {depIssue?.title || depId}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">{depId}</p>
                                                </div>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[depStatus]}`}>
                                                    {statusLabels[depStatus] || depStatus}
                                                </span>
                                                <button onClick={() => { removeDependency(id, depId); reload(); }} className="shrink-0 text-gray-300 hover:text-red-500">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Add dependency picker */}
                            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Add Blocking Issue</h4>
                                <select
                                    value={selectedDepId}
                                    onChange={(e) => { setSelectedDepId(e.target.value); setDepError(""); }}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Select an issue…</option>
                                    {depCandidates.map((iss) => (
                                        <option key={issueId(iss)} value={issueId(iss)}>
                                            [{iss.key || issueId(iss)}] {iss.title}
                                        </option>
                                    ))}
                                </select>
                                {depError && (
                                    <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                        <p className="text-xs text-red-600">{depError}</p>
                                    </div>
                                )}
                                <button
                                    onClick={handleAddDep}
                                    className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                                    disabled={!selectedDepId}
                                >
                                    <Link2 className="h-3.5 w-3.5" />
                                    Add Dependency
                                </button>
                                <p className="text-[10px] text-gray-400">
                                    ⚠️ Circular dependencies are automatically detected and rejected.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-gray-200 px-6 py-4 shrink-0">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IssueDetailsModal;