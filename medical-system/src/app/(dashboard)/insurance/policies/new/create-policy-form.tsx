'use client';

import { createPolicy } from "@/app/actions/insurance-policies";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Mail } from "lucide-react";

// Submit Button Component for pending state
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 active:scale-95"
        >
            {pending ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Policy...
                </>
            ) : (
                <>
                    <Save className="h-5 w-5" />
                    Create Policy
                </>
            )}
        </button>
    );
}

const initialState = {
    error: null as string | null,
};

export default function CreatePolicyForm() {
    const searchParams = useSearchParams();
    const defaultEmail = searchParams.get('email') || '';
    const [state, formAction] = useActionState(createPolicy, initialState);

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/insurance/policies" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-2 transition-colors group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Policies
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create New Policy</h1>
                    <p className="text-blue-200/50 mt-1">Issue a new insurance coverage to a registered patient.</p>
                </div>
            </div>

            <div className="glass p-8 sm:p-10 relative overflow-hidden shadow-2xl">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10" />

                <form action={formAction} className="space-y-8">
                    {state?.error && (
                        <div className="p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                            {state.error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="patientEmail" className="text-sm font-bold text-white/40 uppercase tracking-widest">Patient Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                                <input
                                    type="email"
                                    name="patientEmail"
                                    required
                                    defaultValue={defaultEmail}
                                    placeholder="patient@example.com"
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all outline-none font-medium"
                                />
                            </div>
                            <p className="text-xs text-white/30 italic">Important: The patient must be already registered with an email account.</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="policyNumber" className="text-sm font-bold text-white/40 uppercase tracking-widest">Policy Number</label>
                            <input
                                type="text"
                                name="policyNumber"
                                required
                                placeholder="POL-X100-Y200"
                                className="w-full h-14 px-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/40 transition-all outline-none font-mono font-bold uppercase tracking-widest"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="coverageAmount" className="text-sm font-bold text-white/40 uppercase tracking-widest">Coverage Maximum ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold">$</span>
                                <input
                                    type="number"
                                    name="coverageAmount"
                                    required
                                    min="0"
                                    placeholder="50000"
                                    className="w-full h-14 pl-8 pr-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/40 transition-all outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="validUntil" className="text-sm font-bold text-white/40 uppercase tracking-widest">Expiration Date</label>
                            <input
                                type="date"
                                name="validUntil"
                                required
                                className="w-full h-14 px-4 rounded-2xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/40 transition-all outline-none font-bold [color-scheme:dark]"
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
