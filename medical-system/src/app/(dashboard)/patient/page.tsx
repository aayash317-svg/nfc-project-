import { createClient } from "@/lib/supabase/server";
import { Activity, Calendar, FileText, ShieldCheck, User, Phone, AlertTriangle, FileDown, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
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
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/50 border border-white/5 p-8 md:p-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-20 -mt-20 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-3xl rounded-full -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-primary">
                            <Activity className="h-3 w-3" />
                            Live Health Pulse
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                            Welcome back,<br />
                            <span className="text-gradient">{profile?.full_name?.split(' ')[0] || 'Patient'}</span>
                        </h1>
                        <p className="text-lg text-white/50 max-w-md">
                            Your comprehensive health identity and medical summary are synced and ready.
                        </p>
                    </div>

                    {/* NFC / QR Identity Card (Client Component) */}
                    {patient?.nfc_tag_id && patient?.qr_code_token && (
                        <div className="w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
                            <PatientIdentityCard
                                nfcTagId={patient.nfc_tag_id}
                                qrCodeToken={patient.qr_code_token}
                                patientId={patient.id}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Blood Group"
                    value={patient?.blood_group || "N/A"}
                    icon={<Activity className="h-6 w-6" />}
                    color="text-rose-500"
                    bgColor="bg-rose-500/10"
                    subtext="Verified System"
                />
                <StatCard
                    title="Age / DOB"
                    value={patient?.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"}
                    icon={<Calendar className="h-6 w-6" />}
                    color="text-blue-500"
                    bgColor="bg-blue-500/10"
                    subtext="Universal Record"
                />
                <StatCard
                    title="Insurance Status"
                    value={policy ? "Active" : "None"}
                    icon={<ShieldCheck className="h-6 w-6" />}
                    color="text-emerald-500"
                    bgColor="bg-emerald-500/10"
                    subtext={policy?.policy_number || "No Active Policy"}
                />
                <StatCard
                    title="Cloud Records"
                    value={records?.length?.toString() || "0"}
                    icon={<FileText className="h-6 w-6" />}
                    color="text-cyan-500"
                    bgColor="bg-cyan-500/10"
                    subtext="Encrypted Storage"
                />
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Medical History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <HistoryIcon className="h-6 w-6 text-primary" />
                            Recent Medical Activity
                        </h3>
                        <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                            View Roadmap
                        </button>
                    </div>

                    <div className="glass overflow-hidden border-white/5 bg-slate-900/40 shadow-2xl">
                        {!records || records.length === 0 ? (
                            <div className="p-16 text-center space-y-4">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
                                    <FileText className="h-8 w-8 text-white/20" />
                                </div>
                                <h4 className="text-lg font-bold text-white/40">No records found</h4>
                                <p className="text-sm text-white/20 max-w-xs mx-auto text-balance">Your medical history will appear here once scans or reports are uploaded.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {records.map((rec: any) => (
                                    <div key={rec.id} className="p-6 flex items-center justify-between hover:bg-white/[0.04] transition-all cursor-pointer group">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-black text-xs shadow-inner border border-white/5">
                                                {rec.record_type?.substring(0, 3).toUpperCase() || 'REC'}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                                    {rec.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-bold text-white/30 uppercase tracking-tighter">
                                                        {new Date(rec.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-white/10" />
                                                    <span className="text-xs text-white/20">Authorized Scan</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Emergency Protocols Card */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-rose-500" />
                        Emergency Shield
                    </h3>

                    <div className="glass p-8 space-y-8 border-rose-500/10 bg-rose-500/[0.02]">
                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Primary Contact</p>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-white">{patient?.emergency_contact?.name || "Not Set"}</p>
                                    <p className="text-sm font-medium text-white/50 flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        {patient?.emergency_contact?.phone || "No phone provided"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/30">Auto-Alert System</span>
                                    <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest px-2 py-0.5 bg-emerald-400/10 rounded-md">Online</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/30">NFC Priority</span>
                                    <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest px-2 py-0.5 bg-emerald-400/10 rounded-md">Critical</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-3">
                            <AlertTriangle className="h-5 w-5 animate-pulse" />
                            EMERGENCY SOS MODE
                        </button>
                    </div>

                    {/* Quick Access Card */}
                    <div className="glass p-6 bg-blue-600/10 border-blue-600/20 group hover:bg-blue-600/20 transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Medical Wallet</p>
                                <h4 className="font-bold text-white">Download Identity</h4>
                            </div>
                            <FileDown className="h-6 w-6 text-white/20 group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, subtext, color, bgColor }: {
    title: string,
    value: string,
    icon: React.ReactNode,
    subtext: string,
    color: string,
    bgColor: string
}) {
    return (
        <div className="glass p-6 group hover:translate-y-[-4px] transition-all duration-300 bg-slate-900/40 border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${bgColor} ${color} group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
            </div>
            <div className="space-y-1">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none">{title}</p>
                <h3 className="text-2xl font-black text-white tracking-tight truncate">{value}</h3>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">{subtext}</p>
            </div>
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
