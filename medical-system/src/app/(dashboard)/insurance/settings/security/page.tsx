
import { Shield, Lock, Key, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SecuritySettingsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <Link href="/insurance/settings" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-2 transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Settings
                </Link>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Lock className="h-8 w-8 text-rose-400" />
                    Security Settings
                </h1>
                <p className="text-white/50 mt-1">Manage your password, authentication, and session security.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Password Section */}
                <div className="glass p-8 space-y-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/10 rounded-lg">
                                <Key className="h-5 w-5 text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Password Management</h3>
                                <p className="text-sm text-white/30">Regularly updating your password keeps your account secure.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200/60 leading-relaxed">
                            To update your password, we will send a secure reset link to your professional email address.
                        </p>
                    </div>

                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all flex items-center justify-center gap-2">
                        Send Password Reset Email
                    </button>
                </div>

                {/* Two-Factor Auth (Placeholder) */}
                <div className="glass p-8 opacity-60">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Shield className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Two-Factor Authentication (2FA)</h3>
                            <p className="text-sm text-white/30">Add an extra layer of security to your account.</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-lg inline-flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                        Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
}
