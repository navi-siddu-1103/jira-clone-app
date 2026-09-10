"use client";

import React from "react";
import { Wifi, WifiOff, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ActiveUser } from "@/lib/wsClient";

interface PresenceBarProps {
    activeUsers: ActiveUser[];
    connectionStatus: "connected" | "disconnected" | "reconnecting";
    currentUserId?: string;
}

function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// Stable colour based on user ID
const COLOURS = [
    "bg-blue-500", "bg-green-500", "bg-purple-500",
    "bg-pink-500", "bg-amber-500", "bg-teal-500", "bg-red-500",
];
function colourFor(id: string) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
    return COLOURS[h % COLOURS.length];
}

const PresenceBar: React.FC<PresenceBarProps> = ({ activeUsers, connectionStatus, currentUserId }) => {
    const others = activeUsers.filter((u) => u.id !== currentUserId);
    const visible = others.slice(0, 5);
    const overflow = others.length - visible.length;

    return (
        <div className="flex items-center gap-3">
            {/* Connection status pill */}
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                connectionStatus === "connected"
                    ? "bg-green-100 text-green-700"
                    : connectionStatus === "reconnecting"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-500"
            }`}>
                {connectionStatus === "connected"
                    ? <><Wifi className="h-3 w-3" /> Live</>
                    : connectionStatus === "reconnecting"
                    ? <><WifiOff className="h-3 w-3" /> Reconnecting…</>
                    : <><WifiOff className="h-3 w-3" /> Offline</>}
            </div>

            {/* Active users avatars */}
            {others.length > 0 && (
                <div className="flex items-center gap-1" title={`${others.length} active user(s)`}>
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <div className="flex -space-x-1.5">
                        {visible.map((u) => (
                            <Avatar key={u.id} className={`h-6 w-6 border-2 border-white ring-1 ring-white ${colourFor(u.id)}`} title={u.name}>
                                <AvatarFallback className={`text-[9px] font-bold text-white ${colourFor(u.id)}`}>
                                    {getInitials(u.name)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {overflow > 0 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[9px] font-bold text-gray-600">
                                +{overflow}
                            </div>
                        )}
                    </div>
                    <span className="text-[11px] text-gray-400 ml-0.5">online</span>
                </div>
            )}
        </div>
    );
};

export default PresenceBar;
