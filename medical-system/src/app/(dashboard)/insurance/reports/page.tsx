
import { BarChart3, TrendingUp, Download, Calendar, Shield, Activity, Percent } from "lucide-react";
import { getInsuranceStats, getInsuranceTrends } from "@/app/actions/insurance";
import AnalyticsChart from "@/components/insurance/analytics-chart";

export default async function InsuranceReportsPage() {
    const statsResult = await getInsuranceStats();
    const trendsResult = await getInsuranceTrends();

    if ('error' in statsResult) return <div>Error loading reports</div>;

    const { activePolicies, pendingClaims, totalPremium } = statsResult;
    const trends = ('trends' in trendsResult ? trendsResult.trends : []) || [];
    const isSimulated = 'isSimulated' in trendsResult ? trendsResult.isSimulated : false;

    const reportStats = [
        { label: "Active Coverage", value: `$${(totalPremium / 1000).toFixed(1)}K`, sub: "Total liability", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Claims Traffic", value: pendingClaims.toString(), sub: "Awaiting review", icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: "Policy Growth", value: activePolicies.toString(), sub: "Total scale", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Approval Rate", value: "94.2%", sub: "Last 30 days", icon: Percent, color: "text-purple-400", bg: "bg-purple-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-blue-400" />
                        Reports & Analytics
                    </h1>
                    <p className="text-white/50 mt-2">Comprehensive overview of insurance performance.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium text-sm">
                    <Download className="h-4 w-4" /> Export Data
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {reportStats.map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                            <span className="text-[10px] font-bold text-white/20 tracking-widest uppercase">KPI</span>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h2>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight">{stat.label}</p>
                            <p className="text-[10px] text-white/20">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <BarChart3 className="h-32 w-32 text-blue-500" />
                </div>

                <div className="relative space-y-8">
                    <div>
                        <h3 className="text-sm font-bold text-white/80 tracking-wide uppercase italic">Growth Trajectory</h3>
                        <p className="text-xs text-white/30">Monthly comparison of insurance adoption and service usage.</p>
                    </div>

                    <AnalyticsChart data={trends} isSimulated={isSimulated} />
                </div>
            </div>
        </div>
    );
}
