"use client";

import React, { useState } from "react";
import {
    FolderKanban,
    Plus,
    Users,
    Calendar,
    MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Project {
    id: string;
    name: string;
    key: string;
    description: string;
    owner: string;
    members: number;
    createdAt: string;
}

const ProjectsPage = () => {
    const [showCreateProject, setShowCreateProject] = useState(false);

    const [projects, setProjects] = useState<Project[]>([
        {
            id: "proj-1",
            name: "Platform Services",
            key: "PS",
            description:
                "Core Platform infrastructure and Services",
            owner: "Naveen",
            members: 2,
            createdAt: "Aug 22, 2026",
        },
        {
            id: "proj-2",
            name: "Website Development",
            key: "WEB",
            description:
                "Website development and maintenance project",
            owner: "Naveen",
            members: 4,
            createdAt: "Aug 20, 2026",
        },
    ]);

    const [formData, setFormData] = useState({
        name: "",
        key: "",
        description: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateProject = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!formData.name || !formData.key) {
            return;
        }

        const newProject: Project = {
            id: `proj-${projects.length + 1}`,
            name: formData.name,
            key: formData.key.toUpperCase(),
            description:
                formData.description ||
                "No project description provided",
            owner: "Naveen",
            members: 1,
            createdAt: "Aug 22, 2026",
        };

        setProjects((prev) => [...prev, newProject]);

        setFormData({
            name: "",
            key: "",
            description: "",
        });

        setShowCreateProject(false);
    };

    return (
        <div className="min-h-screen bg-white">

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between px-8 py-6">

                    <div>
                        <h1 className="text-2xl font-semibold text-[#172B4D]">
                            Projects
                        </h1>

                        <p className="mt-1 text-sm text-[#6B778C]">
                            Manage your projects and team members
                        </p>
                    </div>

                    <Button
                        onClick={() =>
                            setShowCreateProject(true)
                        }
                        className="bg-[#0052CC] text-white hover:bg-[#0747A6]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                    </Button>

                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 py-6">

                {/* Search */}
                <div className="mb-6 max-w-md">
                    <Input
                        placeholder="Search projects..."
                        className="h-10 border-[#DFE1E6]"
                    />
                </div>

                {/* Project Count */}
                <div className="mb-4">
                    <p className="text-sm text-[#6B778C]">
                        {projects.length} Projects
                    </p>
                </div>

                {/* Project Cards */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="rounded-lg border border-[#DFE1E6] bg-white p-5 shadow-sm transition hover:border-[#B3D4FF] hover:shadow-md"
                        >

                            {/* Project Header */}
                            <div className="flex items-start justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#DEEBFF] text-[#0052CC]">
                                        <FolderKanban className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-[#172B4D]">
                                            {project.name}
                                        </h2>

                                        <p className="text-xs text-[#6B778C]">
                                            {project.key}
                                        </p>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="rounded-md p-1 text-[#6B778C] hover:bg-[#F4F5F7]"
                                >
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>

                            </div>

                            {/* Description */}
                            <p className="mt-4 min-h-10 text-sm text-[#6B778C]">
                                {project.description}
                            </p>

                            {/* Project Details */}
                            <div className="mt-5 space-y-3 border-t border-[#DFE1E6] pt-4">

                                <div className="flex items-center gap-2 text-sm text-[#6B778C]">
                                    <Users className="h-4 w-4" />
                                    <span>
                                        {project.members} members
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-[#6B778C]">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        Created {project.createdAt}
                                    </span>
                                </div>

                            </div>

                            {/* Open Project */}
                            <Button
                                variant="outline"
                                className="mt-5 w-full border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7]"
                            >
                                Open Project
                            </Button>

                        </div>
                    ))}

                </div>

            </div>

            {/* Create Project Modal */}
            {showCreateProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">

                        {/* Modal Header */}
                        <div className="border-b border-[#DFE1E6] px-6 py-5">

                            <h2 className="text-lg font-semibold text-[#172B4D]">
                                Create Project
                            </h2>

                            <p className="mt-1 text-sm text-[#6B778C]">
                                Create a new project to start managing your work.
                            </p>

                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleCreateProject}
                            className="space-y-5 px-6 py-6"
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
                                    placeholder="e.g. Platform Services"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

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
                                    placeholder="e.g. PS"
                                    value={formData.key}
                                    onChange={handleChange}
                                    maxLength={10}
                                    required
                                />

                                <p className="text-xs text-[#6B778C]">
                                    A short identifier for your project.
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

                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe your project..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-[#DFE1E6] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#6B778C] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                                />

                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 border-t border-[#DFE1E6] pt-5">

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setShowCreateProject(false)
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    className="bg-[#0052CC] text-white hover:bg-[#0747A6]"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Project
                                </Button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default ProjectsPage;