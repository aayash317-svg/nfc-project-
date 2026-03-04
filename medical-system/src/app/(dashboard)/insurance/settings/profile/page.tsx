
import { getInsuranceProfile, updateInsuranceProfile } from "@/app/actions/insurance";
import { User, Mail, Phone, Building2, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function ProfileSettingsPage() {
    const { profile, error } = await getInsuranceProfile();

    if (error) {
        return (
            <div className="p-8 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
                Error loading profile: {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/insurance/settings" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-2 transition-colors group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Settings
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Account Profile</h1>
                    <p className="text-white/50 mt-1">Manage your professional information and company details.</p>
                </div>
            </div>

            <div className="glass p-8 relative overflow-hidden">
                <form action={updateInsuranceProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Company Name */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Insurance Provider Name
                            </label>
                            <input
                                name="company_name"
                                type="text"
                                defaultValue={profile?.insurance_providers?.[0]?.company_name}
                                className="w-full h-14 px-4 rounded-2xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/40 transition-all outline-none font-bold italic"
                            />
                        </div>

                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Contact Officer Name
                            </label>
                            <input
                                name="full_name"
                                type="text"
                                defaultValue={profile?.full_name}
                                className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/40 transition-all outline-none"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div className="space-y-2 opacity-60">
                            <label className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Professional Email
                            </label>
                            <div className="w-full h-12 px-4 rounded-xl bg-black/20 border border-white/5 text-white/50 flex items-center font-mono text-sm cursor-not-allowed">
                                {profile?.email}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Contact Phone
                            </label>
                            <input
                                name="phone"
                                type="tel"
                                defaultValue={profile?.phone || ""}
                                placeholder="Enter phone number"
                                className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/40 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end">
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}

function SubmitButton() {
    // Note: Since this is a server component, we should ideally use a client component 
    // for the button to show the loading state via useFormStatus.
    // However, for simplicity and speed, we'll keep it basic for now or make a small client component if needed.
    return (
        <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-600/20 active:scale-95"
        >
            <Save className="h-5 w-5" />
            Save Changes
        </button>
    );
}
