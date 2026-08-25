// Shared types used across the application

export interface IssueAssignee {
    _id?: string;
    name: string;
    email?: string;
}

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
    createdAt?: string;
    updatedAt?: string;
}
