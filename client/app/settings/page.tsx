"use client";

import React, { useState, useEffect } from "react";
import {
    Bell, Mail, CheckCircle2, Sliders, Save,
    AlertTriangle, ToggleLeft, ToggleRight,
} from "lucide-react";
import { getPrefs, savePrefs, type NotifPreferences, DEFAULT_PREFS } from "@/lib/notificationManager";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
    const [prefs, setPrefs] = useState<NotifPreferences>(DEFAULT_PREFS);
    const [saved, setSaved] = useState(false);

    useEffect(() => { setPrefs(getPrefs()); }, []);

    const toggle = (key: keyof NotifPreferences) =>
        setPrefs((p) => ({ ...p, [key]: !p[key] }));

    const handleSave = () => {
        savePrefs(prefs);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    type ToggleRowProps = { label: string; description: string; checked: boolean; onChange: () => void; icon?: React.ReactNode };
    const ToggleRow = ({ label, description, checked, onChange, icon }: ToggleRowProps) => (
        <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
            <div className="flex items-start gap-3">
                {icon && <div className="mt-0.5 text-gray-400">{icon}</div>}
                <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>
            <button
                onClick={onChange}
                className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                    checked ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}
            >
                {checked
                    ? <><ToggleRight className="h-4 w-4" /> On</>
                    : <><ToggleLeft className="h-4 w-4" /> Off</>}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-4 sm:px-8 py-4 sm:py-5">
                <h1 className="text-xl sm:text-2xl font-semibold text-[#172B4D]">Settings</h1>
                <p className="mt-1 text-sm text-[#6B778C]">Manage your notification preferences and account settings.</p>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
                <div className="mx-auto max-w-2xl space-y-6">

                    {/* Saved banner */}
                    {saved && (
                        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-green-700">Settings saved successfully!</p>
                        </div>
                    )}

                    {/* In-App Notifications */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="h-5 w-5 text-blue-600" />
                            <h2 className="text-base font-bold text-gray-800">In-App Notifications</h2>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Choose which events trigger in-app notifications in the bell icon.</p>

                        <div className="divide-y divide-gray-100">
                            <ToggleRow
                                label="Task Assignment"
                                description="Notify when a task is assigned to you."
                                checked={prefs.taskAssigned}
                                onChange={() => toggle("taskAssigned")}
                                icon={<Sliders className="h-4 w-4" />}
                            />
                            <ToggleRow
                                label="Status Changes"
                                description="Notify when a task's status is updated."
                                checked={prefs.statusChanged}
                                onChange={() => toggle("statusChanged")}
                                icon={<Sliders className="h-4 w-4" />}
                            />
                            <ToggleRow
                                label="Due Date Reminders"
                                description="Notify 24 hours before a task deadline."
                                checked={prefs.dueDateReminder}
                                onChange={() => toggle("dueDateReminder")}
                                icon={<AlertTriangle className="h-4 w-4" />}
                            />
                            <ToggleRow
                                label="Sprint Events"
                                description="Notify when a sprint starts or ends."
                                checked={prefs.sprintEvents}
                                onChange={() => toggle("sprintEvents")}
                                icon={<Sliders className="h-4 w-4" />}
                            />
                            <ToggleRow
                                label="Comment Notifications"
                                description="Notify when someone comments on your tasks."
                                checked={prefs.commentAdded}
                                onChange={() => toggle("commentAdded")}
                                icon={<Sliders className="h-4 w-4" />}
                            />
                        </div>
                    </div>

                    {/* Email Notifications */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <h2 className="text-base font-bold text-gray-800">Email Notifications</h2>
                        </div>

                        <div className={`rounded-lg border p-4 mb-4 ${prefs.emailEnabled ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
                            <ToggleRow
                                label="Enable Email Notifications"
                                description="Send email alerts to your registered address for critical events. Emails are only sent when this is enabled."
                                checked={prefs.emailEnabled}
                                onChange={() => toggle("emailEnabled")}
                                icon={<Mail className="h-4 w-4" />}
                            />
                        </div>

                        {prefs.emailEnabled ? (
                            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                                <p className="text-xs text-green-700 flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Email notifications are <strong>enabled</strong>. Alerts will be sent for the event types toggled above.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                                <p className="text-xs text-amber-700 flex items-center gap-2">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Email notifications are <strong>disabled</strong>. Toggle above to receive email alerts.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Save */}
                    <div className="flex justify-end">
                        <Button onClick={handleSave} className="bg-[#0052CC] text-white hover:bg-[#0747A6]">
                            <Save className="mr-2 h-4 w-4" />Save Preferences
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
