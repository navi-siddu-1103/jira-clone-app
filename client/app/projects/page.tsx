"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    FolderKanban,
    Plus,
    Search,
    Users,
    MoreHorizontal,
    X,
    Edit3,
    Eye,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

interface Project {
    _id?: string;
    id?: string;
    name: string;
    key: string;
    description?: string;
    owner?: string;
    members?: number;
    avatar?: string;
    createdAt?: string;
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace(/\/+$/, "");

const ProjectsPage = () => {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Selected project for Details Modal
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Editing project for Edit Modal
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editFormData, setEditFormData] = useState({ name: "", key: "", description: "" });
    const [isUpdating, setIsUpdating] = useState(false);
    const [editError, setEditError] = useState("");

    // Dropdown menu state keyed by project ID
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const initialProjects: Project[] = [
        {
            id: "6a897d9ddfcfb80e0e7cf8ab",
            _id: "6a897d9ddfcfb80e0e7cf8ab",
            name: "Platform Services",
            key: "PS",
            description: "Core Platform infrastructure and Services",
            owner: "Naveen",
            members: 2,
            avatar: "https://i.pravatar.cc/150?u=naveen",
        },
        {
            id: "proj-2",
            _id: "proj-2",
            name: "Website Development",
            key: "WD",
            description: "Development and maintenance of company website",
            owner: "John",
            members: 4,
            avatar: "https://i.pravatar.cc/150?u=john",
        },
        {
            id: "proj-3",
            _id: "proj-3",
            name: "Mobile Application",
            key: "MA",
            description: "Mobile application development project",
            owner: "David",
            members: 5,
            avatar: "https://i.pravatar.cc/150?u=david",
        },
    ];

    const fetchProjects = async () => {
        let customList: Project[] = [];
        try {
            const stored = localStorage.getItem("jira_custom_projects");
            if (stored) customList = JSON.parse(stored);
        } catch (e) {}

        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/projects`);
            const data = await response.json();

            if (response.ok && data.data?.projects && data.data.projects.length > 0) {
                const map = new Map<string, Project>();
                initialProjects.forEach((p) => map.set(p.key, p));
                data.data.projects.forEach((p: Project) => map.set(p.key, p));
                customList.forEach((p) => map.set(p.key, p));
                setProjects(Array.from(map.values()));
            } else {
                const map = new Map<string, Project>();
                initialProjects.forEach((p) => map.set(p.key, p));
                customList.forEach((p) => map.set(p.key, p));
                setProjects(Array.from(map.values()));
            }
        } catch (err) {
            console.error("Fetch projects error:", err);
            const map = new Map<string, Project>();
            initialProjects.forEach((p) => map.set(p.key, p));
            customList.forEach((p) => map.set(p.key, p));
            setProjects(Array.from(map.values()));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
        const handleEvent = () => fetchProjects();
        window.addEventListener("project_created", handleEvent);
        return () => window.removeEventListener("project_created", handleEvent);
    }, []);


    const filteredProjects = projects.filter((project) =>
        `${project.name} ${project.key} ${project.description || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const handleOpenEditModal = (project: Project) => {
        setEditingProject(project);
        setEditFormData({
            name: project.name || "",
            key: project.key || "",
            description: project.description || "",
        });
        setEditError("");
        setActiveMenuId(null);
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;

        const pId = editingProject._id || editingProject.id;
        if (!pId) return;

        setIsUpdating(true);
        setEditError("");

        try {
            const response = await fetch(`${API_URL}/api/projects/${pId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to update project");
            }

            // Update UI list
            setProjects((prev) =>
                prev.map((p) => {
                    const currentId = p._id || p.id;
                    if (currentId === pId) {
                        return {
                            ...p,
                            name: editFormData.name,
                            key: editFormData.key,
                            description: editFormData.description,
                        };
                    }
                    return p;
                })
            );

            setEditingProject(null);
        } catch (err) {
            console.error("Update project error:", err);
            setEditError(err instanceof Error ? err.message : "Failed to update project");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F8FA]">

            {/* Header */}
            <div className="border-b bg-white px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#172B4D]">
                            Projects
                        </h1>
                        <p className="mt-1 text-sm text-[#6B778C]">
                            Manage and organize your projects
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push("/projects/create")}
                        className="bg-[#0052CC] hover:bg-[#0747A6]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8">

                {/* Search Toolbar */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white pl-9"
                        />
                    </div>

                    <div className="ml-4 text-sm text-[#6B778C]">
                        {filteredProjects.length} projects
                    </div>
                </div>

                {/* Projects List */}
                {isLoading ? (
                    <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-white">
                        <p className="text-sm text-gray-500">Loading projects...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-white">
                        <div className="text-center">
                            <FolderKanban className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                            <h2 className="text-lg font-medium text-[#172B4D]">
                                No projects found
                            </h2>
                            <p className="mt-1 text-sm text-[#6B778C]">
                                Try searching with a different name or create a new project.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredProjects.map((project) => {
                            const pId = project._id || project.id || project.key;
                            const ownerName = project.owner || "Naveen";

                            return (
                                <Card
                                    key={pId}
                                    className="relative bg-white transition-shadow hover:shadow-md"
                                >
                                    {/* Card Header */}
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#DEEBFF] text-[#0052CC]">
                                                    <FolderKanban className="h-5 w-5" />
                                                </div>

                                                <div>
                                                    <CardTitle className="text-base text-[#172B4D]">
                                                        {project.name}
                                                    </CardTitle>
                                                    <p className="mt-1 text-xs text-[#6B778C]">
                                                        {project.key}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Three Dots Menu Button */}
                                            <div className="relative">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        setActiveMenuId(activeMenuId === pId ? null : pId)
                                                    }
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>

                                                {/* Dropdown Menu */}
                                                {activeMenuId === pId && (
                                                    <div className="absolute right-0 top-9 z-20 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedProject(project);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            View Details
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(project)}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                            Edit Project
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {/* Card Content */}
                                    <CardContent>
                                        <p className="mb-5 min-h-[40px] text-sm text-[#6B778C]">
                                            {project.description || "No description provided."}
                                        </p>

                                        <div className="flex items-center justify-between border-t pt-4">
                                            {/* Owner */}
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarImage
                                                        src={project.avatar || "https://i.pravatar.cc/150?u=naveen"}
                                                        alt={ownerName}
                                                    />
                                                    <AvatarFallback>
                                                        {ownerName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div>
                                                    <p className="text-xs text-[#6B778C]">Owner</p>
                                                    <p className="text-sm font-medium text-[#172B4D]">
                                                        {ownerName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Members */}
                                            <div className="flex items-center gap-1 text-sm text-[#6B778C]">
                                                <Users className="h-4 w-4" />
                                                {project.members || 2}
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                try {
                                                    localStorage.setItem("jira_current_project", JSON.stringify(project));
                                                    window.dispatchEvent(new Event("project_changed"));
                                                } catch (e) {}
                                                router.push("/kanban");
                                            }}
                                            className="mt-5 w-full"
                                        >
                                            Open Project
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ===================================================
                PROJECT DETAILS MODAL
            =================================================== */}
            {selectedProject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedProject(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#DEEBFF] text-[#0052CC]">
                                    <FolderKanban className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#172B4D]">
                                        {selectedProject.name}
                                    </h2>
                                    <p className="text-xs font-semibold text-blue-600">
                                        Key: {selectedProject.key}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProject(null)}
                                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-xs font-semibold text-gray-500">Description</p>
                                <p className="mt-1 rounded-md bg-gray-50 p-3 text-gray-700">
                                    {selectedProject.description || "No description provided."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500">Project Owner</p>
                                    <p className="mt-1 font-medium text-gray-900">
                                        {selectedProject.owner || "Naveen"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500">Project ID</p>
                                    <p className="mt-1 font-mono text-xs text-gray-600 truncate">
                                        {selectedProject._id || selectedProject.id || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    handleOpenEditModal(selectedProject);
                                    setSelectedProject(null);
                                }}
                            >
                                Edit Details
                            </Button>
                            <Button
                                className="bg-[#0052CC] hover:bg-[#0747A6]"
                                onClick={() => {
                                    try {
                                        localStorage.setItem("jira_current_project", JSON.stringify(selectedProject));
                                        window.dispatchEvent(new Event("project_changed"));
                                    } catch (e) {}
                                    setSelectedProject(null);
                                    router.push("/kanban");
                                }}
                            >
                                Go to Board
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================
                EDIT PROJECT MODAL
            =================================================== */}
            {editingProject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setEditingProject(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-bold text-[#172B4D]">
                                Edit Project
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditingProject(null)}
                                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProject} className="space-y-4">
                            {editError && (
                                <div className="rounded bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                                    {editError}
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Project Name *
                                </label>
                                <Input
                                    value={editFormData.name}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, name: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Project Key *
                                </label>
                                <Input
                                    value={editFormData.key}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            key: e.target.value.toUpperCase(),
                                        })
                                    }
                                    required
                                    maxLength={10}
                                    className="uppercase"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Description
                                </label>
                                <Textarea
                                    value={editFormData.description}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingProject(null)}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="bg-[#0052CC] hover:bg-[#0747A6]"
                                >
                                    {isUpdating ? "Saving..." : "Save Changes"}
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