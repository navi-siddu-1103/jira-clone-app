"use client";

import React from "react";

import {
    X,
    User,
    CalendarDays,
    CircleDot,
} from "lucide-react";

interface Issue {
    _id?: string;
    id?: string;
    key?: string;
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    status: string;
    assignee?:
        | string
        | {
              _id: string;
              name: string;
              email: string;
          };
    dueDate?: string;
}

interface IssueDetailsModalProps {
    issue: Issue;
    onClose: () => void;
}

const IssueDetailsModal = ({
    issue,
    onClose,
}: IssueDetailsModalProps) => {
    const issueId =
        issue._id ||
        issue.id ||
        issue.key ||
        "";

    const assigneeName =
        typeof issue.assignee === "object"
            ? issue.assignee?.name
            : issue.assignee;

    const assigneeEmail =
        typeof issue.assignee === "object"
            ? issue.assignee?.email
            : undefined;

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

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-medium text-gray-400">
                            {issueId}
                        </p>

                        <h2 className="text-xl font-bold text-gray-900">
                            {issue.title}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Issue Details
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-4 rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[70vh] overflow-y-auto space-y-6 px-6 py-6">

                    {/* Description */}
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-gray-700">
                            Description
                        </h3>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm leading-6 text-gray-600">
                                {issue.description ||
                                    "No description provided."}
                            </p>
                        </div>
                    </div>

                    {/* Type / Priority / Status */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">
                                Issue Type
                            </p>

                            <span
                                className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold ${
                                    typeStyles[
                                        issue.type || "TASK"
                                    ] ||
                                    "bg-gray-50 text-gray-700"
                                }`}
                            >
                                {issue.type || "TASK"}
                            </span>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">
                                Priority
                            </p>

                            <span
                                className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold ${
                                    priorityStyles[
                                        issue.priority || "MEDIUM"
                                    ] ||
                                    "bg-gray-50 text-gray-700"
                                }`}
                            >
                                {issue.priority || "MEDIUM"}
                            </span>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-medium text-gray-500">
                                Status
                            </p>

                            <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                                <CircleDot className="h-3.5 w-3.5" />

                                {statusLabels[issue.status] ||
                                    issue.status}
                            </span>
                        </div>
                    </div>

                    {/* Assignee / Due Date */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {/* Assignee */}
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />

                                <h3 className="text-sm font-semibold text-gray-700">
                                    Assignee
                                </h3>
                            </div>

                            {assigneeName ? (
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {assigneeName}
                                    </p>

                                    {assigneeEmail && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {assigneeEmail}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">
                                    Unassigned
                                </p>
                            )}
                        </div>

                        {/* Due Date */}
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-gray-500" />

                                <h3 className="text-sm font-semibold text-gray-700">
                                    Due Date
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600">
                                {issue.dueDate
                                    ? new Date(
                                          issue.dueDate
                                      ).toLocaleDateString(
                                          "en-GB"
                                      )
                                    : "No due date"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-gray-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IssueDetailsModal;