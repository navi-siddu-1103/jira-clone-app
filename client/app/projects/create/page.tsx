"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const CreateProjectPage = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        key: "",
        description: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");

        if (!formData.name.trim()) {
            setError("Project name is required");
            return;
        }

        if (!formData.key.trim()) {
            setError("Project key is required");
            return;
        }

        if (formData.key.length > 10) {
            setError("Project key must be 10 characters or less");
            return;
        }

        setIsLoading(true);

        try {
            // Backend API will be connected later
            console.log("Project data:", formData);

            // Temporary navigation
            router.push("/projects");
        } catch (error) {
            console.error(error);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">

            {/* Header */}
            <div className="border-b border-gray-200 px-8 py-5">
                <button
                    onClick={() => router.push("/projects")}
                    className="mb-4 flex items-center gap-2 text-sm text-[#6B778C] hover:text-[#0052CC]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Projects
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#DEEBFF]">
                        <FolderKanban className="h-5 w-5 text-[#0052CC]" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold text-[#172B4D]">
                            Create Project
                        </h1>

                        <p className="text-sm text-[#6B778C]">
                            Create a new project to start managing your work
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="px-8 py-8">

                <div className="mx-auto max-w-2xl">

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >

                            {/* Project Name */}
                            <div className="space-y-2">

                                <label
                                    htmlFor="name"
                                    className="text-sm font-semibold text-[#172B4D]"
                                >
                                    Project Name *
                                </label>

                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="e.g., Platform Services"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="h-10"
                                />

                                <p className="text-xs text-[#6B778C]">
                                    Give your project a clear and meaningful name.
                                </p>

                            </div>

                            {/* Project Key */}
                            <div className="space-y-2">

                                <label
                                    htmlFor="key"
                                    className="text-sm font-semibold text-[#172B4D]"
                                >
                                    Project Key *
                                </label>

                                <Input
                                    id="key"
                                    name="key"
                                    type="text"
                                    placeholder="e.g., PS"
                                    value={formData.key}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            key: e.target.value.toUpperCase(),
                                        }))
                                    }
                                    required
                                    maxLength={10}
                                    className="h-10 uppercase"
                                />

                                <p className="text-xs text-[#6B778C]">
                                    A short identifier used for your project issues.
                                    Example: PS-101.
                                </p>

                            </div>

                            {/* Description */}
                            <div className="space-y-2">

                                <label
                                    htmlFor="description"
                                    className="text-sm font-semibold text-[#172B4D]"
                                >
                                    Description
                                </label>

                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe what this project is about..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="min-h-[120px] resize-none"
                                />

                            </div>

                            {/* Error */}
                            {error && (
                                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.push("/projects")}
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
                                        : "Create Project"}
                                </Button>

                            </div>

                        </form>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default CreateProjectPage;