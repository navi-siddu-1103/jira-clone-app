"use client";

import React, { useMemo, useState } from "react";

import {
    Search,
    UserPlus,
    MoreHorizontal,
    Mail,
    Shield,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    group: string;
    avatar: string;
};

const initialMembers: TeamMember[] = [
    {
        id: "user-1",
        name: "Naveen",
        email: "naveen@gmail.com",
        role: "ADMIN",
        group: "Engineering",
        avatar: "https://i.pravatar.cc/150?u=naveen",
    },
    {
        id: "user-2",
        name: "John",
        email: "john@gmail.com",
        role: "DEVELOPER",
        group: "Engineering",
        avatar: "https://i.pravatar.cc/150?u=john",
    },
    {
        id: "user-3",
        name: "Sarah",
        email: "sarah@gmail.com",
        role: "DEVELOPER",
        group: "Engineering",
        avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    {
        id: "user-4",
        name: "David",
        email: "david@gmail.com",
        role: "MANAGER",
        group: "Product",
        avatar: "https://i.pravatar.cc/150?u=david",
    },
    {
        id: "user-5",
        name: "Alex",
        email: "alex@gmail.com",
        role: "DEVELOPER",
        group: "Engineering",
        avatar: "https://i.pravatar.cc/150?u=alex",
    },
];

const TeamPage = () => {
    const [members] = useState<TeamMember[]>(initialMembers);
    const [search, setSearch] = useState("");

    const filteredMembers = useMemo(() => {
        return members.filter((member) =>
            `${member.name} ${member.email} ${member.role} ${member.group}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [members, search]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const getRoleStyle = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-purple-50 text-purple-700";

            case "MANAGER":
                return "bg-blue-50 text-blue-700";

            case "DEVELOPER":
                return "bg-green-50 text-green-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const handleInviteMember = () => {
        console.log("Invite member clicked");
    };

    return (
        <div className="min-h-screen bg-[#F7F8FA]">

            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-8 py-5">

                <div className="flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-semibold text-[#172B4D]">
                            Team
                        </h1>

                        <p className="mt-1 text-sm text-[#6B778C]">
                            Manage your project team members
                        </p>
                    </div>

                    <Button
                        onClick={handleInviteMember}
                        className="bg-[#0052CC] text-white hover:bg-[#0747A6]"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Member
                    </Button>

                </div>

            </div>

            {/* Content */}
            <div className="p-8">

                {/* Search and Count */}
                <div className="mb-5 flex items-center justify-between">

                    <div className="relative w-full max-w-md">

                        <Search
                            className="absolute left-3 top-1/2
                            h-4 w-4 -translate-y-1/2 text-gray-400"
                        />

                        <Input
                            placeholder="Search team members..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="bg-white pl-9"
                        />

                    </div>

                    <span className="ml-4 text-sm text-[#6B778C]">
                        {filteredMembers.length} members
                    </span>

                </div>

                {/* Team Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

                    {/* Table Header */}
                    <div className="hidden grid-cols-12 border-b border-gray-200
                    bg-gray-50 px-6 py-3 text-xs font-semibold uppercase
                    text-[#6B778C] md:grid">

                        <div className="col-span-4">
                            Member
                        </div>

                        <div className="col-span-3">
                            Email
                        </div>

                        <div className="col-span-2">
                            Role
                        </div>

                        <div className="col-span-2">
                            Group
                        </div>

                        <div className="col-span-1 text-right">
                            Action
                        </div>

                    </div>

                    {/* Members */}
                    {filteredMembers.length === 0 ? (

                        <div className="flex min-h-40 items-center justify-center">

                            <p className="text-sm text-gray-500">
                                No team members found
                            </p>

                        </div>

                    ) : (

                        filteredMembers.map((member) => (

                            <div
                                key={member.id}
                                className="grid grid-cols-1 gap-4 border-b
                                border-gray-100 px-6 py-4 last:border-b-0
                                hover:bg-gray-50 md:grid-cols-12
                                md:items-center"
                            >

                                {/* Member */}
                                <div className="md:col-span-4">

                                    <div className="flex items-center gap-3">

                                        <Avatar className="h-9 w-9">

                                            <AvatarImage
                                                src={member.avatar}
                                                alt={member.name}
                                            />

                                            <AvatarFallback>
                                                {getInitials(member.name)}
                                            </AvatarFallback>

                                        </Avatar>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-medium text-[#172B4D]">
                                                {member.name}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {member.id}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {/* Email */}
                                <div className="md:col-span-3">

                                    <div className="flex items-center gap-2">

                                        <Mail className="h-4 w-4 text-gray-400" />

                                        <span className="truncate text-sm text-[#6B778C]">
                                            {member.email}
                                        </span>

                                    </div>

                                </div>

                                {/* Role */}
                                <div className="md:col-span-2">

                                    <span
                                        className={`inline-flex items-center
                                        gap-1 rounded-full px-3 py-1 text-xs
                                        font-medium ${getRoleStyle(
                                            member.role
                                        )}`}
                                    >

                                        <Shield className="h-3 w-3" />

                                        {member.role}

                                    </span>

                                </div>

                                {/* Group */}
                                <div className="md:col-span-2">

                                    <span className="text-sm text-[#6B778C]">
                                        {member.group}
                                    </span>

                                </div>

                                {/* Action */}
                                <div className="flex justify-start md:col-span-1 md:justify-end">

                                    <button
                                        onClick={() =>
                                            console.log(
                                                "Member:",
                                                member.id
                                            )
                                        }
                                        className="rounded-md p-2 text-gray-500
                                        hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>
    );
};

export default TeamPage;