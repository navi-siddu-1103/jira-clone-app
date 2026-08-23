"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "./Sidebar";
import { AuthProvider } from "../context/AuthContext";

interface ClientLayoutProps {
    children: React.ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
    const pathname = usePathname();
    const router = useRouter();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(true);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const publicPages = ["/login", "/setup-password"];
        const isPublicPage = publicPages.includes(pathname);

        if (!isAuthenticated && !isPublicPage) {
            router.push("/login");
        } else if (isAuthenticated && pathname === "/login") {
            router.push("/");
        }

        setIsReady(true);
    }, [isAuthenticated, pathname, router]);

    if (!isReady) {
        return (
            <div className="h-screen w-screen bg-white">
                Loading...
            </div>
        );
    }

    const isAuthPage =
        pathname === "/login" || pathname === "/setup-password";

    return (
        <AuthProvider>
            {isAuthPage ? (
                children
            ) : (
                <div className="flex min-h-screen bg-white">
                    <Sidebar />

                    <main className="flex-1 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            )}
        </AuthProvider>
    );
};

export default ClientLayout;