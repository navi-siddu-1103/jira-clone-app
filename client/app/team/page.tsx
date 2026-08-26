"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";

import {
    Search,
    UserPlus,
    MoreHorizontal,
    Mail,
    Shield,
    X,
    Trash2,
    Edit2,
    UserMinus,
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
    pending?: boolean;
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

// ─── Action Menu per row ──────────────────────────────────────────────────────
function MemberActionMenu({
    member,
    onRemove,
    onChangeRole,
}: {
    member: TeamMember;
    onRemove: (id: string) => void;
    onChangeRole: (id: string, role: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const roles = ["DEVELOPER", "MANAGER", "ADMIN"];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {open && (
                <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                    {/* Change Role submenu */}
                    <div className="px-3 py-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Change Role</p>
                        {roles.map((r) => (
                            <button
                                key={r}
                                onClick={() => { onChangeRole(member.id, r); setOpen(false); }}
                                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition hover:bg-gray-50 ${member.role === r ? "font-semibold text-blue-600" : "text-gray-700"}`}
                            >
                                <Shield className="h-3.5 w-3.5" />
                                {r}
                                {member.role === r && <span className="ml-auto text-blue-600">✓</span>}
                            </button>
                        ))}
                    </div>

                    <div className="my-1 border-t border-gray-100" />

                    {/* Edit */}
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                        Edit Member
                    </button>

                    {/* Remove */}
                    <button
                        onClick={() => { onRemove(member.id); setOpen(false); }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <UserMinus className="h-3.5 w-3.5" />
                        Remove Member
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({
    onClose,
    onInvite,
}: {
    onClose: () => void;
    onInvite: (member: TeamMember) => void;
}) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "DEVELOPER",
        group: "Engineering",
    });
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("Full name is required."); return; }
        if (!form.email.includes("@")) { setError("Please enter a valid email."); return; }

        const newMember: TeamMember = {
            id: `user-${Date.now()}`,
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            role: form.role,
            group: form.group,
            avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(form.email)}`,
            pending: true,
        };

        onInvite(newMember);
        setSent(true);
    };

    const selectCls = "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Invite Team Member</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Add a new member to your project team</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-6 py-5">
                    {sent ? (
                        /* Success state */
                        <div className="flex flex-col items-center gap-3 py-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">Member added!</p>
                            <p className="text-xs text-gray-500 text-center">
                                <strong>{form.name}</strong> has been added to the team as <strong>{form.role}</strong>.
                            </p>
                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => { setForm({ name: "", email: "", role: "DEVELOPER", group: "Engineering" }); setSent(false); setError(""); }}
                                    className="text-xs font-medium text-blue-600 hover:underline"
                                >
                                    Invite another
                                </button>
                                <button onClick={onClose} className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                                <Input
                                    type="text"
                                    placeholder="e.g., Jane Smith"
                                    value={form.name}
                                    onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setError(""); }}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                                <Input
                                    type="email"
                                    placeholder="e.g., jane@example.com"
                                    value={form.email}
                                    onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setError(""); }}
                                />
                            </div>

                            {/* Role + Group row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Role</label>
                                    <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className={selectCls}>
                                        <option value="DEVELOPER">Developer</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Group</label>
                                    <select value={form.group} onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))} className={selectCls}>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Design">Design</option>
                                        <option value="Product">Product</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
                                    Add Member
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TeamPage = () => {
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [search, setSearch] = useState("");
    const [showInvite, setShowInvite] = useState(false);

    const filteredMembers = useMemo(() => {
        return members.filter((member) =>
            `${member.name} ${member.email} ${member.role} ${member.group}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [members, search]);

    const getInitials = (name: string) =>
        name.split(" ").map((w) => w.charAt(0)).join("").slice(0, 2).toUpperCase();

    const getRoleStyle = (role: string) => {
        switch (role) {
            case "ADMIN": return "bg-purple-50 text-purple-700";
            case "MANAGER": return "bg-blue-50 text-blue-700";
            case "DEVELOPER": return "bg-green-50 text-green-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const handleInvite = (member: TeamMember) => {
        setMembers((prev) => [...prev, member]);
    };

    const handleRemove = (id: string) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
    };

    const handleChangeRole = (id: string, role: string) => {
        setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
    };

    return (
        <div className="min-h-screen bg-[#F7F8FA]">

            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-8 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#172B4D]">Team</h1>
                        <p className="mt-1 text-sm text-[#6B778C]">Manage your project team members</p>
                    </div>
                    <Button onClick={() => setShowInvite(true)} className="bg-[#0052CC] text-white hover:bg-[#0747A6]">
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
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search team members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white pl-9"
                        />
                    </div>
                    <span className="ml-4 text-sm text-[#6B778C]">
                        {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Team Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

                    {/* Table Header */}
                    <div className="hidden grid-cols-12 border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase text-[#6B778C] md:grid">
                        <div className="col-span-4">Member</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-2">Group</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    {/* Rows */}
                    {filteredMembers.length === 0 ? (
                        <div className="flex min-h-40 items-center justify-center">
                            <p className="text-sm text-gray-500">No team members found</p>
                        </div>
                    ) : (
                        filteredMembers.map((member) => (
                            <div
                                key={member.id}
                                className="grid grid-cols-1 gap-4 border-b border-gray-100 px-6 py-4 last:border-b-0 hover:bg-gray-50 md:grid-cols-12 md:items-center"
                            >
                                {/* Member */}
                                <div className="md:col-span-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={member.avatar} alt={member.name} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-medium text-[#172B4D]">{member.name}</p>
                                                {member.pending && (
                                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{member.id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="md:col-span-3">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                                        <span className="truncate text-sm text-[#6B778C]">{member.email}</span>
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="md:col-span-2">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getRoleStyle(member.role)}`}>
                                        <Shield className="h-3 w-3" />
                                        {member.role}
                                    </span>
                                </div>

                                {/* Group */}
                                <div className="md:col-span-2">
                                    <span className="text-sm text-[#6B778C]">{member.group}</span>
                                </div>

                                {/* Action */}
                                <div className="flex justify-start md:col-span-1 md:justify-end">
                                    <MemberActionMenu
                                        member={member}
                                        onRemove={handleRemove}
                                        onChangeRole={handleChangeRole}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {showInvite && (
                <InviteModal
                    onClose={() => setShowInvite(false)}
                    onInvite={(m) => { handleInvite(m); }}
                />
            )}
        </div>
    );
};

export default TeamPage;