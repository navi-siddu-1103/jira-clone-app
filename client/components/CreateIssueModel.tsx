"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type { Issue } from "@/types";

interface CreateIssueModelProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onCreate?: (issue: Issue) => void;
}

const rawApiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_URL = rawApiUrl.replace(/\/+$/, "");

const CreateIssuemodel = ({
    isOpen,
    onClose,
    projectId,
    onCreate,
}: CreateIssueModelProps) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "TASK",
        priority: "MEDIUM",
        assigneeId: "",
        dueDate: "",
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate project
        if (!projectId) {
            setError("Project is required.");
            return;
        }

        // Validate title
        if (!formData.title.trim()) {
            setError("Please enter an issue title.");
            return;
        }

        // Validate description
        if (!formData.description.trim()) {
            setError("Please enter an issue description.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Prepare request body for backend
            const issueData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                type: formData.type,
                priority: formData.priority,
                projectId: projectId,
                assignee: formData.assigneeId.trim()
                    ? formData.assigneeId.trim()
                    : undefined,
                dueDate: formData.dueDate
                    ? new Date(
                          `${formData.dueDate}T00:00:00.000Z`
                      ).toISOString()
                    : undefined,
            };

            console.log("Creating issue with data:", issueData);

            const response = await fetch(`${API_URL}/api/issues`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(issueData),
            });

            const data = await response.json();

            console.log("Create issue API response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create issue"
                );
            }

            // Get created issue from backend response
            const createdIssue = data.data?.issue;

            console.log("Issue created successfully:", createdIssue);

            // Send created issue to parent
            onCreate?.(createdIssue);

            // Reset form
            setFormData({
                title: "",
                description: "",
                type: "TASK",
                priority: "MEDIUM",
                assigneeId: "",
                dueDate: "",
            });

            setError("");

            // Close modal
            onClose();
        } catch (error) {
            console.error("Create issue error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Create Issue
                        </h2>

                        <p className="text-sm text-gray-500">
                            Create a new issue for your project
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 px-6 py-5"
                >
                    {/* Error */}
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                            <p className="text-sm text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Issue Title */}
                    <div className="space-y-2">
                        <label
                            htmlFor="title"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Issue Title *
                        </label>

                        <Input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g. Implement user authentication"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label
                            htmlFor="description"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Description *
                        </label>

                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe the issue..."
                            value={formData.description}
                            onChange={handleChange}
                            className="min-h-25"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <label
                            htmlFor="type"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Issue Type
                        </label>

                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="TASK">Task</option>
                            <option value="BUG">Bug</option>
                            <option value="STORY">Story</option>
                            <option value="EPIC">Epic</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <label
                            htmlFor="priority"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Priority
                        </label>

                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>

                    {/* Assignee */}
                    <div className="space-y-2">
                        <label
                            htmlFor="assigneeId"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Assignee ID
                        </label>

                        <Input
                            id="assigneeId"
                            name="assigneeId"
                            type="text"
                            placeholder="Enter MongoDB user ID"
                            value={formData.assigneeId}
                            onChange={handleChange}
                            disabled={isLoading}
                        />

                        <p className="text-xs text-gray-500">
                            Example: 6a897ab2d47f8ac3488c90e6
                        </p>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <label
                            htmlFor="dueDate"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Due Date
                        </label>

                        <Input
                            id="dueDate"
                            name="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#0052CC] text-white hover:bg-[#0747A6]"
                        >
                            {isLoading
                                ? "Creating..."
                                : "Create Issue"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIssuemodel;