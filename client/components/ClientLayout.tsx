"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "./Sidebar";
import { AuthProvider, useAuth } from "../context/AuthContext";

interface ClientLayoutProps {
    children: React.ReactNode;
}

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        const publicPages = ["/login", "/setup-password"];
        const isPublicPage = publicPages.includes(pathname);

        if (!isAuthenticated && !isPublicPage) {
            router.push("/login");
        } else if (isAuthenticated && pathname === "/login") {
            router.push("/");
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white text-sm text-gray-500">
                Loading...
            </div>
        );
    }

    const isAuthPage =
        pathname === "/login" || pathname === "/setup-password";

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
};

const ClientLayout = ({ children }: ClientLayoutProps) => {
    return (
        <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
    );
};

export default ClientLayout;