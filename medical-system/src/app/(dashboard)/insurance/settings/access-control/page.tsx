
import { Shield, Key, Lock, Users, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function AccessControlSettingsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <Link href="/insurance/settings" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-2 transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Settings
                </Link>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Shield className="h-8 w-8 text-cyan-400" />
                    Access Control
                </h1>
                <p className="text-white/50 mt-1">Manage department permissions and secure API access keys.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* API Keys Section */}
                <div className="glass p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                                <Key className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">API Management</h3>
                                <p className="text-sm text-white/30">Generate keys for external integration and data access.</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/20 transition-all font-bold text-sm">
                            <Plus className="h-4 w-4" />
                            Create Key
                        </button>
                    </div>

                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center space-y-2">
                        <p className="text-sm text-white/20">No active API keys found.</p>
                        <p className="text-xs text-white/10 uppercase tracking-widest font-bold">Secure Environment</p>
                    </div>
                </div>

                {/* Team Permissions */}
                <div className="glass p-8 space-y-6 opacity-60">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Users className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Department Permissions</h3>
                            <p className="text-sm text-white/30">Control what other officers in your department can access.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
                        <div className="text-sm font-medium text-white/40">Enterprise feature only available in higher tiers.</div>
                        <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/20">Upgrade</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
