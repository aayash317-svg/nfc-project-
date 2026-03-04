'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Profile } from "@/types";

export async function searchPatients(query: string) {
    const supabase = await createClient();

    // Search in profiles where role is 'patient'
    // ILIKE for case-insensitive partial match on name or email
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,id.eq.${query}`)
        .limit(10);

    if (error) {
        console.error("Search Error:", error);
        return { error: "Failed to search patients." };
    }

    return { patients: data as Profile[] };
}

export async function getPatientDetails(patientId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 1. Get Profile & Patient Data
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
            *,
            patients (*)
        `)
        .eq('id', patientId)
        .eq('role', 'patient')
        .single();

    if (profileError || !profile) {
        return { error: "Patient not found." };
    }

    // 2. Get Medical Records
    const { data: records, error: recordsError } = await supabase
        .from('medical_records')
        .select(`
            *,
            hospitals ( profiles ( full_name ) )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    return {
        patient: {
            ...profile,
            details: profile.patients
        },
        records: records || []
    };
}

export async function addMedicalRecord(formData: FormData) {
    const patientId = formData.get("patientId") as string;
    const recordType = formData.get("recordType") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // Attachments would need file upload logic (Storage), skipping for MVP text-only

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // 1. Insert Record
    const { data: record, error } = await supabase.from('medical_records').insert({
        patient_id: patientId,
        hospital_id: user.id,
        record_type: recordType,
        title: title,
        description: description,
    }).select().single();

    if (error) {
        return { error: error.message };
    }

    // 2. Audit Log
    await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'add_record',
        resource_type: 'medical_record',
        resource_id: record.id,
        details: { patient_id: patientId, title: title }
    });

    revalidatePath(`/hospital/patient/${patientId}`);
    return { success: true };
}

export async function getRecentScans() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 1. Fetch nfc_scan actions by this hospital
    const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('actor_id', user.id)
        .eq('action', 'nfc_scan')
        .order('timestamp', { ascending: false })
        .limit(5);

    if (logsError) return { error: logsError.message };
    if (!logs || logs.length === 0) return { scans: [] };

    // 2. Fetch profiles for these patients
    const patientIds = logs.map(l => l.resource_id);
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', patientIds);

    if (profilesError) return { error: profilesError.message };

    const profilesMap = new Map(profiles.map(p => [p.id, p]));

    // 3. Merge data
    const scans = logs.map(log => ({
        id: log.id,
        patient_id: log.resource_id,
        timestamp: log.timestamp,
        patient_name: profilesMap.get(log.resource_id)?.full_name || log.details?.patient_name || "Unknown Patient",
        patient_email: profilesMap.get(log.resource_id)?.email || "N/A"
    }));

    return { scans };
}
