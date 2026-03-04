'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPatientClaims() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: claims, error } = await supabase
        .from('claims')
        .select('*')
        .eq('patient_id', user.id)
        .order('submitted_at', { ascending: false });

    if (error) return { error: error.message };

    // Attach provider company names manually to avoid missing relationship error
    const providerIds = Array.from(new Set(claims.map(c => c.provider_id).filter(Boolean)));
    if (providerIds.length === 0) return { claims };

    const { data: providers } = await supabase
        .from('insurance_providers')
        .select('id, company_name')
        .in('id', providerIds);

    const providerMap = new Map(providers?.map((p: any) => [p.id, p]) || []);

    const claimsWithProviders = claims.map(c => ({
        ...c,
        insurance_providers: providerMap.get(c.provider_id) || null
    }));

    return { claims: claimsWithProviders };
}

export async function submitClaim(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const policyId = formData.get('policyId') as string;
    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;

    if (!amount || !policyId) {
        return { error: "Missing required fields" };
    }

    // Lookup provider from policy
    const { data: policy } = await supabase
        .from('insurance_policies')
        .select('provider_id')
        .eq('id', policyId)
        .single();

    if (!policy) return { error: "Invalid Policy" };
    const providerId = policy.provider_id;

    const { error } = await supabase
        .from('claims')
        .insert({
            patient_id: user.id,
            provider_id: providerId,
            policy_id: policyId,
            claim_amount: parseFloat(amount),
            description: description,
            status: 'pending'
        });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/patient/claims');
    redirect('/patient/claims');
}

export async function getPatientPolicies() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Fetch policies linked to this patient
    const { data: policies, error } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('patient_id', user.id)
        .eq('status', 'active');

    if (error) return { error: error.message };

    const providerIds = Array.from(new Set(policies.map(p => p.provider_id).filter(Boolean)));
    if (providerIds.length === 0) return { policies };

    const { data: providers } = await supabase
        .from('insurance_providers')
        .select('id, company_name')
        .in('id', providerIds);

    const providerMap = new Map(providers?.map((p: any) => [p.id, p]) || []);

    const policiesWithProviders = policies.map(p => ({
        ...p,
        insurance_providers: providerMap.get(p.provider_id) || null
    }));

    return { policies: policiesWithProviders };
}
