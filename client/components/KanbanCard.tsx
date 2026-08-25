"use client";

import React from "react";
import {
    CheckSquare,
    Bug,
    Bookmark,
    Layers,
} from "lucide-react";

interface KanbanCardProps {
    id: string;
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    assignee?: string;
    dueDate?: string;
    status: string;
    onStatusChange?: (status: string) => void;
    onClick?: () => void;
}

const KanbanCard = ({
    id,
    title,
    description,
    type = "TASK",
    priority = "MEDIUM",
    assignee = "John Doe",
    dueDate,
    status,
    onStatusChange,
    onClick,
}: KanbanCardProps) => {
    const getPriorityBadge = (p: string) => {
        const uppercaseP = (p || "MEDIUM").toUpperCase();
        switch (uppercaseP) {
            case "HIGH":
            case "URGENT":
                return (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                        HIGH
                    </span>
                );
            case "MEDIUM":
                return (
                    <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-[11px] font-bold text-yellow-700">
                        MEDIUM
                    </span>
                );
            case "LOW":
            default:
                return (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                        LOW
                    </span>
                );
        }
    };

    const getTypeIcon = (t: string) => {
        const uppercaseT = (t || "TASK").toUpperCase();
        switch (uppercaseT) {
            case "BUG":
                return (
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-red-500 text-white">
                        <Bug className="h-3 w-3" />
                    </div>
                );
            case "STORY":
            case "EPIC":
                return (
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-600 text-white">
                        <Bookmark className="h-3 w-3" />
                    </div>
                );
            case "TASK":
            default:
                return (
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                        <CheckSquare className="h-3 w-3" />
                    </div>
                );
        }
    };

    // Format display key e.g. PS-124
    const displayKey = id.startsWith("PS-") || id.startsWith("PROJ-")
        ? id
        : `PS-${id.slice(-3).toUpperCase()}`;

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
        >
            {/* Title */}
            <h3 className="mb-3 text-sm font-semibold leading-snug text-gray-900">
                {title}
            </h3>

            {/* Description if present */}
            {description && (
                <p className="mb-3 line-clamp-2 text-xs text-gray-500">
                    {description}
                </p>
            )}

            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-1">

                {/* Left: Type Icon + Key + Assignee */}
                <div className="flex items-center gap-2">
                    {getTypeIcon(type)}

                    <span className="text-xs font-semibold text-gray-600">
                        {displayKey}
                    </span>

                    {/* Assignee Avatar & Name */}
                    <div className="ml-1 flex items-center gap-1.5">
                        <img
                            src="https://i.pravatar.cc/150?u=john"
                            alt={assignee}
                            className="h-5 w-5 rounded-full object-cover"
                        />
                        <span className="text-xs text-gray-500">
                            {assignee}
                        </span>
                    </div>
                </div>

                {/* Right: Priority Badge & Quick Status Selector */}
                <div className="flex items-center gap-2">
                    {getPriorityBadge(priority)}

                    <select
                        value={status}
                        onChange={(e) => {
                            e.stopPropagation();
                            onStatusChange?.(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 rounded border border-gray-200 bg-gray-50 px-1 text-[10px] font-medium text-gray-600 opacity-0 transition group-hover:opacity-100 hover:bg-white"
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>

            </div>
        </div>
    );
};

export default KanbanCard;