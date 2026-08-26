"use client";

import React, { useEffect, useState } from "react";
import KanbanCard from "@/components/KanbanCard";
import { Share2, MoreHorizontal } from "lucide-react";
import CreateIssueModal from "@/components/CreateIssueModel";
import IssueDetailsModel from "@/components/IssueDetailsModel";
import type { Issue } from "@/types";
import { useAuth } from "@/context/AuthContext";


const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace(/\/+$/, "");
const PROJECT_ID = "6a897d9ddfcfb80e0e7cf8ab";

const defaultSampleIssues: Issue[] = [
    {
        id: "PS-124",
        _id: "PS-124",
        key: "PS-124",
        title: "Implement user authentication flow",
        description: "Add JWT token authentication and user login page",
        type: "TASK",
        priority: "HIGH",
        status: "TODO",
        assignee: "John Doe",
    },
    {
        id: "PS-126",
        _id: "PS-126",
        key: "PS-126",
        title: "Design system audit and cleanup",
        description: "Review color variables and component styles",
        type: "STORY",
        priority: "MEDIUM",
        status: "TODO",
        assignee: "John Doe",
    },
    {
        id: "PS-125",
        _id: "PS-125",
        key: "PS-125",
        title: "Fix critical bug in payment processing",
        description: "Resolve gateway timeout issue during checkout",
        type: "BUG",
        priority: "HIGH",
        status: "IN_PROGRESS",
        assignee: "John Doe",
    },
];

const KanbanPage = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [activeFilter, setActiveFilter] = useState<"ALL" | "MY" | "RECENT">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState("");
    const [shareRole, setShareRole] = useState("viewer");
    const [shareSuccess, setShareSuccess] = useState(false);

    const [currentProjectName, setCurrentProjectName] = useState("Platform Services");

    // Listen for search queries dispatched by the Sidebar
    useEffect(() => {
        const handleSearch = (e: Event) => {
            const query = (e as CustomEvent<{ query: string }>).detail?.query ?? "";
            setSearchQuery(query);
        };
        window.addEventListener("issue_search", handleSearch);
        return () => window.removeEventListener("issue_search", handleSearch);
    }, []);

    useEffect(() => {
        const loadProject = () => {
            try {
                const stored = localStorage.getItem("jira_current_project");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed?.name) setCurrentProjectName(parsed.name);
                }
            } catch (e) {}
        };
        loadProject();
        window.addEventListener("project_changed", loadProject);
        return () => window.removeEventListener("project_changed", loadProject);
    }, []);

    const fetchIssues = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            setIsLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/api/issues`, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (response.ok) {
                const fetched: Issue[] =
                    data.data?.issues || data.issues || [];
                setIssues(fetched.length > 0 ? fetched : defaultSampleIssues);
            } else {
                setIssues(defaultSampleIssues);
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.warn("Fetch issues failed, showing sample data:", err);
            setIssues(defaultSampleIssues);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const updateIssueStatus = async (issueId: string, newStatus: string) => {
        try {
            // Update local state immediately for fast UI response
            setIssues((prev) =>
                prev.map((issue) => {
                    const currentId = issue._id || issue.id || issue.key;
                    if (currentId === issueId) {
                        return { ...issue, status: newStatus };
                    }
                    return issue;
                })
            );

            await fetch(`${API_URL}/api/issues/${issueId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (err) {
            console.error("Update issue status error:", err);
        }
    };

    const handleIssueCreated = (newIssue: Issue) => {
        setIssues((prev) => [newIssue, ...prev]);
        setShowCreateModal(false);
    };

    /** Called when a card is dropped onto a column */
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: string) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("text/plain");
        setDragOverColumn(null);
        if (!draggedId) return;

        // Find the dragged issue's current status
        const draggedIssue = issues.find(
            (iss) => (iss._id || iss.id || iss.key) === draggedId
        );
        // Skip if dropped on the same column
        if (!draggedIssue || draggedIssue.status === targetStatus) return;

        updateIssueStatus(draggedId, targetStatus);
    };

    const columns = [
        { id: "TODO", title: "TO DO" },
        { id: "IN_PROGRESS", title: "IN PROGRESS" },
        { id: "IN_REVIEW", title: "IN REVIEW" },
        { id: "DONE", title: "DONE" },
    ];

    const filteredIssues = issues.filter((issue) => {
        // ── "Only My Issues" filter ──────────────────────────────────────────
        if (activeFilter === "MY") {
            const assigneeName =
                typeof issue.assignee === "object"
                    ? issue.assignee?.name
                    : issue.assignee;
            const assigneeEmail =
                typeof issue.assignee === "object"
                    ? issue.assignee?.email
                    : undefined;

            const matchesUser =
                (user?.name && assigneeName?.toLowerCase() === user.name.toLowerCase()) ||
                (user?.email && assigneeEmail?.toLowerCase() === user.email.toLowerCase()) ||
                (user?.id && (issue as any).createdBy === user.id) ||
                (user?.id && (issue as any).reporterId === user.id);

            if (!matchesUser) return false;
        }

        // ── Search filter ────────────────────────────────────────────────────
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const titleMatch = issue.title?.toLowerCase().includes(q);
            const descMatch = issue.description?.toLowerCase().includes(q);
            const keyMatch = (issue.key || issue.id || issue._id)?.toLowerCase().includes(q);
            if (!titleMatch && !descMatch && !keyMatch) return false;
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">

            {/* Breadcrumb Navigation */}
            <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <span>Projects</span>
                    <span>&gt;</span>
                    <span className="font-medium text-gray-700">{currentProjectName}</span>
                    <span>&gt;</span>
                    <span className="font-semibold text-blue-600">Kanban Board</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setShowShareModal(true); setShareSuccess(false); setShareEmail(""); }}
                        className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-blue-400 transition"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                    </button>
                    <button className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
            </div>

            {/* Filter Row */}
            <div className="mb-8 flex flex-wrap items-center gap-4">

                {/* User Avatars Group */}
                <div className="flex items-center -space-x-2 overflow-hidden">
                    <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                        alt="Member"
                    />
                    <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                        alt="Member"
                    />
                    <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                        alt="Member"
                    />
                    <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                        alt="Member"
                    />
                </div>

                {/* Filter Pill Buttons */}
                <button
                    onClick={() => setActiveFilter(activeFilter === "MY" ? "ALL" : "MY")}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        activeFilter === "MY"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
                >
                    Only My Issues
                </button>

                <button
                    onClick={() => setActiveFilter(activeFilter === "RECENT" ? "ALL" : "RECENT")}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        activeFilter === "RECENT"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
                >
                    Recently Updated
                </button>
            </div>



            {/* Kanban Columns with Horizontal Scroll Support */}
            <div className="overflow-x-auto pb-6 -mx-2 px-2">
                <div className="flex gap-6 min-w-[1080px]">
                    {columns.map((column) => {
                        const columnIssues = filteredIssues.filter(
                            (issue) => issue.status === column.id
                        );
                        const isOver = dragOverColumn === column.id;

                        return (
                            <div
                                key={column.id}
                                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                                onDragEnter={(e) => { e.preventDefault(); setDragOverColumn(column.id); }}
                                onDragLeave={(e) => {
                                    // Only clear if we left the column entirely (not just a child)
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                        setDragOverColumn(null);
                                    }
                                }}
                                onDrop={(e) => handleDrop(e, column.id)}
                                className={`flex flex-col flex-1 min-w-[260px] rounded-xl p-3 min-h-[500px] transition-colors duration-150
                                    ${isOver
                                        ? "bg-blue-50 ring-2 ring-blue-400 ring-inset"
                                        : "bg-slate-100/80"
                                    }`}
                            >
                                {/* Column Header */}
                                <div className="mb-4 px-1 pt-1">
                                    <h2 className={`text-xs font-bold uppercase tracking-wider ${isOver ? "text-blue-600" : "text-gray-500"}`}>
                                        {column.title} ({columnIssues.length})
                                    </h2>
                                </div>

                                {/* Cards Area */}
                                <div className="flex flex-1 flex-col gap-3">
                                    {columnIssues.map((issue, index) => {
                                        const issueId =
                                            issue._id || issue.id || issue.key || `issue-${index}`;

                                        let assigneeName = "John Doe";
                                        if (typeof issue.assignee === "string") {
                                            assigneeName = issue.assignee;
                                        } else if (issue.assignee && typeof issue.assignee === "object") {
                                            assigneeName = issue.assignee.name || "John Doe";
                                        }

                                        return (
                                            <KanbanCard
                                                key={issueId}
                                                id={issueId}
                                                title={issue.title}
                                                description={issue.description}
                                                status={issue.status ?? "TODO"}
                                                type={issue.type || "TASK"}
                                                priority={issue.priority || "MEDIUM"}
                                                assignee={assigneeName}
                                                onStatusChange={(newStatus) =>
                                                    updateIssueStatus(issueId, newStatus)
                                                }
                                                dueDate={issue.dueDate}
                                                onClick={() => setSelectedIssue(issue)}
                                            />
                                        );
                                    })}

                                    {/* Drop zone when column is empty */}
                                    {columnIssues.length === 0 && (
                                        <div className={`flex flex-1 min-h-28 items-center justify-center rounded-lg border-2 border-dashed transition-colors
                                            ${isOver
                                                ? "border-blue-400 bg-blue-50/60"
                                                : "border-gray-300 bg-white/50"
                                            }`}
                                        >
                                            <p className={`text-xs font-medium ${isOver ? "text-blue-500" : "text-gray-400"}`}>
                                                {isOver ? "Drop here" : "No issues"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Issue Modal */}
            <CreateIssueModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                projectId={PROJECT_ID}
                onCreate={handleIssueCreated}
            />

            {/* Issue Details Modal */}
            {selectedIssue && (
                <IssueDetailsModel
                    issue={selectedIssue}
                    onClose={() => setSelectedIssue(null)}
                />
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Share Kanban Board</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Invite team members to view or edit this board</p>
                            </div>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            {shareSuccess ? (
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">Invitation sent!</p>
                                    <p className="text-xs text-gray-500 text-center">An invitation has been sent to <strong>{shareEmail}</strong></p>
                                    <button
                                        onClick={() => { setShareSuccess(false); setShareEmail(""); }}
                                        className="mt-2 text-xs font-medium text-blue-600 hover:underline"
                                    >
                                        Invite another person
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Current board link */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Board Link</label>
                                        <div className="flex gap-2">
                                            <input
                                                readOnly
                                                value={typeof window !== "undefined" ? window.location.href : ""}
                                                className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 outline-none"
                                            />
                                            <button
                                                onClick={() => { if (typeof window !== "undefined") navigator.clipboard.writeText(window.location.href); }}
                                                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email input */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Invite by Email</label>
                                        <input
                                            type="email"
                                            placeholder="e.g., colleague@example.com"
                                            value={shareEmail}
                                            onChange={(e) => setShareEmail(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Permission */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Permission</label>
                                        <select
                                            value={shareRole}
                                            onChange={(e) => setShareRole(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="viewer">Can View</option>
                                            <option value="editor">Can Edit</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            onClick={() => setShowShareModal(false)}
                                            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={!shareEmail.includes("@")}
                                            onClick={() => { if (shareEmail.includes("@")) setShareSuccess(true); }}
                                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        >
                                            Send Invite
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default KanbanPage;