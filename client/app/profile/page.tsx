"use client";

import React, { useState } from "react";

import {
    User,
    Mail,
    Shield,
    Users,
    Camera,
    Save,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

const ProfilePage = () => {
    const [formData, setFormData] = useState({
        name: "Naveen",
        email: "naveen@gmail.com",
        role: "ADMIN",
        group: "Engineering",
        avatar: "https://i.pravatar.cc/150?u=naveen",
    });

    const [message, setMessage] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setMessage("");
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Updated profile:", formData);

        setMessage("Profile updated successfully.");
    };

    return (
        <div className="min-h-screen bg-[#F7F8FA]">

            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-8 py-5">

                <h1 className="text-2xl font-semibold text-[#172B4D]">
                    Profile
                </h1>

                <p className="mt-1 text-sm text-[#6B778C]">
                    Manage your account information and profile settings
                </p>

            </div>

            {/* Content */}
            <div className="p-8">

                <div className="mx-auto max-w-3xl">

                    {/* Profile Card */}
                    <div className="rounded-lg border border-gray-200 bg-white">

                        {/* Profile Header */}
                        <div className="border-b border-gray-200 px-6 py-5">

                            <h2 className="text-base font-semibold text-[#172B4D]">
                                Personal Information
                            </h2>

                            <p className="mt-1 text-sm text-[#6B778C]">
                                Update your personal information and account
                                details.
                            </p>

                        </div>

                        <form onSubmit={handleSave}>

                            {/* Avatar */}
                            <div className="flex items-center gap-5 border-b border-gray-200 px-6 py-6">

                                <Avatar className="h-20 w-20">

                                    <AvatarImage
                                        src={formData.avatar}
                                        alt={formData.name}
                                    />

                                    <AvatarFallback className="text-xl">
                                        {formData.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </AvatarFallback>

                                </Avatar>

                                <div>

                                    <h3 className="text-sm font-medium text-[#172B4D]">
                                        Profile Picture
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Your profile picture will be visible
                                        to other team members.
                                    </p>

                                    <button
                                        type="button"
                                        className="mt-3 flex items-center gap-2
                                        rounded-md border border-gray-300
                                        px-3 py-2 text-sm font-medium
                                        text-gray-700 hover:bg-gray-50"
                                    >
                                        <Camera className="h-4 w-4" />
                                        Change Picture
                                    </button>

                                </div>

                            </div>

                            {/* Form */}
                            <div className="space-y-6 px-6 py-6">

                                {/* Name */}
                                <div className="space-y-2">

                                    <label
                                        htmlFor="name"
                                        className="flex items-center gap-2
                                        text-sm font-medium text-gray-700"
                                    >
                                        <User className="h-4 w-4 text-gray-400" />
                                        Full Name
                                    </label>

                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                    />

                                </div>

                                {/* Email */}
                                <div className="space-y-2">

                                    <label
                                        htmlFor="email"
                                        className="flex items-center gap-2
                                        text-sm font-medium text-gray-700"
                                    >
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        Email
                                    </label>

                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                    />

                                </div>

                                {/* Role */}
                                <div className="space-y-2">

                                    <label className="flex items-center gap-2
                                    text-sm font-medium text-gray-700">

                                        <Shield className="h-4 w-4 text-gray-400" />

                                        Role

                                    </label>

                                    <Input
                                        value={formData.role}
                                        disabled
                                        className="bg-gray-50"
                                    />

                                    <p className="text-xs text-gray-500">
                                        Your role is managed by the project
                                        administrator.
                                    </p>

                                </div>

                                {/* Group */}
                                <div className="space-y-2">

                                    <label
                                        htmlFor="group"
                                        className="flex items-center gap-2
                                        text-sm font-medium text-gray-700"
                                    >
                                        <Users className="h-4 w-4 text-gray-400" />
                                        Group
                                    </label>

                                    <Input
                                        id="group"
                                        name="group"
                                        value={formData.group}
                                        onChange={handleChange}
                                        placeholder="Enter your group"
                                    />

                                </div>

                                {/* Avatar URL */}
                                <div className="space-y-2">

                                    <label
                                        htmlFor="avatar"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Avatar URL
                                    </label>

                                    <Input
                                        id="avatar"
                                        name="avatar"
                                        value={formData.avatar}
                                        onChange={handleChange}
                                        placeholder="Enter avatar URL"
                                    />

                                </div>

                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between
                            border-t border-gray-200 px-6 py-4">

                                <div>

                                    {message && (
                                        <p className="text-sm text-green-600">
                                            {message}
                                        </p>
                                    )}

                                </div>

                                <Button
                                    type="submit"
                                    className="bg-[#0052CC] text-white
                                    hover:bg-[#0747A6]"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>

                            </div>

                        </form>

                    </div>

                    {/* Account Information */}
                    <div className="mt-6 rounded-lg border
                    border-gray-200 bg-white">

                        <div className="border-b border-gray-200 px-6 py-5">

                            <h2 className="text-base font-semibold text-[#172B4D]">
                                Account Information
                            </h2>

                        </div>

                        <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2">

                            <div>

                                <p className="text-xs text-gray-500">
                                    User ID
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#172B4D]">
                                    user-1
                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-gray-500">
                                    Account Role
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#172B4D]">
                                    Administrator
                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-gray-500">
                                    Department
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#172B4D]">
                                    Engineering
                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-gray-500">
                                    Account Status
                                </p>

                                <span className="mt-1 inline-flex rounded-full
                                bg-green-50 px-3 py-1 text-xs font-medium
                                text-green-600">
                                    Active
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ProfilePage;