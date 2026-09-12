"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import Sidebar from "./Sidebar";
import { AuthProvider, useAuth } from "../context/AuthContext";

interface ClientLayoutProps {
    children: React.ReactNode;
}

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
    const pathname  = usePathname();
    const router    = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => { setSidebarOpen(false); }, [pathname]);

    useEffect(() => {
        if (isLoading) return;
        const publicPages = ["/login", "/setup-password"];
        if (!isAuthenticated && !publicPages.includes(pathname)) router.push("/login");
        else if (isAuthenticated && pathname === "/login") router.push("/");
    }, [isAuthenticated, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white text-sm text-gray-500">
                Loading...
            </div>
        );
    }

    const isAuthPage = pathname === "/login" || pathname === "/setup-password";
    if (isAuthPage) return <>{children}</>;

    return (
        <div className="flex min-h-screen bg-white">

            {/* ── Mobile overlay backdrop ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            {/* Desktop: always visible. Mobile: slide-in drawer */}
            <div className={`
                fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* ── Main content ── */}
            <main className="flex-1 min-w-0 overflow-x-hidden">
                {/* Mobile top bar with hamburger */}
                <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="text-base font-semibold text-gray-800">Jira Clone</span>
                </div>

                {children}
            </main>
        </div>
    );
};

const ClientLayout = ({ children }: ClientLayoutProps) => (
    <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
);

export default ClientLayout;