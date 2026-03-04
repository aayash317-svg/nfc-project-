'use client'

import { Trash2 } from "lucide-react";
import { deletePatient, deletePolicy } from "@/app/actions/insurance";
import { useState } from "react";

interface DeleteButtonProps {
    id: string;
    type: 'patient' | 'policy';
    label?: string;
}

export default function DeleteButton({ id, type, label }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const message = type === 'patient'
            ? "Are you sure you want to delete this patient? This will PERMANENTLY remove all their policies, claims, and medical data."
            : "Are you sure you want to delete this insurance policy?";

        if (!window.confirm(message)) return;

        setIsDeleting(true);
        try {
            const result = type === 'patient'
                ? await deletePatient(id)
                : await deletePolicy(id);

            if (result.error) {
                alert(`Error: ${result.error}`);
            }
        } catch (err) {
            alert("An unexpected error occurred.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all border ${isDeleting
                    ? "bg-red-500/20 text-red-500/50 border-red-500/20 cursor-not-allowed"
                    : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40"
                } ${label ? 'w-full text-xs font-bold uppercase tracking-wider' : 'p-2'}`}
            title={label ? "" : `Delete ${type}`}
        >
            <Trash2 className={`${label ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${isDeleting ? 'animate-pulse' : ''}`} />
            {label && <span>{isDeleting ? "Deleting..." : label}</span>}
        </button>
    );
}
