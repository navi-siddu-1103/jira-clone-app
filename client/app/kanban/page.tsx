"use client";

import React, { useEffect, useState } from "react";
import KanbanCard from "../../component/KanbanCard";

interface Assignee {
    _id: string;
    name: string;
    email: string;
}

interface Issue {
    _id?: string;
    id?: string;
    key?: string;
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    status: string;
    assignee?: string | Assignee | null;
    dueDate?: string;
    projectId?: string | object;
}

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const KanbanPage = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // FETCH ISSUES
    // ==========================================

    useEffect(() => {
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
                        data.message || "Failed to fetch issues"
                    );
                }

                console.log("Issues API response:", data);

                const fetchedIssues =
                    data.data?.issues ||
                    data.issues ||
                    [];

                setIssues(fetchedIssues);
            } catch (error) {
                console.error("Fetch issues error:", error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load issues"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchIssues();
    }, []);

    // ==========================================
    // UPDATE ISSUE STATUS
    // ==========================================

    const updateIssueStatus = async (
        issueId: string,
        newStatus: string
    ) => {
        try {
            const response = await fetch(
                `${API_URL}/api/issues/${issueId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
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

            // Update UI immediately
            setIssues((currentIssues) =>
                currentIssues.map((issue) =>
                    issue._id === issueId
                        ? {
                              ...issue,
                              status: newStatus,
                          }
                        : issue
                )
            );
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

    // ==========================================
    // KANBAN COLUMNS
    // ==========================================

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

    // ==========================================
    // LOADING
    // ==========================================

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

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="rounded-md bg-red-50 p-6">
                    <p className="text-red-500">
                        Failed to load issues: {error}
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // KANBAN BOARD
    // ==========================================

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Kanban Board
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage your project issues and track
                    their progress.
                </p>
            </div>

            {/* Board */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                {columns.map((column) => {

                    // Get issues for current column
                    const columnIssues = issues.filter(
                        (issue) =>
                            issue.status === column.id
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
                                    {columnIssues.length}
                                </span>

                            </div>

                            {/* Cards */}
                            <div className="flex min-h-32 flex-col gap-3">

                                {columnIssues.map(
                                    (issue, index) => {

                                        // Get proper issue ID
                                        const issueId =
                                            issue._id ||
                                            issue.id ||
                                            issue.key ||
                                            `issue-${index}`;

                                        // Get assignee name
                                        let assigneeName:
                                            | string
                                            | undefined;

                                        if (
                                            typeof issue.assignee ===
                                            "string"
                                        ) {
                                            assigneeName =
                                                issue.assignee;
                                        } else if (
                                            issue.assignee &&
                                            typeof issue.assignee ===
                                                "object"
                                        ) {
                                            assigneeName =
                                                issue.assignee.name;
                                        }

                                        return (
                                            <KanbanCard
                                                key={issueId}
                                                id={issueId}
                                                title={
                                                    issue.title
                                                }
                                                description={
                                                    issue.description
                                                }
                                                status={issue.status}
                                                type={
                                                    issue.type
                                                }
                                                priority={
                                                    issue.priority
                                                }
                                                assignee={
                                                    assigneeName
                                                }
                                                onStatusChange={(newStatus) =>
                                                    updateIssueStatus(issueId, newStatus)
                                                }
                                                dueDate={
                                                    issue.dueDate
                                                }
                                                onClick={() => {
                                                    console.log(
                                                        "Selected issue:",
                                                        issue
                                                    );
                                                }}
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
        </div>
    );
};

export default KanbanPage;