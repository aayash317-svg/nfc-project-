import { getPatientProfile } from "@/app/actions/patient";
import { EditProfileForm } from "./edit-profile-form";
import { Settings, User, Bell, Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PatientProfileSettingsPage() {
    const { data: patient, error } = await getPatientProfile();

    if (error || !patient) {
        console.error("Error loading patient profile:", error);
        redirect("/patient");
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/patient"
                        className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-blue-400 uppercase tracking-widest transition-colors mb-4 group"
                    >
                        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="h-8 w-8 text-blue-400" />
                        Health Profile Settings
                    </h1>
                    <p className="text-white/40 mt-2 text-sm">Update your identity, contact information, and medical defaults.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Internal Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="p-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center gap-3 font-bold text-sm">
                        <User className="h-4 w-4" />
                        Personal Info
                    </div>
                    <div className="p-4 text-white/30 hover:bg-white/5 rounded-xl flex items-center gap-3 font-bold text-sm cursor-not-allowed grayscale">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </div>
                    <div className="p-4 text-white/30 hover:bg-white/5 rounded-xl flex items-center gap-3 font-bold text-sm cursor-not-allowed grayscale">
                        <Shield className="h-4 w-4" />
                        Security & 2FA
                    </div>
                </div>

                {/* Form Container */}
                <div className="lg:col-span-3">
                    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
                        <EditProfileForm initialData={patient} />
                    </div>
                </div>
            </div>
        </div>
    );
}
