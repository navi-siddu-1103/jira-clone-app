"use client";

import React from "react";
import {
MoreHorizontal,
User,
CalendarDays,
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
    assignee,
    dueDate,
    status,
    onStatusChange,
    onClick,
}: KanbanCardProps) => {
const priorityStyles: Record<string, string> = {
    LOW: "bg-green-50 text-green-700",
    MEDIUM: "bg-yellow-50 text-yellow-700",
    HIGH: "bg-orange-50 text-orange-700",
    URGENT: "bg-red-50 text-red-700",
};

const typeStyles: Record<string, string> = {
TASK: "bg-blue-50 text-blue-700",
BUG: "bg-red-50 text-red-700",
STORY: "bg-green-50 text-green-700",
EPIC: "bg-purple-50 text-purple-700",
};

return (
<div
    onClick={() => {
        console.log("KANBAN CARD CLICKED");
        onClick?.();
    }}
    className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
>
    {/* Top section */}
    <div className="mb-3 flex items-start justify-between gap-2">
    <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-gray-400">
        {id}
        </p>

        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
        {title}
        </h3>
    </div>

    <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="rounded-md p-1 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-700"
    >
        <MoreHorizontal className="h-4 w-4" />
    </button>
    </div>

    {/* Description */}
    {description && (
    <p className="mb-3 line-clamp-2 text-xs text-gray-500">
        {description}
    </p>
    )}

    {/* Type & Priority */}
    <div className="mb-3 flex flex-wrap items-center gap-2">
    <span
        className={`rounded px-2 py-1 text-[10px] font-semibold ${
        typeStyles[type] || "bg-gray-50 text-gray-700"
        }`}
    >
        {type}
    </span>

    <span
        className={`rounded px-2 py-1 text-[10px] font-semibold ${
        priorityStyles[priority] || "bg-gray-50 text-gray-700"
        }`}
    >
        {priority}
    </span>
    </div>

    {/* Status */}
    <div className="mb-3">
        <select
            value={status}
            onChange={(e) => {
                e.stopPropagation();
                onStatusChange?.(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-600 outline-none focus:border-blue-500"
        >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
        </select>
    </div>

    {/* Bottom section */}
    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
    <div className="flex items-center gap-2">
        {assignee ? (
        <>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-3 w-3" />
            </div>

            <span className="max-w-25 truncate text-xs text-gray-500">
            {assignee}
            </span>
        </>
        ) : (
        <span className="text-xs text-gray-400">
            Unassigned
        </span>
        )}
    </div>

    {dueDate && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
        <CalendarDays className="h-3.5 w-3.5" />
        <span>{dueDate}</span>
        </div>
    )}
    </div>
</div>
);
};

export default KanbanCard;