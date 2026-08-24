"use client";

import React, { useState } from "react";
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

import CreateIssuemodel from "./CreateIssueModel";

const Sidebar = () => {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [showprojectmenu, setShowprojectmenu] = useState(false);
    const [showcreateissuemodel, setShowcreateissuemodel] =
        useState(false);

    const currentProject = {
        id: "6a897d9ddfcfb80e0e7cf8ab",
        name: "Platform Services",
        key: "PS",
        ownerId: "user-1",
        memberIds: ["user-1", "user-2"],
        createdAt: new Date().toISOString(),
        description: "Core Platform infrastructure and Services",
    };

    const allproject = {
        "6a897d9ddfcfb80e0e7cf8ab": currentProject,
    };

    const currentUser = user || {
        id: "user-1",
        name: "Naveen",
        email: "naveen@gmail.com",
        role: "ADMIN",
        group: "Engineering",
        avatar: "https://i.pravatar.cc/150?u=john",
        createdAt: new Date().toISOString(),
    };

    return (
        <div className="flex min-h-screen w-[280px] flex-col border-r border-gray-200 bg-white">

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
                    <div>
                        <button
                            type="button"
                            onClick={() =>
                                setShowprojectmenu(!showprojectmenu)
                            }
                            className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3 text-left hover:border-blue-500 hover:bg-gray-50"
                        >
                            <span className="text-sm font-medium text-gray-900">
                                {currentProject.name}
                            </span>

                            <ChevronDown
                                size={18}
                                className={`text-gray-500 transition-transform ${
                                    showprojectmenu
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>

                        {/* Dropdown */}
                        {showprojectmenu && (
                            <div className="mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">

                                {Object.values(allproject).map(
                                    (project) => (
                                        <button
                                            type="button"
                                            key={project.id}
                                            onClick={() =>
                                                setShowprojectmenu(false)
                                            }
                                            className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-100"
                                        >
                                            <div className="h-3 w-3 rounded-full bg-blue-500" />

                                            {project.name}
                                        </button>
                                    )
                                )}

                                {/* Create Project */}
                                <div className="border-t border-gray-200 px-3 py-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                "/projects/create"
                                            )
                                        }
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
            <CreateIssuemodel
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