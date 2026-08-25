"use client";

import React, { useEffect, useState } from "react";
import KanbanCard from "@/components/KanbanCard";
import { Share2, MoreHorizontal, Plus } from "lucide-react";
import CreateIssueModal from "@/components/CreateIssueModel";
import IssueDetailsModel from "@/components/IssueDetailsModel";
import type { Issue } from "@/types";


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

const HomePage = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [activeFilter, setActiveFilter] = useState<"ALL" | "MY" | "RECENT">("ALL");

    const [currentProjectName, setCurrentProjectName] = useState("Platform Services");

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
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for cold Render starts

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
                // Always use real data if available, otherwise sample issues
                setIssues(fetched.length > 0 ? fetched : defaultSampleIssues);
            } else {
                setIssues(defaultSampleIssues);
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.warn("Fetch issues failed, showing sample data:", err);
            // Never show an error state — always render sample issues
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

    const columns = [
        { id: "TODO", title: "TO DO" },
        { id: "IN_PROGRESS", title: "IN PROGRESS" },
        { id: "IN_REVIEW", title: "IN REVIEW" },
        { id: "DONE", title: "DONE" },
    ];

    const filteredIssues = issues.filter((issue) => {
        if (activeFilter === "MY") {
            const assigneeName = typeof issue.assignee === "object" ? issue.assignee?.name : issue.assignee;
            return assigneeName === "John Doe" || assigneeName === "Naveen";
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
                    <button className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700">
                        <Share2 className="h-4 w-4" />
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

                        return (
                            <div
                                key={column.id}
                                className="flex flex-col flex-1 min-w-[260px] rounded-xl bg-slate-100/80 p-3 min-h-[500px]"
                            >
                                {/* Column Header */}
                                <div className="mb-4 px-1 pt-1">
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
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

                                    {columnIssues.length === 0 && (
                                        <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white/50">
                                            <p className="text-xs text-gray-400">No issues</p>
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

        </div>
    );
};

export default HomePage;