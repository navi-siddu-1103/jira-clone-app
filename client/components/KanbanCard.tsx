"use client";

import React, { useState } from "react";
import { CheckSquare, Bug, Bookmark } from "lucide-react";

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
    const [isDragging, setIsDragging] = useState(false);

    /* ── Drag handlers ── */
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };
    const getPriorityBadge = (p: string) => {
        const uppercaseP = (p || "MEDIUM").toUpperCase();
        switch (uppercaseP) {
            case "HIGH":
            case "URGENT":
                return (
                    <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-600 tracking-wide uppercase whitespace-nowrap">
                        HIGH
                    </span>
                );
            case "MEDIUM":
                return (
                    <span className="shrink-0 rounded-full bg-yellow-100 px-2.5 py-0.5 text-[10px] font-bold text-yellow-700 tracking-wide uppercase whitespace-nowrap">
                        MEDIUM
                    </span>
                );
            case "LOW":
            default:
                return (
                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700 tracking-wide uppercase whitespace-nowrap">
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
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-red-500 text-white shadow-xs">
                        <Bug className="h-3 w-3" />
                    </div>
                );
            case "STORY":
            case "EPIC":
                return (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-purple-600 text-white shadow-xs">
                        <Bookmark className="h-3 w-3" />
                    </div>
                );
            case "TASK":
            default:
                return (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-600 text-white shadow-xs">
                        <CheckSquare className="h-3 w-3" />
                    </div>
                );
        }
    };

    // Format display key e.g. PS-124
    const displayKey = id.startsWith("PS-") || id.startsWith("PROJ-") || id.startsWith("WD-") || id.startsWith("MA-")
        ? id
        : `PS-${id.slice(-3).toUpperCase()}`;

    // Clean assignee name (prevent raw mongo hex ID string overflow)
    let displayAssignee = assignee || "John Doe";
    if (/^[0-9a-fA-F]{24}$/.test(displayAssignee)) {
        displayAssignee = "Naveen";
    }

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={onClick}
            className={`group relative rounded-lg border bg-white p-4 transition-all overflow-hidden
                ${isDragging
                    ? "opacity-40 scale-95 border-blue-400 shadow-lg cursor-grabbing"
                    : "opacity-100 border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md cursor-grab"
                }`}
        >
            {/* Top drag-indicator stripe — shows on hover */}
            <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-lg bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Title */}
            <h3 className="mb-2 text-sm font-semibold leading-snug text-gray-900 line-clamp-2">
                {title}
            </h3>

            {/* Description if present */}
            {description && (
                <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {description}
                </p>
            )}

            {/* Bottom Row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 mt-2">

                {/* Left: Type Icon + Key + Assignee */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                    {getTypeIcon(type)}

                    <span className="shrink-0 text-xs font-semibold text-gray-700 tracking-tight whitespace-nowrap">
                        {displayKey}
                    </span>

                    {/* Assignee Avatar & Name */}
                    <div className="flex items-center gap-1 min-w-0 overflow-hidden ml-0.5">
                        <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                            alt={displayAssignee}
                            className="h-4 w-4 shrink-0 rounded-full object-cover"
                        />
                        <span className="truncate text-xs text-gray-500 font-medium">
                            {displayAssignee}
                        </span>
                    </div>
                </div>

                {/* Right: Priority Badge & Quick Status Selector */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {getPriorityBadge(priority)}

                    <select
                        value={status}
                        onChange={(e) => {
                            e.stopPropagation();
                            onStatusChange?.(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="h-5 rounded border border-gray-200 bg-gray-50 px-1 text-[10px] font-medium text-gray-600 opacity-0 transition group-hover:opacity-100 hover:bg-white"
                        title="Change status"
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