"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Upload, FileText, Image, FileType, Trash2,
    Download, AlertTriangle, CheckCircle2, Loader2, X, Paperclip,
} from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://jira-clone-app.onrender.com").replace(/\/+$/, "");

// ── Config (matches backend) ──────────────────────────────────────────────────
const MAX_SIZE_MB = 10;
const MAX_BYTES   = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
const ALLOWED_EXT  = [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".doc"];

interface FileEntry {
    storedName: string;
    issueId:    string;
    size:       string;
    originalName?: string;
}

interface FileAttachmentPanelProps {
    issueId: string;
}

function fileIcon(name: string) {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileType className="h-4 w-4 text-red-500" />;
    if (ext === "png" || ext === "jpg" || ext === "jpeg")
        return <Image className="h-4 w-4 text-blue-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
}

function formatSize(bytes: string | number): string {
    const b = Number(bytes);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function validate(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) {
            return `Unsupported type: ${file.type || file.name}. Allowed: PDF, PNG, JPG, DOCX.`;
        }
    }
    if (file.size > MAX_BYTES) {
        return `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max is ${MAX_SIZE_MB} MB.`;
    }
    return null;
}

const FileAttachmentPanel: React.FC<FileAttachmentPanelProps> = ({ issueId }) => {
    const [files, setFiles]         = useState<FileEntry[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError]         = useState("");
    const [success, setSuccess]     = useState("");
    const [deleting, setDeleting]   = useState<string | null>(null);
    const [confirmDel, setConfirmDel] = useState<string | null>(null);
    const [dragOver, setDragOver]   = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const loadFiles = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/files/list/${issueId}`);
            if (res.ok) {
                const data = await res.json();
                setFiles(data.files || []);
            }
        } catch {
            // API not available - use localStorage fallback for demo
            const stored = localStorage.getItem(`jira_files_${issueId}`);
            if (stored) setFiles(JSON.parse(stored));
        }
    }, [issueId]);

    useEffect(() => { loadFiles(); }, [loadFiles]);

    const flash = (msg: string, type: "success" | "error") => {
        if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
        else { setError(msg); setTimeout(() => setError(""), 5000); }
    };

    const handleUpload = async (file: File) => {
        const valErr = validate(file);
        if (valErr) { flash(valErr, "error"); return; }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_URL}/api/files/upload/${issueId}`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                flash(`"${file.name}" uploaded successfully.`, "success");

                // Also mirror to localStorage for resilient UI
                const newEntry: FileEntry = {
                    storedName: data.storedName,
                    issueId,
                    size: data.size,
                    originalName: data.originalName,
                };
                const existing: FileEntry[] = JSON.parse(localStorage.getItem(`jira_files_${issueId}`) || "[]");
                existing.push(newEntry);
                localStorage.setItem(`jira_files_${issueId}`, JSON.stringify(existing));

                loadFiles();
            } else {
                const data = await res.json().catch(() => ({}));
                flash(data.error || "Upload failed.", "error");
            }
        } catch {
            // Backend unreachable — store metadata in localStorage for demo purposes
            const ext = "." + file.name.split(".").pop()?.toLowerCase();
            const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}${ext}`;
            const newEntry: FileEntry = {
                storedName,
                issueId,
                size: String(file.size),
                originalName: file.name,
            };
            const existing: FileEntry[] = JSON.parse(localStorage.getItem(`jira_files_${issueId}`) || "[]");
            existing.push(newEntry);
            localStorage.setItem(`jira_files_${issueId}`, JSON.stringify(existing));
            flash(`"${file.name}" saved (offline mode).`, "success");
            loadFiles();
        } finally {
            setUploading(false);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    const handleDelete = async (storedName: string) => {
        setDeleting(storedName);
        try {
            await fetch(`${API_URL}/api/files/${issueId}/${storedName}`, { method: "DELETE" });
        } catch { /* offline — only remove from localStorage */ }

        // Remove from localStorage mirror
        const existing: FileEntry[] = JSON.parse(localStorage.getItem(`jira_files_${issueId}`) || "[]");
        const updated = existing.filter((f) => f.storedName !== storedName);
        localStorage.setItem(`jira_files_${issueId}`, JSON.stringify(updated));

        setFiles((prev) => prev.filter((f) => f.storedName !== storedName));
        setConfirmDel(null);
        setDeleting(null);
        flash("File deleted.", "success");
    };

    const downloadUrl = (storedName: string) =>
        `${API_URL}/api/files/download/${issueId}/${storedName}`;

    const displayName = (f: FileEntry) => f.originalName || f.storedName;

    return (
        <div className="space-y-4">
            {/* Flash messages */}
            {success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="text-xs font-medium text-green-700">{success}</p>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{error}</p>
                    <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
                </div>
            )}

            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition ${
                    dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
            >
                {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                ) : (
                    <>
                        <Upload className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm font-semibold text-gray-600">Click or drag & drop to upload</p>
                        <p className="mt-1 text-xs text-gray-400">PDF, PNG, JPG, DOCX · Max {MAX_SIZE_MB} MB</p>
                    </>
                )}
                <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
                    onChange={handleFileInput}
                    disabled={uploading}
                />
            </div>

            {/* File list */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                        <Paperclip className="h-3.5 w-3.5" /> Attachments ({files.length})
                    </p>
                </div>

                {files.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center">
                        <p className="text-xs text-gray-400">No attachments yet</p>
                    </div>
                ) : (
                    files.map((f) => (
                        <div key={f.storedName} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 hover:border-blue-200">
                            {fileIcon(f.storedName)}
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-semibold text-gray-800">{displayName(f)}</p>
                                <p className="text-[10px] text-gray-400">{formatSize(f.size)}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                    href={downloadUrl(f.storedName)}
                                    download={displayName(f)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                                    title="Download"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                </a>
                                {confirmDel === f.storedName ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDelete(f.storedName)}
                                            disabled={deleting === f.storedName}
                                            className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-700"
                                        >
                                            {deleting === f.storedName ? "…" : "Delete"}
                                        </button>
                                        <button onClick={() => setConfirmDel(null)} className="rounded px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-gray-600">
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDel(f.storedName)}
                                        className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
                                        title="Delete file"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FileAttachmentPanel;
