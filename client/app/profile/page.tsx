"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    User, Mail, Shield, Users, Camera, Save, Lock,
    Eye, EyeOff, CheckCircle2, AlertTriangle, XCircle,
    Phone, ClipboardList, UserX, Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

// ─── constants ────────────────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const AUDIT_KEY = "jira_profile_audit";

// ─── password strength ────────────────────────────────────────────────────────
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Very Weak", color: "bg-red-500" };
    if (score === 2) return { score, label: "Weak", color: "bg-orange-400" };
    if (score === 3) return { score, label: "Fair", color: "bg-yellow-400" };
    if (score === 4) return { score, label: "Strong", color: "bg-blue-500" };
    return { score, label: "Very Strong", color: "bg-green-500" };
}

function validatePassword(pw: string): string[] {
    const errors: string[] = [];
    if (pw.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pw)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pw)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(pw)) errors.push("One special character");
    return errors;
}

// ─── audit log ───────────────────────────────────────────────────────────────
interface AuditLog {
    id: string; action: string; details: string; timestamp: string;
}
function appendAudit(action: string, details: string) {
    if (typeof window === "undefined") return;
    const logs: AuditLog[] = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
    logs.unshift({ id: `a-${Date.now()}`, action, details, timestamp: new Date().toISOString() });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs.slice(0, 50)));
}
function loadAudit(): AuditLog[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }: { msg: string; type: "success" | "error" | "warn"; onDismiss: () => void }) {
    useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [onDismiss]);
    const cls = type === "success" ? "bg-green-50 border-green-200 text-green-800"
        : type === "error" ? "bg-red-50 border-red-200 text-red-800"
        : "bg-amber-50 border-amber-200 text-amber-800";
    const Icon = type === "success" ? CheckCircle2 : type === "error" ? XCircle : AlertTriangle;
    return (
        <div className={`fixed bottom-6 right-6 z-[300] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium max-w-sm ${cls}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{msg}</span>
            <button onClick={onDismiss} className="ml-auto text-gray-400 hover:text-gray-600"><XCircle className="h-3.5 w-3.5" /></button>
        </div>
    );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ msg, onConfirm, onCancel }: { msg: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{msg}</p>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={onConfirm} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Confirm</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
    const { user, login, logout } = useAuth();

    // profile fields
    const [name, setName] = useState(user?.name || "User");
    const [email, setEmail] = useState(user?.email || "user@gmail.com");
    const [phone, setPhone] = useState("");
    const [group, setGroup] = useState("Engineering");
    const [avatarSrc, setAvatarSrc] = useState(user?.avatar || `https://i.pravatar.cc/150?u=${user?.email}`);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // email verification
    const [newEmail, setNewEmail] = useState("");
    const [emailVerifSent, setEmailVerifSent] = useState(false);
    const [emailVerifCode, setEmailVerifCode] = useState("");
    const [pendingVerifCode, setPendingVerifCode] = useState("");

    // password
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const pwStrength = getPasswordStrength(newPw);
    const pwErrors = validatePassword(newPw);

    // account status
    const [isDeactivated, setIsDeactivated] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [showAudit, setShowAudit] = useState(false);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

    // UI state
    const [activeTab, setActiveTab] = useState<"personal" | "security" | "account">("personal");
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "warn" } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setAuditLogs(loadAudit());
        const status = localStorage.getItem("jira_account_deactivated");
        if (status === "true") setIsDeactivated(true);
    }, []);

    const showToast = (msg: string, type: "success" | "error" | "warn" = "success") => setToast({ msg, type });

    // ── Image Upload ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            showToast(`Unsupported format. Allowed: JPG, PNG, GIF, WEBP`, "error"); return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            showToast(`Image exceeds ${MAX_IMAGE_SIZE_MB}MB limit.`, "error"); return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    // ── Save Personal Info ───────────────────────────────────────────────────
    const handleSavePersonal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { showToast("Name cannot be empty.", "error"); return; }
        const updated = {
            id: user?.id || "",
            email: user?.email || email,
            name,
            phone,
            group,
            avatar: avatarPreview || avatarSrc,
            role: user?.role,
        };

        if (avatarPreview) setAvatarSrc(avatarPreview);
        setAvatarPreview(null);
        login(updated, localStorage.getItem("jira_token") || "");
        appendAudit("PROFILE_UPDATE", `Name changed to "${name}", phone: "${phone}", group: "${group}"`);
        setAuditLogs(loadAudit());
        showToast("Profile updated successfully!");
    };

    // ── Email Verification Flow ───────────────────────────────────────────────
    const handleSendVerification = () => {
        if (!newEmail || !/^[^@]+@[^@]+\.[^@]+$/.test(newEmail)) {
            showToast("Enter a valid email address.", "error"); return;
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setPendingVerifCode(code);
        setEmailVerifSent(true);
        appendAudit("EMAIL_CHANGE_REQUEST", `Verification sent for: ${newEmail}`);
        setAuditLogs(loadAudit());
        showToast(`Verification code sent! (Demo code: ${code})`, "warn");
    };

    const handleVerifyEmail = () => {
        if (emailVerifCode !== pendingVerifCode) {
            showToast("Invalid verification code.", "error"); return;
        }
        const oldEmail = email;
        setEmail(newEmail);
        setNewEmail("");
        setEmailVerifSent(false);
        setEmailVerifCode("");
        setPendingVerifCode("");
        const updated = {
            id: user?.id || "",
            email: newEmail,
            name: user?.name || name,
            role: user?.role,
            avatar: user?.avatar || avatarSrc,
        };

        login(updated, localStorage.getItem("jira_token") || "");
        appendAudit("EMAIL_CHANGED", `Email changed from "${oldEmail}" to "${newEmail}"`);
        setAuditLogs(loadAudit());
        showToast("Email updated successfully!");
    };

    // ── Password Update ───────────────────────────────────────────────────────
    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        const storedPw = localStorage.getItem("jira_password") || "password";
        if (currentPw !== storedPw) { showToast("Current password is incorrect.", "error"); return; }
        if (pwErrors.length > 0) { showToast("New password doesn't meet requirements.", "error"); return; }
        if (newPw !== confirmPw) { showToast("Passwords do not match.", "error"); return; }
        localStorage.setItem("jira_password", newPw);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        appendAudit("PASSWORD_CHANGED", "Password was updated.");
        setAuditLogs(loadAudit());
        showToast("Password changed successfully!");
    };

    // ── Account Deactivation ─────────────────────────────────────────────────
    const handleDeactivate = () => {
        localStorage.setItem("jira_account_deactivated", "true");
        appendAudit("ACCOUNT_DEACTIVATED", "Account deactivated — login restricted. Historical data preserved.");
        setAuditLogs(loadAudit());
        setIsDeactivated(true);
        setShowDeactivateConfirm(false);
        showToast("Account deactivated. Historical data preserved for auditing.", "warn");
    };
    const handleReactivate = () => {
        localStorage.removeItem("jira_account_deactivated");
        appendAudit("ACCOUNT_REACTIVATED", "Account reactivated.");
        setAuditLogs(loadAudit());
        setIsDeactivated(false);
        showToast("Account reactivated!");
    };

    const tabs = [
        { id: "personal", label: "Personal Info" },
        { id: "security", label: "Security" },
        { id: "account", label: "Account" },
    ] as const;

    const labelCls = "flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5";
    const sectionCls = "rounded-xl border border-gray-200 bg-white p-6 space-y-5";

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-8 py-5">
                <h1 className="text-2xl font-semibold text-[#172B4D]">Profile</h1>
                <p className="mt-1 text-sm text-[#6B778C]">Manage your account information and security settings</p>
            </div>

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-2xl space-y-6">

                    {/* Deactivated banner */}
                    {isDeactivated && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <UserX className="h-5 w-5 text-red-500 shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-red-700">Account Deactivated</p>
                                <p className="text-xs text-red-600">Login is restricted. Historical data preserved for auditing.</p>
                            </div>
                            <button onClick={handleReactivate} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Reactivate</button>
                        </div>
                    )}

                    {/* Avatar Card */}
                    <div className={sectionCls}>
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={avatarPreview || avatarSrc} alt={name} />
                                    <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                                        {name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-700"
                                    title="Change picture"
                                >
                                    <Camera className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{name}</p>
                                <p className="text-sm text-gray-500">{email}</p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Allowed: JPG, PNG, GIF, WEBP · Max {MAX_IMAGE_SIZE_MB}MB
                                </p>
                                {avatarPreview && (
                                    <div className="mt-2 flex gap-2">
                                        <span className="text-xs text-green-600 font-medium">✓ New image selected</span>
                                        <button onClick={() => setAvatarPreview(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" className="hidden" onChange={handleImageSelect} />
                    </div>

                    {/* Tabs */}
                    <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600 bg-blue-50"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── PERSONAL INFO TAB ── */}
                    {activeTab === "personal" && (
                        <form onSubmit={handleSavePersonal} className={sectionCls}>
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Personal Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}><User className="h-4 w-4 text-gray-400" />Full Name *</label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                                </div>
                                <div>
                                    <label className={labelCls}><Phone className="h-4 w-4 text-gray-400" />Phone / Contact</label>
                                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" type="tel" />
                                </div>
                                <div>
                                    <label className={labelCls}><Users className="h-4 w-4 text-gray-400" />Group / Department</label>
                                    <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="e.g. Engineering" />
                                </div>
                                <div>
                                    <label className={labelCls}><Shield className="h-4 w-4 text-gray-400" />Role</label>
                                    <Input value={user?.role || "USER"} disabled className="bg-gray-50 text-gray-400" />
                                    <p className="mt-1 text-xs text-gray-400">Role is managed by the project administrator.</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" className="bg-[#0052CC] text-white hover:bg-[#0747A6]">
                                    <Save className="mr-2 h-4 w-4" />Save Changes
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* ── SECURITY TAB ── */}
                    {activeTab === "security" && (
                        <div className="space-y-5">
                            {/* Email Change */}
                            <div className={sectionCls}>
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Change Email</h2>
                                <div>
                                    <label className={labelCls}><Mail className="h-4 w-4 text-gray-400" />Current Email</label>
                                    <Input value={email} disabled className="bg-gray-50 text-gray-400" />
                                </div>
                                {!emailVerifSent ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className={labelCls}><Mail className="h-4 w-4 text-blue-500" />New Email Address</label>
                                            <Input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="newemail@example.com"
                                            />
                                        </div>
                                        <Button type="button" onClick={handleSendVerification} className="bg-blue-600 text-white hover:bg-blue-700">
                                            Send Verification Link
                                        </Button>
                                        <p className="text-xs text-gray-400">A verification code will be sent to your new email address before the change takes effect.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <p className="text-sm text-blue-700 font-medium">Enter the verification code sent to <strong>{newEmail}</strong></p>
                                        <Input
                                            value={emailVerifCode}
                                            onChange={(e) => setEmailVerifCode(e.target.value)}
                                            placeholder="6-digit code"
                                            maxLength={6}
                                            className="font-mono tracking-widest"
                                        />
                                        <div className="flex gap-2">
                                            <Button type="button" onClick={handleVerifyEmail} className="bg-green-600 text-white hover:bg-green-700">Verify & Update</Button>
                                            <Button type="button" variant="outline" onClick={() => { setEmailVerifSent(false); setEmailVerifCode(""); }}>Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Password Change */}
                            <form onSubmit={handleChangePassword} className={sectionCls}>
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Change Password</h2>

                                {/* Current Password */}
                                <div>
                                    <label className={labelCls}><Lock className="h-4 w-4 text-gray-400" />Current Password *</label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrent ? "text" : "password"}
                                            value={currentPw}
                                            onChange={(e) => setCurrentPw(e.target.value)}
                                            placeholder="Enter current password"
                                            className="pr-10"
                                        />
                                        <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className={labelCls}><Lock className="h-4 w-4 text-blue-500" />New Password *</label>
                                    <div className="relative">
                                        <Input
                                            type={showNew ? "text" : "password"}
                                            value={newPw}
                                            onChange={(e) => setNewPw(e.target.value)}
                                            placeholder="Enter new password"
                                            className="pr-10"
                                        />
                                        <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {/* Strength bar */}
                                    {newPw && (
                                        <div className="mt-2">
                                            <div className="flex h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${pwStrength.color}`} style={{ width: `${(pwStrength.score / 5) * 100}%` }} />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">Strength: <span className="font-semibold">{pwStrength.label}</span></p>
                                            {pwErrors.length > 0 && (
                                                <ul className="mt-1 space-y-0.5">
                                                    {pwErrors.map((e) => (
                                                        <li key={e} className="flex items-center gap-1.5 text-xs text-red-500">
                                                            <XCircle className="h-3 w-3" />{e}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className={labelCls}><Lock className="h-4 w-4 text-gray-400" />Confirm New Password *</label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirm ? "text" : "password"}
                                            value={confirmPw}
                                            onChange={(e) => setConfirmPw(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="pr-10"
                                        />
                                        <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {confirmPw && newPw !== confirmPw && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><XCircle className="h-3 w-3" />Passwords do not match</p>
                                    )}
                                    {confirmPw && newPw === confirmPw && confirmPw.length > 0 && (
                                        <p className="mt-1 text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Passwords match</p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" className="bg-[#0052CC] text-white hover:bg-[#0747A6]">
                                        <Lock className="mr-2 h-4 w-4" />Update Password
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── ACCOUNT TAB ── */}
                    {activeTab === "account" && (
                        <div className="space-y-5">
                            {/* Account Info */}
                            <div className={sectionCls}>
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Account Information</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        ["User ID", user?.id || "user-1"],
                                        ["Account Role", user?.role || "USER"],
                                        ["Group", group],
                                        ["Account Status", isDeactivated ? "Deactivated" : "Active"],
                                    ].map(([label, val]) => (
                                        <div key={label}>
                                            <p className="text-xs text-gray-500">{label}</p>
                                            <p className={`mt-1 text-sm font-semibold ${label === "Account Status" ? (isDeactivated ? "text-red-600" : "text-green-600") : "text-gray-800"}`}>{val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Deactivate Account */}
                            <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
                                <div className="flex items-start gap-3">
                                    <UserX className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                    <div>
                                        <h2 className="text-sm font-bold text-red-800">Deactivate Account</h2>
                                        <p className="text-xs text-red-700 mt-1">
                                            Restricts login access but <strong>preserves all historical activity data</strong> (work logs, audit trail, issues) for auditing purposes.
                                        </p>
                                    </div>
                                </div>
                                {isDeactivated ? (
                                    <button onClick={handleReactivate} className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                                        Reactivate Account
                                    </button>
                                ) : (
                                    <button onClick={() => setShowDeactivateConfirm(true)} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                        Deactivate My Account
                                    </button>
                                )}
                            </div>

                            {/* Audit Log */}
                            <div className={sectionCls}>
                                <button
                                    onClick={() => setShowAudit((v) => !v)}
                                    className="flex w-full items-center justify-between"
                                >
                                    <span className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                                        <ClipboardList className="h-4 w-4 text-gray-500" />
                                        Activity Audit Log ({auditLogs.length})
                                    </span>
                                    <span className="text-xs text-blue-600">{showAudit ? "Hide" : "Show"}</span>
                                </button>

                                {showAudit && (
                                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                                        {auditLogs.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-4">No activity yet.</p>
                                        ) : (
                                            auditLogs.map((log) => (
                                                <div key={log.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700">{log.action}</span>
                                                        <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-600">{log.details}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}

            {/* Deactivate Confirm */}
            {showDeactivateConfirm && (
                <ConfirmDialog
                    msg="Are you sure you want to deactivate your account? Login access will be restricted, but all historical data will be preserved."
                    onConfirm={handleDeactivate}
                    onCancel={() => setShowDeactivateConfirm(false)}
                />
            )}
        </div>
    );
};

export default ProfilePage;