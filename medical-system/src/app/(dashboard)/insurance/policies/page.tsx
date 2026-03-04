import { getProviderPolicies } from "@/app/actions/insurance-policies";
import Link from "next/link";
import { Plus, Search, FileText, Trash2 } from "lucide-react";
import DeleteButton from "@/components/insurance/delete-button";

export default async function PoliciesPage() {
    const { policies, error } = await getProviderPolicies();

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Policy Management</h1>
                    <p className="text-blue-200/50 mt-1">Manage and track patient insurance policies.</p>
                </div>
                <Link
                    href="/insurance/policies/new"
                    className="flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20"
                >
                    <Plus className="h-5 w-5" />
                    New Policy
                </Link>
            </div>

            {/* Content */}
            {error ? (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                    Error loading policies: {error}
                </div>
            ) : (
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden shadow-2xl">
                    {policies && policies.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/[0.04]">
                                        <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Policy Number</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Coverage</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Valid Until</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {policies.map((policy: any) => {
                                        const patientName = policy.patients?.profiles?.full_name || "Unknown";
                                        const patientEmail = policy.patients?.profiles?.email || "-";

                                        return (
                                            <tr key={policy.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-5 font-mono text-sm text-blue-400">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                            <FileText className="h-4 w-4 text-blue-400" />
                                                        </div>
                                                        {policy.policy_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-semibold text-white/90">{patientName}</div>
                                                    <div className="text-xs text-white/40">{patientEmail}</div>
                                                </td>
                                                <td className="px-6 py-5 font-bold text-white/80">
                                                    ${Number(policy.coverage_amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-5 text-white/60">
                                                    {new Date(policy.valid_until).toISOString().split('T')[0]}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${policy.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-white/5 text-white/40 border-white/10'
                                                        }`}>
                                                        {policy.status || 'UNKNOWN'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="text-blue-400 hover:text-blue-300 font-bold text-xs transition-colors px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">Manage</button>
                                                        <DeleteButton id={policy.id} type="policy" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 px-4">
                            <div className="bg-white/5 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 rotate-12 group-hover:rotate-0 transition-transform">
                                <FileText className="h-10 w-10 text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No policies found</h3>
                            <p className="text-white/40 mt-1 max-w-sm mx-auto text-sm leading-relaxed">
                                You haven&apos;t created any insurance policies yet. Create one to start managing coverage.
                            </p>
                            <Link href="/insurance/policies/new" className="mt-8 inline-flex items-center gap-2.5 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all text-sm font-bold">
                                <Plus className="h-4 w-4" />
                                Create First Policy
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
