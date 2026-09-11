"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, Trash2, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAsUnread,
    markAllRead,
    deleteNotification,
    clearAll,
    type AppNotification,
    type NotifType,
} from "@/lib/notificationManager";

// ─── type colours ─────────────────────────────────────────────────────────────
const typeStyles: Record<NotifType, string> = {
    TASK_ASSIGNED:     "bg-blue-100 text-blue-700",
    STATUS_CHANGED:    "bg-purple-100 text-purple-700",
    DUE_DATE_REMINDER: "bg-amber-100 text-amber-700",
    SPRINT_START:      "bg-green-100 text-green-700",
    SPRINT_END:        "bg-red-100 text-red-700",
    COMMENT_ADDED:     "bg-teal-100 text-teal-700",
};
const typeLabel: Record<NotifType, string> = {
    TASK_ASSIGNED:     "Assigned",
    STATUS_CHANGED:    "Status",
    DUE_DATE_REMINDER: "Due Soon",
    SPRINT_START:      "Sprint",
    SPRINT_END:        "Sprint",
    COMMENT_ADDED:     "Comment",
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const NotificationBell: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unread, setUnread] = useState(0);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const panelRef = useRef<HTMLDivElement>(null);

    const refresh = useCallback(() => {
        const notifs = getNotifications();
        setNotifications(notifs);
        setUnread(getUnreadCount());
    }, []);

    useEffect(() => {
        refresh();
        // Listen for new notifications pushed by notificationManager
        const handler = () => refresh();
        window.addEventListener("jira_notification", handler);
        // Also poll every 30s for scheduled reminders
        const timer = setInterval(refresh, 30000);
        return () => {
            window.removeEventListener("jira_notification", handler);
            clearInterval(timer);
        };
    }, [refresh]);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleMarkRead = (id: string) => { markAsRead(id); refresh(); };
    const handleMarkUnread = (id: string) => { markAsUnread(id); refresh(); };
    const handleDelete = (id: string) => { deleteNotification(id); refresh(); };
    const handleMarkAll = () => { markAllRead(); refresh(); };
    const handleClearAll = () => { clearAll(); refresh(); };

    const displayed = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                title="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 top-10 z-[150] w-80 rounded-xl border border-gray-200 bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-bold text-gray-800">Notifications</span>
                            {unread > 0 && (
                                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">{unread} new</span>
                            )}
                        </div>
                        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex border-b border-gray-100 px-4">
                        {(["all", "unread"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`mr-3 py-2 text-xs font-semibold capitalize border-b-2 transition ${
                                    filter === f ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                                }`}
                            >{f}</button>
                        ))}
                        <div className="ml-auto flex items-center gap-2 py-2">
                            {unread > 0 && (
                                <button onClick={handleMarkAll} className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5">
                                    <CheckCheck className="h-3 w-3" /> Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto">
                        {displayed.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Bell className="h-8 w-8 text-gray-200 mb-2" />
                                <p className="text-sm text-gray-400">{filter === "unread" ? "No unread notifications" : "No notifications yet"}</p>
                            </div>
                        ) : (
                            displayed.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`group flex items-start gap-3 border-b border-gray-50 px-4 py-3 transition hover:bg-gray-50 ${!notif.isRead ? "bg-blue-50/40" : ""}`}
                                >
                                    {/* Unread dot */}
                                    <div className="mt-1.5 shrink-0">
                                        {!notif.isRead
                                            ? <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            : <div className="h-2 w-2 rounded-full bg-transparent" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${typeStyles[notif.type]}`}>
                                                {typeLabel[notif.type]}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{timeAgo(notif.createdAt)}</span>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-800">{notif.title}</p>
                                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{notif.message}</p>
                                        {notif.link && (
                                            <Link href={notif.link} onClick={() => { handleMarkRead(notif.id); setOpen(false); }}
                                                className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                                                <ExternalLink className="h-2.5 w-2.5" />View
                                            </Link>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                                        {notif.isRead
                                            ? <button onClick={() => handleMarkUnread(notif.id)} title="Mark unread" className="text-gray-400 hover:text-blue-600"><Bell className="h-3.5 w-3.5" /></button>
                                            : <button onClick={() => handleMarkRead(notif.id)} title="Mark read" className="text-gray-400 hover:text-green-600"><Check className="h-3.5 w-3.5" /></button>}
                                        <button onClick={() => handleDelete(notif.id)} title="Delete" className="text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
                            <button onClick={handleClearAll} className="text-[10px] text-red-500 hover:underline flex items-center gap-1">
                                <Trash2 className="h-3 w-3" /> Clear all
                            </button>
                            <Link href="/settings" onClick={() => setOpen(false)} className="text-[10px] text-gray-400 hover:text-blue-600 hover:underline">
                                Notification settings
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
