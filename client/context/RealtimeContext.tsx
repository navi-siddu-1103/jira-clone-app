"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import { rtClient, type RTEvent, type RTEventType, type ActiveUser } from "@/lib/wsClient";
import { useAuth } from "@/context/AuthContext";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";  // set in .env if backend supports WS

interface RTContextValue {
    isConnected: boolean;
    activeUsers: ActiveUser[];
    publish: (type: RTEventType, payload: unknown) => void;
    subscribe: (fn: (event: RTEvent) => void) => () => void;
    connectionStatus: "connected" | "disconnected" | "reconnecting";
}

const RTContext = createContext<RTContextValue | undefined>(undefined);

export const RealtimeProvider = ({
    children,
    projectId,
}: {
    children: React.ReactNode;
    projectId: string;
}) => {
    const { user } = useAuth();
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">("disconnected");
    const initialized = useRef(false);

    useEffect(() => {
        if (!user || !projectId || initialized.current) return;
        initialized.current = true;

        rtClient.init(
            WS_URL,
            projectId,
            user.id || "anon",
            user.name || "Anonymous"
        );

        setConnectionStatus("connected");

        // Subscribe to presence events to update active user list
        const unsub = rtClient.subscribe((event) => {
            if (event.type === "USER_JOINED" || event.type === "USER_LEFT" || event.type === "PING") {
                setActiveUsers(rtClient.getActiveUsers());
            }
        });

        // Refresh active users every 10s
        const refreshTimer = setInterval(() => {
            setActiveUsers(rtClient.getActiveUsers());
        }, 10000);

        return () => {
            unsub();
            clearInterval(refreshTimer);
            rtClient.destroy();
            initialized.current = false;
            setConnectionStatus("disconnected");
        };
    }, [user, projectId]);

    const publish = useCallback((type: RTEventType, payload: unknown) => {
        rtClient.publish(type, payload);
    }, []);

    const subscribe = useCallback((fn: (event: RTEvent) => void) => {
        return rtClient.subscribe(fn);
    }, []);

    return (
        <RTContext.Provider value={{ isConnected: connectionStatus === "connected", activeUsers, publish, subscribe, connectionStatus }}>
            {children}
        </RTContext.Provider>
    );
};

export const useRealtime = () => {
    const ctx = useContext(RTContext);
    if (!ctx) throw new Error("useRealtime must be used inside RealtimeProvider");
    return ctx;
};
