"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    FolderKanban,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://jira-clone-app.onrender.com";
const API_URL = rawApiUrl.replace(/\/+$/, "");


interface FormData {
    name: string;
    email: string;
    password: string;
    group: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    group?: string;
    avatar?: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
    data?: {
        user?: User;
        token?: string;
    };
}

const LoginPage = () => {
    const { login } = useAuth();
    const router = useRouter();

    const [isSignup, setIsSignup] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        group: "Engineering",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle input changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    // Handle Signup
    const handleSignup = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    group: formData.group,
                }),
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            const user = data.user || data.data?.user;
            const token = data.token || data.data?.token || "sample-jwt-token";

            if (!user) {
                throw new Error("Invalid signup response from server");
            }

            login(user, token);
            setSuccess("Account created successfully!");
            window.location.href = "/";
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Signup failed"
            );
        } finally {
            setIsLoading(false);
        }
    };


    // Handle Login
    const handleLogin = async () => {
        setError("");
        setIsLoading(true);

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: formData.email,
            password: formData.password,
        }),
        });
    
        const data: ApiResponse = await response.json();
    
        if (!response.ok) {
        throw new Error(data.message || "Login failed");
        }
    
        const user = data.user || data.data?.user;
        const token = data.token || data.data?.token;
    
        if (user) {
        localStorage.setItem("jira_user", JSON.stringify(user));
        }
    
        if (token) {
        localStorage.setItem("jira_token", token);
        }
    
        setSuccess("Login successful!");
    
        // Redirect after successful login
        window.location.href = "/";
    } catch (error) {
        setError(
        error instanceof Error ? error.message : "Login failed"
        );
    } finally {
        setIsLoading(false);
    }
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Validation
        if (!formData.email || !formData.password) {
            setError("Email and password are required.");
            return;
        }
        if (isSignup && !formData.name) {
            setError("Full name is required.");
            return;
        }
        if (isSignup && formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (isSignup) {
            await handleSignup();
        } else {
            await handleLogin();
        }
    };


    // Toggle login/signup
    const handleToggle = () => {
        setIsSignup((prev) => !prev);

        setError("");
        setSuccess("");

        setFormData({
            name: "",
            email: "",
            password: "",
            group: "Engineering",
        });
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
                            <FolderKanban size={22} />
                        </div>

                        <span className="text-2xl font-bold text-gray-900">
                            Jira Clone
                        </span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl text-[#172B4D]">
                            {isSignup
                                ? "Create your account"
                                : "Welcome back"}
                        </CardTitle>

                        <CardDescription>
                            {isSignup
                                ? "Create an account to start managing your projects"
                                : "Enter your credentials to access your account"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Success */}
                            {success && (
                                <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
                                    <CheckCircle className="h-4 w-4 shrink-0" />
                                    <span>{success}</span>
                                </div>
                            )}

                            {/* Full Name */}
                            {isSignup && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#172B4D]">
                                        Full Name *
                                    </label>

                                    <Input
                                        type="text"
                                        name="name"
                                        placeholder="e.g., Naveen"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#172B4D]">
                                    Email *
                                </label>

                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="e.g., naveen@gmail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Group */}
                            {isSignup && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#172B4D]">
                                        Group *
                                    </label>

                                    <select
                                        name="group"
                                        value={formData.group}
                                        onChange={handleChange}
                                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Engineering">
                                            Engineering
                                        </option>

                                        <option value="Design">
                                            Design
                                        </option>

                                        <option value="Product">
                                            Product
                                        </option>

                                        <option value="Marketing">
                                            Marketing
                                        </option>
                                    </select>
                                </div>
                            )}

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#172B4D]">
                                    Password *
                                </label>

                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                {isSignup && (
                                    <p className="text-xs text-gray-500">
                                        Password must be at least 8 characters
                                        long.
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#0052CC] text-white hover:bg-[#0747A6]"
                            >
                                {isLoading
                                    ? "Processing..."
                                    : isSignup
                                    ? "Sign Up"
                                    : "Log In"}

                                {!isLoading && (
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                )}
                            </Button>
                        </form>

                        {/* Toggle */}
                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-600">
                                {isSignup
                                    ? "Already have an account?"
                                    : "Don't have an account?"}
                            </span>

                            <button
                                type="button"
                                onClick={handleToggle}
                                className="ml-1 font-medium text-[#0052CC] hover:underline"
                            >
                                {isSignup ? "Log In" : "Sign Up"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;