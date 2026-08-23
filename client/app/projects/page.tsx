"use client";

import React, { useState } from "react";
import {
    FolderKanban,
    Plus,
    Search,
    Users,
    MoreHorizontal,
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

const ProjectsPage = () => {
    const [search, setSearch] = useState("");

    const projects = [
        {
            id: "proj-1",
            name: "Platform Services",
            key: "PS",
            description:
                "Core Platform infrastructure and Services",
            owner: "Naveen",
            members: 2,
            avatar:
                "https://i.pravatar.cc/150?u=naveen",
        },
        {
            id: "proj-2",
            name: "Website Development",
            key: "WD",
            description:
                "Development and maintenance of company website",
            owner: "John",
            members: 4,
            avatar:
                "https://i.pravatar.cc/150?u=john",
        },
        {
            id: "proj-3",
            name: "Mobile Application",
            key: "MA",
            description:
                "Mobile application development project",
            owner: "David",
            members: 5,
            avatar:
                "https://i.pravatar.cc/150?u=david",
        },
    ];

    const filteredProjects = projects.filter((project) =>
        `${project.name} ${project.key} ${project.description}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

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

                    <Button className="bg-[#0052CC] hover:bg-[#0747A6]">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                    </Button>

                </div>
            </div>

            {/* Main Content */}
            <div className="p-8">

                {/* Search */}
                <div className="mb-6 flex items-center justify-between">

                    <div className="relative w-full max-w-md">

                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                        <Input
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="pl-9 bg-white"
                        />

                    </div>

                    <div className="ml-4 text-sm text-[#6B778C]">
                        {filteredProjects.length} projects
                    </div>

                </div>

                {/* Projects */}
                {filteredProjects.length === 0 ? (

                    <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-white">

                        <div className="text-center">

                            <FolderKanban className="mx-auto mb-3 h-10 w-10 text-gray-400" />

                            <h2 className="text-lg font-medium text-[#172B4D]">
                                No projects found
                            </h2>

                            <p className="mt-1 text-sm text-[#6B778C]">
                                Try searching with a different name.
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {filteredProjects.map((project) => (

                            <Card
                                key={project.id}
                                className="bg-white transition-shadow hover:shadow-md"
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

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>

                                    </div>

                                </CardHeader>

                                {/* Card Content */}
                                <CardContent>

                                    <p className="mb-5 min-h-[40px] text-sm text-[#6B778C]">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center justify-between border-t pt-4">

                                        {/* Owner */}
                                        <div className="flex items-center gap-2">

                                            <Avatar className="h-7 w-7">

                                                <AvatarImage
                                                    src={project.avatar}
                                                    alt={project.owner}
                                                />

                                                <AvatarFallback>
                                                    {project.owner.charAt(0)}
                                                </AvatarFallback>

                                            </Avatar>

                                            <div>

                                                <p className="text-xs text-[#6B778C]">
                                                    Owner
                                                </p>

                                                <p className="text-sm font-medium text-[#172B4D]">
                                                    {project.owner}
                                                </p>

                                            </div>

                                        </div>

                                        {/* Members */}
                                        <div className="flex items-center gap-1 text-sm text-[#6B778C]">

                                            <Users className="h-4 w-4" />

                                            {project.members}

                                        </div>

                                    </div>

                                    <Button
                                        variant="outline"
                                        className="mt-5 w-full"
                                    >
                                        Open Project
                                    </Button>

                                </CardContent>

                            </Card>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
};

export default ProjectsPage;