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

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace(/\/+$/, "");

/* Assignee options */
const ASSIGNEE_OPTIONS = [
    { value: "", label: "Unassigned" },
    { value: "Test", label: "Test" },
    { value: "Sample", label: "Sample" },
];

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
        assignee: "",
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectId) { setError("Project is required."); return; }
        if (!formData.title.trim()) { setError("Please enter an issue title."); return; }

        setIsLoading(true);
        setError("");

        try {
            const issueData = {
                title: formData.title.trim(),
                description: formData.description.trim() || formData.title.trim(),
                type: formData.type,
                priority: formData.priority,
                projectId,
                assignee: formData.assignee || undefined,
            };

            const response = await fetch(`${API_URL}/api/issues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(issueData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create issue");
            }

            const createdIssue = data.data?.issue;
            onCreate?.(createdIssue);

            setFormData({ title: "", description: "", type: "TASK", priority: "MEDIUM", assignee: "" });
            setError("");
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const selectCls =
        "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Create Issue</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                    {/* Error */}
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Issue Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-semibold text-gray-700">
                            Issue Title *
                        </label>
                        <Input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g., Implement user authentication"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-semibold text-gray-700">
                            Description
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Add a description (optional)"
                            value={formData.description}
                            onChange={handleChange}
                            className="min-h-[96px] resize-none"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Type · Priority · Assignee — 3 columns */}
                    <div className="grid grid-cols-3 gap-4">

                        {/* Type */}
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-semibold text-gray-700">
                                Type
                            </label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange} disabled={isLoading} className={selectCls}>
                                <option value="TASK">Task</option>
                                <option value="BUG">Bug</option>
                                <option value="STORY">Story</option>
                                <option value="EPIC">Epic</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label htmlFor="priority" className="text-sm font-semibold text-gray-700">
                                Priority
                            </label>
                            <select id="priority" name="priority" value={formData.priority} onChange={handleChange} disabled={isLoading} className={selectCls}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        {/* Assignee */}
                        <div className="space-y-2">
                            <label htmlFor="assignee" className="text-sm font-semibold text-gray-700">
                                Assignee
                            </label>
                            <select id="assignee" name="assignee" value={formData.assignee} onChange={handleChange} disabled={isLoading} className={selectCls}>
                                {ASSIGNEE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#0052CC] text-white hover:bg-[#0747A6]">
                            {isLoading ? "Creating…" : "Create Issue"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIssuemodel;