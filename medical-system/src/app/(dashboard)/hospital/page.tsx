'use client';

import { useState, useEffect } from "react";
import { ClipboardList, Plus, Search, UserCheck, Users, ArrowRight, History, Zap } from "lucide-react";
import Link from "next/link";
import { searchPatients, getRecentScans } from "@/app/actions/hospital";
import { Profile } from "@/types";
export default function HospitalDashboard() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Profile[]>([]);
    const [searching, setSearching] = useState(false);
    const [scans, setScans] = useState<any[]>([]);
    const [loadingScans, setLoadingScans] = useState(true);

    useEffect(() => {
        async function loadScans() {
            const { scans: recentScans } = await getRecentScans();
            setScans(recentScans || []);
            setLoadingScans(false);
        }
        loadScans();
    }, []);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;

        setSearching(true);
        const { patients } = await searchPatients(query);
        setResults(patients || []);
        setSearching(false);
    }

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hospital Dashboard</h1>
                    <p className="text-muted-foreground">Manage patient records and hospital operations.</p>
                </div>
                {/* ACTION: Link to NFC System Flask App */}
                <div className="flex gap-4">
                    <a
                        href="http://127.0.0.1:5000"
                        target="_blank"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all"
                    >
                        <Search className="h-4 w-4" />
                        Launch NFC Scanner
                    </a>
                    <button className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                        About Hospital
                    </button>
                </div>
            </div>

            {/* Patient Search Section */}
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Search className="h-5 w-5 text-emerald-600" />
                    Patient Search
                </h2>
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        type="text"
                        placeholder="Search by Name, Email or Patient ID..."
                        className="flex-1 h-12 px-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                    <button disabled={searching} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                        {searching ? "Searching..." : "Search Database"}
                    </button>
                </form>

                {/* Search Results */}
                {results.length > 0 && (
                    <div className="mt-6 border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {results.map((p: Profile) => (
                                    <tr key={p.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{p.full_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={`/hospital/patient/${p.id}`} className="text-emerald-600 hover:underline inline-flex items-center gap-1">
                                                View Records <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Scans Section */}
            <div className="bg-card border border-border overflow-hidden rounded-2xl shadow-sm">
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/20">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-500" />
                        Recently Scanned Patients
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full">
                        <Zap className="h-3 w-3 text-blue-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Live Scans</span>
                    </div>
                </div>

                <div className="p-0">
                    {loadingScans ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">
                            Loading recent activity...
                        </div>
                    ) : scans.length > 0 ? (
                        <div className="divide-y divide-border">
                            {scans.map((scan: any) => (
                                <div key={scan.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                                            {scan.patient_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground group-hover:text-blue-500 transition-colors">{scan.patient_name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{scan.patient_email}</span>
                                                <span className="h-1 w-1 rounded-full bg-border" />
                                                <span>{new Date(scan.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/hospital/patient/${scan.patient_id}`}
                                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-xs font-bold transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
                                    >
                                        View Records <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 opacity-50">
                                <Search className="h-6 w-6" />
                            </div>
                            <p className="font-medium text-foreground/60 mb-1">No recent scans found</p>
                            <p className="text-xs">Use the NFC Scanner to securely access patient records.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function DashboardCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-card border border-border p-6 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                {icon}
            </div>
            <div className="text-3xl font-bold">{value}</div>
        </div>
    )
}
