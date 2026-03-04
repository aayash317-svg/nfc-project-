'use server'

import { createClient } from "@/lib/supabase/server";
import { Claim, InsurancePolicy, Profile } from "@/types";
import { revalidatePath } from "next/cache";

export async function getInsuranceStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Active Policies
    const { count: activePoliciesCount } = await supabase
        .from('insurance_policies')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id)
        .eq('status', 'active');

    // 2. Pending Claims
    const { count: pendingClaimsCount } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id)
        .eq('status', 'pending');

    // 3. Expiring Soon (next 30 days)
    const { count: expiringSoonCount } = await supabase
        .from('insurance_policies')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id)
        .eq('status', 'active')
        .lte('valid_until', thirtyDaysFromNow)
        .gte('valid_until', now.toISOString());

    // 4. Total Premium (Sum of coverage as a placeholder for actual premium)
    const { data: policiesData } = await supabase
        .from('insurance_policies')
        .select('coverage_amount')
        .eq('provider_id', user.id)
        .eq('status', 'active');

    const totalPremium = policiesData?.reduce((sum, p) => sum + (p.coverage_amount || 0), 0) || 0;

    return {
        activePolicies: activePoliciesCount || 0,
        pendingClaims: pendingClaimsCount || 0,
        expiringSoon: expiringSoonCount || 0,
        totalPremium: totalPremium
    };
}

/**
 * HELPER: Manual join for Patients and Profiles
 */
async function attachProfilesToItems(supabase: any, items: any[], patientIdKey: string = 'patient_id') {
    if (!items || items.length === 0) return items;

    const patientIds = Array.from(new Set(items.map(i => i[patientIdKey]).filter(Boolean)));
    if (patientIds.length === 0) return items;

    // Fetch patients and their profiles (patients -> profiles is usually a 1:1 via ID)
    const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds);

    const profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]) || []);

    return items.map(item => ({
        ...item,
        patients: {
            profiles: profilesMap.get(item[patientIdKey]) || null
        }
    }));
}

export async function getRecentClaims() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: claims, error } = await supabase
        .from('claims')
        .select('*')
        .eq('provider_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(10);

    if (error) return { error: "Failed to fetch claims: " + error.message };

    const claimsWithProfiles = await attachProfilesToItems(supabase, claims || []);

    // Also attach policy number manually if needed
    const policyIds = Array.from(new Set(claims?.map(c => c.policy_id).filter(Boolean)));
    if (policyIds.length > 0) {
        const { data: policies } = await supabase
            .from('insurance_policies')
            .select('id, policy_number')
            .in('id', policyIds);

        const policyMap = new Map(policies?.map((p: any) => [p.id, p]) || []);
        claimsWithProfiles.forEach((c: any) => {
            c.insurance_policies = policyMap.get(c.policy_id) || null;
        });
    }

    return { claims: claimsWithProfiles };
}

export async function verifyPolicy(policyNumber: string) {
    const supabase = await createClient();

    const { data: policy, error } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('policy_number', policyNumber)
        .single();

    if (error || !policy) {
        return { error: "Policy not found or invalid." };
    }

    // Attach patient data manually
    const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', policy.patient_id)
        .single();

    const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', policy.patient_id)
        .single();

    const policyWithDetails = {
        ...policy,
        patients: {
            ...patientData,
            profiles: profileData
        }
    };

    return { policy: policyWithDetails };
}

export async function processClaim(claimId: string, status: 'approved' | 'rejected', notes?: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('claims')
        .update({
            status: status,
            processed_at: new Date().toISOString(),
            notes: notes
        })
        .eq('id', claimId);

    if (error) return { error: error.message };

    revalidatePath('/insurance');
    return { success: true };
}

export async function getProviderCustomers() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Fetch unique patients via policies
    const { data: policies, error } = await supabase
        .from('insurance_policies')
        .select('patient_id')
        .eq('provider_id', user.id);

    if (error) return { error: error.message };

    const patientIds = Array.from(new Set(policies.map(p => p.patient_id)));
    if (patientIds.length === 0) return { customers: [] };

    // Fetch patients and profiles manually
    const { data: patients } = await supabase.from('patients').select('*').in('id', patientIds);
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', patientIds);

    const profilesMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);
    const customers = patients?.map(patient => ({
        ...patient,
        profiles: profilesMap.get(patient.id) || null
    })) || [];

    return { customers };
}

export async function getClaims(status?: 'pending' | 'approved' | 'rejected') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    let query = supabase
        .from('claims')
        .select('*')
        .eq('provider_id', user.id)
        .order('submitted_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data: claims, error } = await query;
    if (error) return { error: error.message };

    const claimsWithProfiles = await attachProfilesToItems(supabase, claims || []);

    // Attach policy number
    const policyIds = Array.from(new Set(claims?.map(c => c.policy_id).filter(Boolean)));
    if (policyIds.length > 0) {
        const { data: policies } = await supabase
            .from('insurance_policies')
            .select('id, policy_number')
            .in('id', policyIds);

        const policyMap = new Map(policies?.map((p: any) => [p.id, p]) || []);
        claimsWithProfiles.forEach((c: any) => {
            c.insurance_policies = policyMap.get(c.policy_id) || null;
        });
    }

    return { claims: claimsWithProfiles };
}

export async function getClaimById(claimId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: claim, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .eq('provider_id', user.id)
        .single();

    if (error) return { error: error.message };

    // Attach patient
    const { data: patient } = await supabase.from('patients').select('*').eq('id', claim.patient_id).single();
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', claim.patient_id).single();

    // Attach policy
    const { data: policy } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('id', claim.policy_id)
        .single();

    return {
        claim: {
            ...claim,
            patients: {
                ...patient,
                profiles: profile
            },
            insurance_policies: policy
        }
    };
}

export async function deletePatient(patientId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Deleting from profiles triggers cascading deletes to patients and all associated records
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', patientId)
        .eq('role', 'patient');

    if (error) return { error: error.message };

    revalidatePath('/insurance/customers');
    revalidatePath('/insurance/policies');
    revalidatePath('/insurance');
    return { success: true };
}

export async function deletePolicy(policyId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('insurance_policies')
        .delete()
        .eq('id', policyId)
        .eq('provider_id', user.id); // Ensure only provider's own policies can be deleted

    if (error) return { error: error.message };

    revalidatePath('/insurance');
    return { success: true };
}

export async function getInsuranceTrends() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const trends = [];
    const now = new Date();

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthYear = d.toLocaleString('default', { month: 'short' });
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();

        // Count policies created in this month
        const { count: policyCount } = await supabase
            .from('insurance_policies')
            .select('*', { count: 'exact', head: true })
            .eq('provider_id', user.id)
            .gte('created_at', startOfMonth)
            .lte('created_at', endOfMonth);

        // Count claims submitted in this month
        const { count: claimCount } = await supabase
            .from('claims')
            .select('*', { count: 'exact', head: true })
            .eq('provider_id', user.id)
            .gte('submitted_at', startOfMonth)
            .lte('submitted_at', endOfMonth);

        trends.push({
            month: monthYear,
            policies: policyCount || 0,
            claims: claimCount || 0
        });
    }

    // Fallback/Simulated data if the portal is new (less than 2 items across all months)
    const totalItems = trends.reduce((sum, t) => sum + t.policies + t.claims, 0);
    if (totalItems < 2) {
        return {
            trends: [
                { month: trends[0].month, policies: 12, claims: 5 },
                { month: trends[1].month, policies: 18, claims: 8 },
                { month: trends[2].month, policies: 15, claims: 12 },
                { month: trends[3].month, policies: 25, claims: 9 },
                { month: trends[4].month, policies: 22, claims: 14 },
                { month: trends[5].month, policies: 31, claims: 11 },
            ],
            isSimulated: true
        };
    }

    return { trends, isSimulated: false };
}

export async function getInsuranceProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            *,
            insurance_providers (*)
        `)
        .eq('id', user.id)
        .single();

    if (error) return { error: error.message };
    return { profile };
}

export async function updateInsuranceProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const full_name = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;
    const company_name = formData.get("company_name") as string;

    // Update profile
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name, phone })
        .eq('id', user.id);

    if (profileError) return { error: profileError.message };

    // Update insurance provider record
    const { error: providerError } = await supabase
        .from('insurance_providers')
        .update({ company_name })
        .eq('id', user.id);

    if (providerError) return { error: providerError.message };

    revalidatePath('/insurance/settings/profile');
    return { success: true };
}
