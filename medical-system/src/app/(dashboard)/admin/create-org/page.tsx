'use client';

import { useState } from 'react';
import { Loader2, Plus, Building2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createOrganization } from '@/app/actions/admin';

export default function AdminCreateOrg() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [orgType, setOrgType] = useState<'hospital' | 'insurance'>('hospital');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        generatedId: '',
        generatedPassword: ''
    });

    const generateCredentials = () => {
        const prefix = orgType === 'hospital' ? 'HOSP' : 'INS';
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const password = Math.random().toString(36).slice(-8);
        setFormData(prev => ({
            ...prev,
            generatedId: `${prefix}${randomId}`,
            generatedPassword: password
        }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const result = await createOrganization({
            orgType,
            name: formData.name,
            email: formData.email,
            generatedId: formData.generatedId,
            generatedPassword: formData.generatedPassword,
        });

        if (result.error) {
            alert('Error creating organization: ' + result.error);
        } else {
            alert(`${orgType === 'hospital' ? 'Hospital' : 'Insurance'} Created Successfully!\n\nCredentials:\nEmail: ${formData.email}\nPassword: ${formData.generatedPassword}\nOrg ID: ${formData.generatedId}`);
            setFormData({ name: '', email: '', generatedId: '', generatedPassword: '' });
        }
        setLoading(false);
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-foreground">Organization Management</h1>

            <div className="glass p-8">
                <div className="space-y-2 mb-8">
                    <label className="text-sm font-medium text-muted-foreground">Select Organization Type</label>
                    <div className="relative">
                        <select
                            value={orgType}
                            onChange={(e) => {
                                setOrgType(e.target.value as 'hospital' | 'insurance');
                                setFormData(prev => ({ ...prev, generatedId: '', generatedPassword: '' }));
                            }}
                            className="w-full h-14 rounded-xl bg-black/40 border border-white/10 px-4 pr-10 text-foreground appearance-none focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer font-bold"
                        >
                            <option value="hospital" className="bg-[#0a0a0a]">🏥 Hospital Node</option>
                            <option value="insurance" className="bg-[#0a0a0a]">🛡️ Insurance Provider</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground flex items-center gap-2">
                            <div className="h-4 w-px bg-white/10 mx-2" />
                            {orgType === 'hospital' ? <Building2 className="h-5 w-5 text-primary" /> : <ShieldCheck className="h-5 w-5 text-secondary" />}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                            <input
                                required
                                type="text"
                                className="w-full h-12 rounded-xl bg-black/20 border border-input px-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Official Email</label>
                            <input
                                required
                                type="email"
                                className="w-full h-12 rounded-xl bg-black/20 border border-input px-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-black/30 rounded-xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-foreground">Credentials Generation</h3>
                            <button type="button" onClick={generateCredentials} className="text-xs bg-muted px-3 py-1 rounded-md hover:bg-white/10">
                                Regenerate
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                    {orgType === 'hospital' ? 'Medical Council ID' : 'License Number'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        required
                                        readOnly
                                        type="text"
                                        className="w-full h-12 rounded-xl bg-black/40 border border-input px-4 text-primary font-mono"
                                        value={formData.generatedId}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Access Password</label>
                                <div className="flex gap-2">
                                    <input
                                        required
                                        readOnly
                                        type="text"
                                        className="w-full h-12 rounded-xl bg-black/40 border border-input px-4 text-secondary font-mono"
                                        value={formData.generatedPassword}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !formData.generatedId}
                            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${orgType === 'hospital' ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20' : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-secondary/20'}`}
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Create {orgType === 'hospital' ? 'Hospital' : 'Insurance'} Node
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
