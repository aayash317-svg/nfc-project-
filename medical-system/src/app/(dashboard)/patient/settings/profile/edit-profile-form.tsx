'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePatientProfile } from "@/app/actions/patient";
import { User, Calendar, Droplets, Phone, Shield, Save, Loader2 } from "lucide-react";

export function EditProfileForm({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await updatePatientProfile(formData);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            router.refresh();
            router.push('/patient');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Full Name</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            name="fullName"
                            type="text"
                            defaultValue={initialData?.profiles?.full_name}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                            placeholder="Your full name"
                            required
                        />
                    </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Date of Birth</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            name="dob"
                            type="date"
                            defaultValue={initialData?.dob}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                        />
                    </div>
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Blood Group</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Droplets className="h-4 w-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <select
                            name="bloodGroup"
                            defaultValue={initialData?.blood_group}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all appearance-none"
                        >
                            <option value="" className="bg-slate-900">Select Group</option>
                            <option value="A+" className="bg-slate-900">A+</option>
                            <option value="A-" className="bg-slate-900">A-</option>
                            <option value="B+" className="bg-slate-900">B+</option>
                            <option value="B-" className="bg-slate-900">B-</option>
                            <option value="AB+" className="bg-slate-900">AB+</option>
                            <option value="AB-" className="bg-slate-900">AB-</option>
                            <option value="O+" className="bg-slate-900">O+</option>
                            <option value="O-" className="bg-slate-900">O-</option>
                        </select>
                    </div>
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Email (Primary ID)</label>
                    <div className="relative group opacity-50">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Shield className="h-4 w-4 text-white/20" />
                        </div>
                        <input
                            type="email"
                            value={initialData?.profiles?.email || ""}
                            readOnly
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white/50 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="pt-6 border-t border-white/5">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                    <div className="h-1 w-4 bg-rose-500 rounded-full" />
                    Emergency Contact Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Contact Name</label>
                        <input
                            name="emergencyName"
                            type="text"
                            defaultValue={initialData?.emergency_contact?.name}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.05] transition-all"
                            placeholder="Who should we call?"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Contact Phone</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-white/20 group-focus-within:text-rose-400 transition-colors" />
                            </div>
                            <input
                                name="emergencyPhone"
                                type="tel"
                                defaultValue={initialData?.emergency_contact?.phone}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.05] transition-all"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Save className="h-5 w-5" />
                    )}
                    {isLoading ? "Saving changes..." : "Save Profile Details"}
                </button>
            </div>
        </form>
    );
}
