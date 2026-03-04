import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Building2, ShieldCheck, Users, Plus } from "lucide-react";
import Link from "next/link";
import { DeleteOrgButton } from "@/components/admin/delete-org-button";

export const dynamic = 'force-dynamic';

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

async function getStats() {
    const supabase = createAdminClient();
    const [
        { count: hospitalCount, data: hospitals },
        { count: insuranceCount, data: insurers },
        { count: patientCount }
    ] = await Promise.all([
        supabase.from("hospitals").select("id, profiles(full_name)", { count: "exact" }),
        supabase.from("insurance_providers").select("id, company_name", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
    ]);

    return {
        hospitalCount: hospitalCount ?? 0,
        insuranceCount: insuranceCount ?? 0,
        patientCount: patientCount ?? 0,
        hospitals: hospitals?.map((h: any) => ({ id: h.id, name: h.profiles?.full_name })) || [],
        insurers: insurers?.map((i: any) => ({ id: i.id, name: i.company_name })) || []
    };
}

export default async function AdminDashboard() {
    const { hospitalCount, insuranceCount, patientCount, hospitals, insurers } = await getStats();

    return (
        <div className="space-y-8">
            <style>{scrollbarStyles}</style>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">System overview and management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass p-6 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hospitals</span>
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-5xl font-bold text-foreground tracking-tighter">{hospitalCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total registered nodes</p>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col bg-black/20 rounded-xl border border-white/5">
                        <div className="p-3 border-b border-white/5 bg-white/5">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Registry List</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                            <ul className="space-y-2">
                                {hospitals.length > 0 ? (
                                    hospitals.map((h: any, idx: number) => (
                                        <li key={idx} className="text-xs text-foreground/80 flex items-center justify-between group py-0.5">
                                            <div className="flex items-center gap-2 truncate pr-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors flex-shrink-0" />
                                                <span className="truncate">{h.name}</span>
                                            </div>
                                            <DeleteOrgButton id={h.id} orgType="hospital" orgName={h.name} />
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-xs text-muted-foreground italic">No nodes registered</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="glass p-6 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Insurers</span>
                        <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-purple-400" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-5xl font-bold text-foreground tracking-tighter">{insuranceCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">Insurance providers</p>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col bg-black/20 rounded-xl border border-white/5">
                        <div className="p-3 border-b border-white/5 bg-white/5">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-purple-400">Provider List</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                            <ul className="space-y-2">
                                {insurers.length > 0 ? (
                                    insurers.map((inc: any, idx: number) => (
                                        <li key={idx} className="text-xs text-foreground/80 flex items-center justify-between group py-0.5">
                                            <div className="flex items-center gap-2 truncate pr-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-purple-400/50 group-hover:bg-purple-400 transition-colors flex-shrink-0" />
                                                <span className="truncate">{inc.name}</span>
                                            </div>
                                            <DeleteOrgButton id={inc.id} orgType="insurance" orgName={inc.name} />
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-xs text-muted-foreground italic">No providers listed</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="glass p-6 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Patients</span>
                        <div className="h-10 w-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-cyan-400" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-5xl font-bold text-foreground tracking-tighter">{patientCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">Registered health IDs</p>
                    </div>

                    <div className="flex-1 flex items-center justify-center bg-black/20 rounded-xl border border-white/5 border-dashed">
                        <div className="text-center p-4">
                            <Users className="h-8 w-8 text-white/10 mx-auto mb-2" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">User Management</p>
                            <p className="text-[9px] text-white/20 mt-1">Cross-org identities active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/admin/create-org" className="glass p-6 flex items-center gap-4 hover:border-primary/30 transition-all group">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Create Organization</h3>
                            <p className="text-sm text-muted-foreground">Add a hospital or insurance provider</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
