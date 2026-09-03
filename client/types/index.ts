// Shared types used across the application

export interface IssueAssignee {
    _id?: string;
    name: string;
    email?: string;
}

export interface Subtask {
    id: string;
    title: string;
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    assignee?: string;
    createdAt: string;
}

// ── Time Tracking ─────────────────────────────────────────────────────────────

export interface WorkLog {
    id: string;
    issueId: string;
    userId: string;
    userName: string;
    date: string;           // YYYY-MM-DD  (not future)
    duration: number;       // minutes (> 0)
    description: string;
    sprint?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface AuditEntry {
    id: string;
    action: "CREATE" | "EDIT" | "DELETE";
    workLogId: string;
    issueId: string;
    userId: string;
    userName: string;
    timestamp: string;
    details: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface Issue {
    _id?: string;
    id?: string;
    key?: string;
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    status?: string;
    assignee?: string | IssueAssignee | null;
    dueDate?: string;
    projectId?: string | object;
    sprint?: string;
    createdAt?: string;
    updatedAt?: string;
    // Subtask & dependency fields (managed client-side)
    subtasks?: Subtask[];
    parentId?: string;
    dependencies?: string[];
}
