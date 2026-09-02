/**
 * SubtaskManager — client-side store for subtasks & task dependencies.
 * Data is persisted in localStorage under key "jira_task_graph".
 *
 * Schema stored per issueId:
 *   subtasks:     Subtask[]     — child subtasks of this issue
 *   parentId:     string|null   — if this issue is itself a subtask
 *   dependencies: string[]      — IDs of issues that must be DONE first
 *   projectId:    string        — inherited project (for subtasks)
 *   sprint:       string        — inherited sprint (for subtasks)
 */

import type { Subtask } from "@/types";

const STORE_KEY = "jira_task_graph";

export interface TaskNode {
    subtasks: Subtask[];
    parentId: string | null;
    dependencies: string[];
    projectId?: string;
    sprint?: string;
}

type Store = Record<string, TaskNode>;

// ─── persistence ─────────────────────────────────────────────────────────────

function load(): Store {
    if (typeof window === "undefined") return {};
    try {
        return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    } catch {
        return {};
    }
}

function save(store: Store): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function getNode(store: Store, id: string): TaskNode {
    return store[id] ?? { subtasks: [], parentId: null, dependencies: [] };
}

// ─── subtask CRUD ─────────────────────────────────────────────────────────────

export function getSubtasks(issueId: string): Subtask[] {
    return getNode(load(), issueId).subtasks;
}

export function addSubtask(
    parentId: string,
    title: string,
    parentProjectId?: string,
    parentSprint?: string
): Subtask {
    const store = load();
    const parent = getNode(store, parentId);

    const sub: Subtask = {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: title.trim(),
        status: "TODO",
        createdAt: new Date().toISOString(),
    };

    parent.subtasks = [...parent.subtasks, sub];
    store[parentId] = parent;

    // register the subtask node itself
    store[sub.id] = {
        subtasks: [],
        parentId,
        dependencies: [],
        projectId: parentProjectId,
        sprint: parentSprint,
    };

    save(store);
    return sub;
}

export function updateSubtaskStatus(
    parentId: string,
    subtaskId: string,
    status: Subtask["status"]
): void {
    const store = load();
    const parent = getNode(store, parentId);
    parent.subtasks = parent.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, status } : s
    );
    store[parentId] = parent;
    save(store);
}

export function deleteSubtask(parentId: string, subtaskId: string): void {
    const store = load();
    const parent = getNode(store, parentId);
    parent.subtasks = parent.subtasks.filter((s) => s.id !== subtaskId);
    store[parentId] = parent;
    delete store[subtaskId];
    save(store);
}

/** Returns true if all subtasks of an issue are DONE (or there are none). */
export function allSubtasksDone(issueId: string): boolean {
    const subs = getSubtasks(issueId);
    if (subs.length === 0) return true;
    return subs.every((s) => s.status === "DONE");
}

// ─── dependency management ────────────────────────────────────────────────────

export function getDependencies(issueId: string): string[] {
    return getNode(load(), issueId).dependencies;
}

/**
 * Detects circular dependency using DFS.
 * Returns true if adding `depId` as a dependency of `issueId` would create a cycle.
 */
function wouldCreateCycle(
    store: Store,
    issueId: string,
    depId: string
): boolean {
    // BFS/DFS: can we reach issueId starting from depId's dependencies?
    const visited = new Set<string>();
    const queue = [depId];
    while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === issueId) return true; // cycle detected
        if (visited.has(current)) continue;
        visited.add(current);
        const node = getNode(store, current);
        queue.push(...node.dependencies);
    }
    return false;
}

/**
 * Add a dependency: `issueId` depends on `depId` (depId must be DONE first).
 * Returns an error message string on failure, or null on success.
 */
export function addDependency(issueId: string, depId: string): string | null {
    if (issueId === depId) return "An issue cannot depend on itself.";

    const store = load();

    if (wouldCreateCycle(store, issueId, depId)) {
        return "Adding this dependency would create a circular dependency.";
    }

    const node = getNode(store, issueId);
    if (node.dependencies.includes(depId)) return "Dependency already exists.";

    node.dependencies = [...node.dependencies, depId];
    store[issueId] = node;
    save(store);
    return null;
}

export function removeDependency(issueId: string, depId: string): void {
    const store = load();
    const node = getNode(store, issueId);
    node.dependencies = node.dependencies.filter((d) => d !== depId);
    store[issueId] = node;
    save(store);
}

/**
 * Check if an issue is blocked (i.e., has dependencies that are not yet DONE).
 * `allIssues` is a flat map of id → status for the current board.
 */
export function getBlockingDeps(
    issueId: string,
    statusMap: Record<string, string>
): string[] {
    const deps = getDependencies(issueId);
    return deps.filter((depId) => {
        const s = statusMap[depId];
        return s !== "DONE";
    });
}

/**
 * Returns all issues that were waiting on `completedId` and are now unblocked
 * (all their other deps are also done).
 */
export function getNewlyUnblocked(
    completedId: string,
    statusMap: Record<string, string>
): string[] {
    const store = load();
    const updatedStatus = { ...statusMap, [completedId]: "DONE" };

    return Object.entries(store)
        .filter(([id, node]) => {
            if (!node.dependencies.includes(completedId)) return false;
            // all deps now done?
            return node.dependencies.every((d) => updatedStatus[d] === "DONE");
        })
        .map(([id]) => id);
}
