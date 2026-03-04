'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePatientProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const fullName = formData.get("fullName") as string;
    const dob = formData.get("dob") as string;
    const bloodGroup = formData.get("bloodGroup") as string;
    const emergencyName = formData.get("emergencyName") as string;
    const emergencyPhone = formData.get("emergencyPhone") as string;

    const emergencyContact = {
        name: emergencyName,
        phone: emergencyPhone
    };

    try {
        // 1. Update Profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id);

        if (profileError) throw profileError;

        // 2. Upsert Patients table (use upsert in case the record doesn't exist yet)
        const { error: patientError } = await supabase
            .from('patients')
            .upsert({
                id: user.id, // required for upsert
                dob: dob || null,
                blood_group: bloodGroup,
                emergency_contact: emergencyContact
            });

        if (patientError) throw patientError;

        revalidatePath('/patient');
        revalidatePath('/patient/profile');
        revalidatePath('/patient/settings/profile');

        return { success: true };

    } catch (error: any) {
        console.error("Profile update error:", error);
        return { error: error.message || "Failed to update profile" };
    }
}

export async function getPatientProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { data, error } = await supabase
        .from('patients')
        .select(`
            *,
            profiles:profiles!patients_id_fkey (
                full_name,
                email,
                phone
            )
        `)
        .eq('id', user.id)
        .maybeSingle();

    if (error) return { error: error.message };

    // If patient record doesn't exist yet, we still return the basic profile info from users
    if (!data) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', user.id)
            .single();

        return {
            data: {
                profiles: profile,
                // Add empty defaults for fields the form expects
                dob: null,
                blood_group: null,
                emergency_contact: null
            }
        };
    }

    return { data };
}
