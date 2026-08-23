"use client";

import React, { useEffect, useState } from "react";

import KanbanCard from "@/components/KanbanCard";
import CreateIssueModal from "@/components/CreateIssueModel";
import IssueDetailsModel from "@/components/IssueDetailsModel";

import { Plus } from "lucide-react";

interface Issue {
    _id?: string;
    id?: string;
    key?: string;

    title: string;
    description?: string;
    type?: string;
    priority?: string;
    status: string;

    projectId?: string;

    assignee?:
        | string
        | {
              _id: string;
              name: string;
              email: string;
          };

    dueDate?: string;
}

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

const PROJECT_ID = "6a897d9ddfcfb80e0e7cf8ab";

const columns = [
    {
        id: "TODO",
        title: "To Do",
    },
    {
        id: "IN_PROGRESS",
        title: "In Progress",
    },
    {
        id: "IN_REVIEW",
        title: "In Review",
    },
    {
        id: "DONE",
        title: "Done",
    },
];

const KanbanPage = () => {
    // ============================================
    // STATE
    // ============================================

    const [issues, setIssues] = useState<Issue[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] = useState("");

    const [showCreateIssueModal, setShowCreateIssueModal] =
        useState(false);

    // Selected issue for Issue Details Modal
    const [selectedIssue, setSelectedIssue] =
        useState<Issue | null>(null);

    // ============================================
    // FETCH ISSUES
    // ============================================

    const fetchIssues = async () => {
        try {
            setIsLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/issues`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to fetch issues"
                );
            }

            console.log(
                "Issues API response:",
                data
            );

            const fetchedIssues =
                data.data?.issues ||
                data.issues ||
                [];

            setIssues(fetchedIssues);
        } catch (error) {
            console.error(
                "Fetch issues error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load issues"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // INITIAL LOAD
    // ============================================

    useEffect(() => {
        fetchIssues();
    }, []);

    // ============================================
    // CREATE ISSUE SUCCESS
    // ============================================

    const handleIssueCreated = (
        newIssue: Issue
    ) => {
        console.log(
            "New issue created:",
            newIssue
        );

        setIssues((currentIssues) => [
            newIssue,
            ...currentIssues,
        ]);

        setShowCreateIssueModal(false);
    };

    // ============================================
    // UPDATE ISSUE STATUS
    // ============================================

    const updateIssueStatus = async (
        issueId: string,
        newStatus: string
    ) => {
        try {
            console.log(
                "Updating issue status:",
                issueId,
                newStatus
            );

            const response = await fetch(
                `${API_URL}/api/issues/${issueId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update issue status"
                );
            }

            console.log(
                "Issue status updated:",
                data
            );

            // Update issue on board
            setIssues((currentIssues) =>
                currentIssues.map((issue) => {
                    const currentIssueId =
                        issue._id ||
                        issue.id ||
                        issue.key ||
                        "";

                    if (
                        currentIssueId ===
                        issueId
                    ) {
                        return {
                            ...issue,
                            status: newStatus,
                        };
                    }

                    return issue;
                })
            );

            // Update selected issue if modal is open
            setSelectedIssue((currentIssue) => {
                if (!currentIssue) {
                    return currentIssue;
                }

                const currentIssueId =
                    currentIssue._id ||
                    currentIssue.id ||
                    currentIssue.key ||
                    "";

                if (
                    currentIssueId !==
                    issueId
                ) {
                    return currentIssue;
                }

                return {
                    ...currentIssue,
                    status: newStatus,
                };
            });
        } catch (error) {
            console.error(
                "Update issue status error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update issue status"
            );
        }
    };

    // ============================================
    // OPEN ISSUE DETAILS
    // ============================================

    const handleIssueClick = (
        issue: Issue
    ) => {
        console.log(
            "OPENING ISSUE:",
            issue
        );

        setSelectedIssue(issue);
    };

    // ============================================
    // LOADING
    // ============================================

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="p-8">
                    <p className="text-gray-500">
                        Loading issues...
                    </p>
                </div>
            </div>
        );
    }

    // ============================================
    // ERROR
    // ============================================

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="p-8">
                    <p className="text-red-500">
                        Failed to load issues:{" "}
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchIssues}
                        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ============================================
    // PAGE
    // ============================================

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* ========================================
                HEADER
            ======================================== */}

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Kanban Board
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your project issues and
                        track their progress.
                    </p>
                </div>

                {/* Create Issue Button */}

                <button
                    type="button"
                    onClick={() =>
                        setShowCreateIssueModal(true)
                    }
                    className="flex items-center gap-2 rounded-md bg-[#0052CC] px-4 py-2 text-sm font-medium text-white hover:bg-[#0747A6]"
                >
                    <Plus className="h-4 w-4" />

                    Create Issue
                </button>
            </div>

            {/* ========================================
                KANBAN BOARD
            ======================================== */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                {columns.map((column) => {
                    const columnIssues =
                        issues.filter(
                            (issue) =>
                                issue.status ===
                                column.id
                        );

                    return (
                        <div
                            key={column.id}
                            className="rounded-lg bg-gray-100 p-3"
                        >
                            {/* Column Header */}

                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-700">
                                    {column.title}
                                </h2>

                                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-500">
                                    {
                                        columnIssues.length
                                    }
                                </span>
                            </div>

                            {/* Cards */}

                            <div className="flex min-h-32 flex-col gap-3">

                                {columnIssues.map(
                                    (issue) => {
                                        const issueId =
                                            issue._id ||
                                            issue.id ||
                                            issue.key ||
                                            "";

                                        return (
                                            <KanbanCard
                                                key={
                                                    issueId
                                                }

                                                id={
                                                    issueId
                                                }

                                                title={
                                                    issue.title
                                                }

                                                description={
                                                    issue.description
                                                }

                                                type={
                                                    issue.type
                                                }

                                                priority={
                                                    issue.priority
                                                }

                                                status={
                                                    issue.status
                                                }

                                                assignee={
                                                    typeof issue.assignee ===
                                                    "object"
                                                        ? issue
                                                              .assignee
                                                              ?.name
                                                        : issue.assignee
                                                }

                                                dueDate={
                                                    issue.dueDate
                                                }

                                                onStatusChange={(
                                                    newStatus
                                                ) =>
                                                    updateIssueStatus(
                                                        issueId,
                                                        newStatus
                                                    )
                                                }

                                                onClick={() =>
                                                    handleIssueClick(
                                                        issue
                                                    )
                                                }
                                            />
                                        );
                                    }
                                )}

                                {/* Empty Column */}

                                {columnIssues.length ===
                                    0 && (
                                    <div className="flex min-h-24 items-center justify-center rounded-md border-2 border-dashed border-gray-300">
                                        <p className="text-xs text-gray-400">
                                            No issues
                                        </p>
                                    </div>
                                )}

                            </div>
                        </div>
                    );
                })}

            </div>

            {/* ========================================
                CREATE ISSUE MODAL
            ======================================== */}

            <CreateIssueModal
                isOpen={
                    showCreateIssueModal
                }

                onClose={() =>
                    setShowCreateIssueModal(
                        false
                    )
                }

                projectId={
                    PROJECT_ID
                }

                onCreate={
                    handleIssueCreated
                }
            />

            {/* ========================================
                ISSUE DETAILS MODAL
            ======================================== */}

            {selectedIssue && (
                <IssueDetailsModel
                    issue={
                        selectedIssue
                    }

                    onClose={() =>
                        setSelectedIssue(null)
                    }
                />
            )}

        </div>
    );
};

export default KanbanPage;