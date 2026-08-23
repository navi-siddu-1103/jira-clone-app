"use client";

import React, { useMemo, useState } from "react";

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

type Issue = {
    id: string;
    key: string;
    title: string;
    description: string;
    type: "TASK" | "BUG" | "STORY";
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    assignee: string;
};


const BacklogPage = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const filteredIssues = useMemo(() => {
        return issues.filter((issue) =>
            `${issue.key} ${issue.title} ${issue.description} ${issue.assignee}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [issues, search]);

    const getIssueIcon = (type: Issue["type"]) => {
        switch (type) {
            case "BUG":
                return (
                    <Bug className="h-4 w-4 text-red-500" />
                );

            case "STORY":
                return (
                    <Bookmark className="h-4 w-4 text-green-600" />
                );

            default:
                return (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                );
        }
    };

    const getPriorityStyle = (
        priority: Issue["priority"]
    ) => {
        switch (priority) {
            case "HIGH":
                return "bg-red-50 text-red-600";

            case "MEDIUM":
                return "bg-orange-50 text-orange-600";

            case "LOW":
                return "bg-green-50 text-green-600";

            default:
                return "bg-gray-50 text-gray-600";
        }
    };

    const getStatusStyle = (
        status: Issue["status"]
    ) => {
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

    const formatStatus = (status: Issue["status"]) => {
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
                return status;
        }
    };

    const handleCreateIssue = () => {
        console.log("Create Issue clicked");
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
                        onClick={handleCreateIssue}
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
                            className="absolute left-3 top-1/2
                            h-4 w-4 -translate-y-1/2 text-gray-400"
                        />

                        <Input
                            placeholder="Search backlog..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
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

                <div className="rounded-lg border border-gray-200 bg-white">

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
                            onClick={() =>
                                console.log("Backlog menu")
                            }
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>

                    </div>

                    {/* Issues */}
                    <div>

                        {filteredIssues.length === 0 ? (

                            <div className="flex min-h-40 items-center justify-center">

                                <p className="text-sm text-gray-500">
                                    No issues found
                                </p>

                            </div>

                        ) : (

                            filteredIssues.map((issue) => (

                                <div
                                    key={issue.id}
                                    className="flex items-center gap-4 border-b
                                    border-gray-100 px-6 py-4 transition
                                    last:border-b-0 hover:bg-gray-50"
                                >

                                    {/* Issue Type */}
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50">
                                        {getIssueIcon(issue.type)}
                                    </div>

                                    {/* Issue Details */}
                                    <div className="min-w-0 flex-1">

                                        <div className="flex items-center gap-2">

                                            <span className="text-xs font-medium text-[#0052CC]">
                                                {issue.key}
                                            </span>

                                            <h3 className="truncate text-sm font-medium text-[#172B4D]">
                                                {issue.title}
                                            </h3>

                                        </div>

                                        <p className="mt-1 truncate text-xs text-[#6B778C]">
                                            {issue.description}
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
                                        {issue.priority}
                                    </span>

                                    {/* Assignee */}
                                    <div className="hidden items-center gap-2 text-xs text-[#6B778C] sm:flex">

                                        <User className="h-4 w-4" />

                                        <span>
                                            {issue.assignee}
                                        </span>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default BacklogPage;