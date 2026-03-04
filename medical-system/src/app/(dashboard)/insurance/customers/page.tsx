import { getProviderCustomers } from "@/app/actions/insurance";
import { Users, Phone, Mail, FileText, Activity, Trash2 } from "lucide-react";
import DeleteButton from "@/components/insurance/delete-button";

export default async function CustomersPage() {
    const { customers, error } = await getProviderCustomers();

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Customer Directory</h1>
                    <p className="text-blue-200/50 mt-1">View and manage patients covered by your active policies.</p>
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                    Error loading customers: {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers && customers.length > 0 ? (
                        customers.map((customer: any) => (
                            <div key={customer.id} className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 shadow-xl">
                                {/* Gradient accent */}
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 opacity-40 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 text-blue-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-blue-500/20 group-hover:scale-110 transition-transform">
                                            {customer.profiles?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">{customer.profiles?.full_name}</h3>
                                            <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">ID: {customer.id.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-500/20">
                                            Verified
                                        </div>
                                        <DeleteButton id={customer.id} type="patient" />
                                    </div>
                                </div>

                                <div className="space-y-3.5 text-sm mb-6">
                                    <div className="flex items-center gap-3 text-white/60 hover:text-white/90 transition-colors">
                                        <div className="p-1.5 bg-white/5 rounded-lg">
                                            <Mail className="h-4 w-4 text-white/40" />
                                        </div>
                                        <span className="truncate">{customer.profiles?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/60 hover:text-white/90 transition-colors">
                                        <div className="p-1.5 bg-white/5 rounded-lg">
                                            <Phone className="h-4 w-4 text-white/40" />
                                        </div>
                                        <span>{customer.profiles?.phone || "No contact recorded"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/60 hover:text-white/90 transition-colors">
                                        <div className="p-1.5 bg-white/5 rounded-lg">
                                            <Activity className="h-4 w-4 text-white/40" />
                                        </div>
                                        <span>Blood Group: <span className="font-bold text-blue-400">{customer.blood_group || 'Not Specified'}</span></span>
                                    </div>
                                </div>

                                <button className="w-full py-3 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/5 tracking-wider uppercase">
                                    View Patient Record
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center">
                            <div className="bg-white/5 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Users className="h-10 w-10 text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No customers on record</h3>
                            <p className="text-white/40 text-sm max-w-xs mx-auto">
                                Once you issue insurance policies to patients, they will appear in this directory.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
