import { createClient } from "@/lib/supabase/server";
import { Activity, Calendar, FileText, ShieldCheck, User, Phone, AlertTriangle, FileDown, ArrowRight, ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PatientIdentityCard } from "@/components/PatientIdentityCard";

export default async function PatientDashboard() {
    const supabase = await createClient();

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 2. Fetch Patient Profile & Details
    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select(`
      *,
      profiles:profiles!patients_id_fkey (
        full_name,
        email
      )
    `)
        .eq('id', user.id)
        .single();

    if (patientError && patientError.code !== 'PGRST116') {
        console.error("Patient load error:", patientError?.message || "Unknown error");
    }

    const profile = patient?.profiles;

    // 3. Fetch Medical Records (Limit 5)
    const { data: records } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    // 4. Fetch Insurance Policy
    const { data: policy } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('patient_id', user.id)
        .single();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Unified Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/20 border border-white/10 p-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
                <div className="relative flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Health Identity Active</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            Welcome back, {profile?.full_name?.split(' ')[0] || 'Patient'}
                        </h1>
                        <p className="text-blue-100/60 mt-1 max-w-md text-sm">
                            Your universal health records and insurance status are synchronized.
                        </p>

                        {(!patient?.dob || !patient?.blood_group) && (
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                Profile Incomplete: Data missing
                            </div>
                        )}

                        <div className="mt-6">
                            <Link
                                href="/patient/settings/profile"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all group"
                            >
                                <User className="h-3.5 w-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                                Edit Health Profile
                            </Link>
                        </div>
                    </div>

                    {/* Integrated Identity Card (Smaller Scale) */}
                    {patient?.nfc_tag_id && patient?.qr_code_token && (
                        <div className="w-full max-w-xs scale-90 md:scale-100">
                            <PatientIdentityCard
                                nfcTagId={patient.nfc_tag_id}
                                qrCodeToken={patient.qr_code_token}
                                patientId={patient.id}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Consistent Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Blood Group"
                    value={patient?.blood_group || "N/A"}
                    icon={<Activity className="h-5 w-5" />}
                    color="from-rose-500 to-pink-500"
                    subtext="Verified System"
                />
                <StatCard
                    title="Date of Birth"
                    value={patient?.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"}
                    icon={<Calendar className="h-5 w-5" />}
                    color="from-blue-500 to-cyan-400"
                    subtext="Profile Birthdate"
                />
                <StatCard
                    title="Insurance Policy"
                    value={policy ? "Active" : "None"}
                    icon={<ShieldCheck className="h-5 w-5" />}
                    color="from-emerald-500 to-green-400"
                    subtext={policy?.policy_number || "No Active Policy"}
                />
                <StatCard
                    title="Medical Records"
                    value={records?.length?.toString() || "0"}
                    icon={<FileText className="h-5 w-5" />}
                    color="from-purple-500 to-indigo-400"
                    subtext="Secured on Cloud"
                />
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity List */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden shadow-xl">
                        <div className="p-5 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/15 rounded-lg">
                                    <HistoryIcon className="h-4 w-4 text-blue-400" />
                                </div>
                                <h3 className="text-base font-bold text-white">Recent Medical Activity</h3>
                            </div>
                            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1">
                                View History <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>

                        {!records || records.length === 0 ? (
                            <div className="p-12 text-center text-white/20 italic text-sm">
                                No recent medical records found.
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {records.map((rec: any) => (
                                    <div key={rec.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 font-bold text-[10px] tracking-tighter">
                                                {rec.record_type?.substring(0, 3).toUpperCase() || 'REC'}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                    {rec.title}
                                                </h4>
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                                    {new Date(rec.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/10 bg-white/5 text-white/50 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all uppercase tracking-widest">
                                            Details
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="p-3 text-center bg-white/[0.02] border-t border-white/[0.04]">
                            <button className="text-[10px] font-black text-white/30 hover:text-white/60 uppercase tracking-[0.2em] transition-colors">
                                Secure Encrypted Roadmap
                            </button>
                        </div>
                    </div>
                </div>

                {/* Emergency & Quick Access */}
                <div className="space-y-6">
                    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/15 rounded-lg">
                                <ShieldCheck className="h-4 w-4 text-rose-400" />
                            </div>
                            <h3 className="text-base font-bold text-white tracking-tight">Emergency Data</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Primary Contact</p>
                                <p className="text-base font-bold text-white">{patient?.emergency_contact?.name || "Not Configured"}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-white/50 font-medium">
                                    <Phone className="h-3 w-3" />
                                    {patient?.emergency_contact?.phone || "No phone linked"}
                                </div>
                            </div>

                            <button className="w-full py-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 group">
                                <AlertTriangle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                EMERGENCY SOS MODE
                            </button>
                        </div>
                    </div>

                    {/* Quick Link */}
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 group hover:bg-blue-600/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <FileDown className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Medical ID Card</h4>
                                <p className="text-xs text-blue-400/50">Save to device</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, subtext, color }: {
    title: string,
    value: string,
    icon: React.ReactNode,
    subtext: string,
    color: string
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300">
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />

            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                    <span className="text-white/70">{icon}</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-white/10 group-hover:bg-blue-400 transition-colors" />
            </div>

            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white tracking-tight truncate">{value}</h3>
            <p className="text-[10px] font-medium text-white/20 mt-1">{subtext}</p>
        </div>
    )
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
            <path d="M3 3v9h9" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
