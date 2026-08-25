"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ChevronDown,
    FolderKanban,
    LayoutDashboard,
    ListTodo,
    Plus,
    Search,
    Settings,
    Users,
    LogOut,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import CreateIssueModal from "./CreateIssueModel";


const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://jira-clone-app.onrender.com";
const API_URL = rawApiUrl.replace(/\/+$/, "");

interface SidebarProject {
    id: string;
    _id?: string;
    name: string;
    key: string;
    description?: string;
    owner?: string;
}

const defaultProjects: SidebarProject[] = [
    {
        id: "6a897d9ddfcfb80e0e7cf8ab",
        _id: "6a897d9ddfcfb80e0e7cf8ab",
        name: "Platform Services",
        key: "PS",
        description: "Core Platform infrastructure and Services",
        owner: "Naveen",
    },
    {
        id: "proj-2",
        _id: "proj-2",
        name: "Website Development",
        key: "WD",
        description: "Development and maintenance of company website",
        owner: "John",
    },
    {
        id: "proj-3",
        _id: "proj-3",
        name: "Mobile Application",
        key: "MA",
        description: "Mobile application development project",
        owner: "David",
    },
];

const Sidebar = () => {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [showprojectmenu, setShowprojectmenu] = useState(false);
    const [showcreateissuemodel, setShowcreateissuemodel] = useState(false);

    const [projects, setProjects] = useState<SidebarProject[]>(defaultProjects);
    const [currentProject, setCurrentProject] = useState<SidebarProject>(defaultProjects[0]);

    const loadProjects = async () => {
        let customList: SidebarProject[] = [];
        try {
            const storedCustom = localStorage.getItem("jira_custom_projects");
            if (storedCustom) {
                customList = JSON.parse(storedCustom);
            }
        } catch (e) {}

        try {
            const res = await fetch(`${API_URL}/api/projects`);
            const data = await res.json();
            if (res.ok && data.data?.projects && data.data.projects.length > 0) {
                const apiProjects: SidebarProject[] = data.data.projects.map((p: any) => ({
                    id: p._id || p.id || p.key,
                    _id: p._id || p.id,
                    name: p.name,
                    key: p.key,
                    description: p.description,
                    owner: p.owner,
                }));

                const map = new Map<string, SidebarProject>();
                defaultProjects.forEach((p) => map.set(p.key, p));
                apiProjects.forEach((p) => map.set(p.key, p));
                customList.forEach((p) => map.set(p.key, p));

                const merged = Array.from(map.values());
                setProjects(merged);

                const storedCur = localStorage.getItem("jira_current_project");
                if (storedCur) {
                    const parsed = JSON.parse(storedCur);
                    const match = merged.find((p) => (p._id && p._id === parsed._id) || p.key === parsed.key);
                    if (match) setCurrentProject(match);
                }
                return;
            }
        } catch (e) {
            console.warn("Could not fetch projects for sidebar:", e);
        }

        const map = new Map<string, SidebarProject>();
        defaultProjects.forEach((p) => map.set(p.key, p));
        customList.forEach((p) => map.set(p.key, p));
        const merged = Array.from(map.values());
        setProjects(merged);

        const storedCur = localStorage.getItem("jira_current_project");
        if (storedCur) {
            try {
                const parsed = JSON.parse(storedCur);
                const match = merged.find((p) => (p._id && p._id === parsed._id) || p.key === parsed.key);
                if (match) setCurrentProject(match);
            } catch (e) {}
        }
    };

    useEffect(() => {
        loadProjects();
        const handleProjectEvent = () => loadProjects();
        window.addEventListener("project_created", handleProjectEvent);
        window.addEventListener("project_changed", handleProjectEvent);
        window.addEventListener("storage", handleProjectEvent);
        return () => {
            window.removeEventListener("project_created", handleProjectEvent);
            window.removeEventListener("project_changed", handleProjectEvent);
            window.removeEventListener("storage", handleProjectEvent);
        };
    }, []);

    const handleSelectProject = (project: SidebarProject) => {
        setCurrentProject(project);
        try {
            localStorage.setItem("jira_current_project", JSON.stringify(project));
            window.dispatchEvent(new Event("project_changed"));
        } catch (e) {}
        setShowprojectmenu(false);
    };

    const currentUser = user || {
        id: "user-1",
        name: "Naveen",
        email: "naveen@gmail.com",
        role: "ADMIN",
        group: "Engineering",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        createdAt: new Date().toISOString(),
    };

    return (
        <div className="flex min-h-screen w-[280px] flex-col border-r border-gray-200 bg-white shrink-0">

            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
                    <FolderKanban size={20} />
                </div>

                <span className="text-xl font-semibold text-gray-900">
                    Jira Clone
                </span>
            </div>

            {/* Project Section */}
            {currentProject && (
                <div className="flex-1 p-4">

                    {/* Project Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setShowprojectmenu(!showprojectmenu)
                            }
                            className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3 text-left hover:border-blue-500 hover:bg-gray-50 transition"
                        >
                            <span className="text-sm font-medium text-gray-900 truncate">
                                {currentProject.name}
                            </span>

                            <ChevronDown
                                size={18}
                                className={`text-gray-500 transition-transform shrink-0 ml-2 ${
                                    showprojectmenu
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {showprojectmenu && (
                            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">

                                {projects.map((project) => {
                                    const isSelected = project.key === currentProject.key;
                                    return (
                                        <button
                                            type="button"
                                            key={project.key || project.id}
                                            onClick={() => handleSelectProject(project)}
                                            className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-blue-50 ${
                                                isSelected
                                                    ? "bg-blue-50/70 font-semibold text-blue-700"
                                                    : "font-medium text-gray-800"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                                    isSelected ? "bg-blue-600" : "bg-gray-300"
                                                }`} />
                                                <span className="truncate">{project.name}</span>
                                            </div>
                                            <span className="text-[11px] uppercase font-mono text-gray-400 shrink-0 ml-2">
                                                {project.key}
                                            </span>
                                        </button>
                                    );
                                })}

                                {/* Create Project Button */}
                                <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowprojectmenu(false);
                                            router.push("/projects/create");
                                        }}
                                        className="flex w-full items-center gap-2 text-left text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Project
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className="mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <Input
                                placeholder="Search"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="mt-6 space-y-1">

                        <Navitem
                            href="/kanban"
                            icon={
                                <LayoutDashboard className="h-4 w-4" />
                            }
                            label="Kanban Board"
                        />

                        <Navitem
                            href="/backlog"
                            icon={
                                <ListTodo className="h-4 w-4" />
                            }
                            label="Backlog"
                        />

                        <Navitem
                            href="/projects"
                            icon={
                                <FolderKanban className="h-4 w-4" />
                            }
                            label="Projects"
                        />

                        <Navitem
                            href="/team"
                            icon={
                                <Users className="h-4 w-4" />
                            }
                            label="Team"
                        />

                        <Navitem
                            href="/profile"
                            icon={
                                <Settings className="h-4 w-4" />
                            }
                            label="Profile"
                        />

                    </nav>
                </div>
            )}

            {/* User Section */}
            {currentUser && (
                <div className="border-t border-gray-200 p-4">

                    {/* User Information */}
                    <div className="mb-4 flex items-center gap-3">

                        <Avatar>
                            <AvatarImage
                                src={currentUser.avatar}
                                alt={currentUser.name}
                            />

                            <AvatarFallback>
                                {currentUser.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {currentUser.name}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                                {currentUser.email}
                            </p>
                        </div>
                    </div>

                    {/* Create Issue */}
                    <Button
                        type="button"
                        className="mb-2 w-full"
                        onClick={() =>
                            setShowcreateissuemodel(true)
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />

                        Create Issue
                    </Button>

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-gray-900 hover:bg-gray-100"
                        onClick={logout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />

                        Log Out
                    </Button>
                </div>
            )}

            {/* Create Issue Modal */}
            <CreateIssueModal
                isOpen={showcreateissuemodel}
                onClose={() =>
                    setShowcreateissuemodel(false)
                }
                projectId={currentProject.id}
            />

        </div>
    );
};

export default Sidebar;


/* Navigation Item */
function Navitem({
    href,
    icon,
    label,
    active,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
            }`}
        >
            {icon}

            <span>{label}</span>
        </Link>
    );
}