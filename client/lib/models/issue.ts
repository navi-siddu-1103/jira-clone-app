export type IssueType = "TASK" | "BUG" | "STORY";

export type IssueStatus =
    | "TODO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "DONE";

    export type IssuePriority = "LOW" | "MEDIUM" | "HIGH";

    export interface Issue {
    id: string;
    key: string;

    title: string;
    description: string;

    type: IssueType;
    status: IssueStatus;
    priority: IssuePriority;

    assignee: string;
    dueDate?: string;

    createdAt?: string;
    updatedAt?: string;
}