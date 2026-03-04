'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteOrganization } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface DeleteOrgButtonProps {
    id: string;
    orgType: 'hospital' | 'insurance';
    orgName: string;
}

export function DeleteOrgButton({ id, orgType, orgName }: DeleteOrgButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm(`Are you sure you want to delete "${orgName}"? This will permanently remove all associated data including medical records and credentials.`)) {
            return;
        }

        setLoading(true);
        const result = await deleteOrganization(id, orgType);

        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            router.refresh();
        }
        setLoading(false);
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-1 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all flex-shrink-0"
            title={`Delete ${orgType}`}
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </button>
    );
}
