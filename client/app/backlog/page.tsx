"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
    Search,
    Plus,
    Bug,
    Bookmark,
    CheckSquare,
    User,
    MoreHorizontal,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CreateIssueModal from "@/components/CreateIssueModel";
import IssueDetailsModel from "@/components/IssueDetailsModel";

type Issue = {
    _id?: string;
    id?: string;
    key?: string;
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    status?: string;
    assignee?:
        | string
        | {
              _id?: string;
              name?: string;
              email?: string;
          }
        | null;
    dueDate?: string;
};

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace(/\/+$/, "");
const PROJECT_ID = "6a897d9ddfcfb80e0e7cf8ab";

const BacklogPage = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

    const fetchIssues = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/issues`);
            const data = await response.json();

            if (response.ok) {
                const fetched = data.data?.issues || data.issues || [];
                setIssues(fetched);
            }
        } catch (err) {
            console.error("Backlog fetch issues error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleIssueCreated = (newIssue: Issue) => {
        setIssues((prev) => [newIssue, ...prev]);
        setShowCreateIssueModal(false);
    };

    const filteredIssues = useMemo(() => {
        return issues.filter((issue) => {
            const assigneeName =
                typeof issue.assignee === "object"
                    ? issue.assignee?.name
                    : issue.assignee;
            const searchStr = `${issue.key || ""} ${issue.title || ""} ${
                issue.description || ""
            } ${assigneeName || ""}`.toLowerCase();
            return searchStr.includes(search.toLowerCase());
        });
    }, [issues, search]);

    const getIssueIcon = (type?: string) => {
        switch (type) {
            case "BUG":
                return <Bug className="h-4 w-4 text-red-500" />;
            case "STORY":
                return <Bookmark className="h-4 w-4 text-green-600" />;
            default:
                return <CheckSquare className="h-4 w-4 text-blue-600" />;
        }
    };

    const getPriorityStyle = (priority?: string) => {
        switch (priority) {
            case "HIGH":
            case "URGENT":
                return "bg-red-50 text-red-600";
            case "MEDIUM":
                return "bg-orange-50 text-orange-600";
            case "LOW":
                return "bg-green-50 text-green-600";
            default:
                return "bg-gray-50 text-gray-600";
        }
    };

    const getStatusStyle = (status?: string) => {
        switch (status) {
            case "TODO":
                return "bg-gray-100 text-gray-700";
            case "IN_PROGRESS":
                return "bg-blue-50 text-blue-600";
            case "IN_REVIEW":
                return "bg-purple-50 text-purple-600";
            case "DONE":
                return "bg-green-50 text-green-600";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatStatus = (status?: string) => {
        switch (status) {
            case "TODO":
                return "To Do";
            case "IN_PROGRESS":
                return "In Progress";
            case "IN_REVIEW":
                return "In Review";
            case "DONE":
                return "Done";
            default:
                return status || "To Do";
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F8FA]">

            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-8 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#172B4D]">
                            Backlog
                        </h1>
                        <p className="mt-1 text-sm text-[#6B778C]">
                            Manage and prioritize your project issues
                        </p>
                    </div>

                    <Button
                        onClick={() => setShowCreateIssueModal(true)}
                        className="bg-[#0052CC] text-white hover:bg-[#0747A6]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Issue
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="border-b border-gray-200 bg-white px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        />
                        <Input
                            placeholder="Search backlog..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white pl-9"
                        />
                    </div>

                    <div className="ml-4 text-sm text-[#6B778C]">
                        {filteredIssues.length} issues
                    </div>
                </div>
            </div>

            {/* Backlog Content */}
            <div className="p-8">
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">

                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-semibold text-[#172B4D]">
                                All Issues
                            </h2>
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                {filteredIssues.length}
                            </span>
                        </div>

                        <button
                            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                            onClick={() => fetchIssues()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Issues List */}
                    <div>
                        {isLoading ? (
                            <div className="flex min-h-40 items-center justify-center">
                                <p className="text-sm text-gray-500">Loading backlog...</p>
                            </div>
                        ) : filteredIssues.length === 0 ? (
                            <div className="flex min-h-40 items-center justify-center p-8 text-center">
                                <div>
                                    <p className="text-sm text-gray-500">No issues found in backlog</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCreateIssueModal(true)}
                                        className="mt-3 text-xs"
                                    >
                                        <Plus className="mr-1 h-3.5 w-3.5" /> Create New Issue
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            filteredIssues.map((issue, idx) => {
                                const issueId = issue._id || issue.id || issue.key || `issue-${idx}`;
                                const assigneeName =
                                    typeof issue.assignee === "object"
                                        ? issue.assignee?.name
                                        : issue.assignee || "Unassigned";

                                return (
                                    <div
                                        key={issueId}
                                        onClick={() => setSelectedIssue(issue)}
                                        className="flex cursor-pointer items-center gap-4 border-b border-gray-100 px-6 py-4 transition last:border-b-0 hover:bg-gray-50"
                                    >
                                        {/* Issue Type */}
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50">
                                            {getIssueIcon(issue.type)}
                                        </div>

                                        {/* Issue Details */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono font-medium text-[#0052CC]">
                                                    {issueId.slice(-6).toUpperCase()}
                                                </span>
                                                <h3 className="truncate text-sm font-medium text-[#172B4D]">
                                                    {issue.title}
                                                </h3>
                                            </div>

                                            <p className="mt-1 truncate text-xs text-[#6B778C]">
                                                {issue.description || "No description"}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <span
                                            className={`hidden rounded-full px-3 py-1 text-xs font-medium md:inline-block ${getStatusStyle(
                                                issue.status
                                            )}`}
                                        >
                                            {formatStatus(issue.status)}
                                        </span>

                                        {/* Priority */}
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                                                issue.priority
                                            )}`}
                                        >
                                            {issue.priority || "MEDIUM"}
                                        </span>

                                        {/* Assignee */}
                                        <div className="hidden items-center gap-2 text-xs text-[#6B778C] sm:flex">
                                            <User className="h-4 w-4" />
                                            <span>{assigneeName}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Create Issue Modal */}
            <CreateIssueModal
                isOpen={showCreateIssueModal}
                onClose={() => setShowCreateIssueModal(false)}
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

export default BacklogPage;