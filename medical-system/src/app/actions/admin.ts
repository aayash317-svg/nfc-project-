'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function createOrganization(data: {
    orgType: 'hospital' | 'insurance';
    name: string;
    email: string;
    generatedId: string;
    generatedPassword: string;
}) {
    const supabase = createAdminClient();

    try {
        // 1. Check if user already exists
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) return { error: `Auth list error: ${listError.message}` };

        let userId: string;
        // Search more robustly
        const existingUser = users.find(u => u.email === data.email);

        if (existingUser) {
            userId = existingUser.id;
            // Force update password and metadata
            const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
                password: data.generatedPassword,
                user_metadata: {
                    role: data.orgType === 'hospital' ? 'hospital' : 'insurance',
                    full_name: data.name,
                },
            });
            if (updateError) return { error: `Auth update error: ${updateError.message}` };
        } else {
            // Create user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: data.email,
                password: data.generatedPassword,
                email_confirm: true,
                user_metadata: {
                    role: data.orgType === 'hospital' ? 'hospital' : 'insurance',
                    full_name: data.name,
                },
            });

            if (authError) {
                // If it still says registered, it's a pagination issue with listUsers
                if (authError.message.includes("already been registered")) {
                    return { error: "User exists but was not found in the first 50 results. Please use a unique email or contact support to reset this account." };
                }
                return { error: `Auth error: ${authError.message}` };
            }
            userId = authData.user.id;
        }

        // 2. Ensure a profile exists and has the correct role
        const { data: profileData } = await supabase
            .from('profiles')
            .select('id, role, full_name')
            .eq('id', userId)
            .single();

        const targetRole = data.orgType === 'hospital' ? 'hospital' : 'insurance';

        if (!profileData) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    full_name: data.name,
                    role: targetRole,
                    email: data.email,
                });

            if (profileError) return { error: `Profile create error: ${profileError.message}` };
        } else if (profileData.role !== targetRole || profileData.full_name !== data.name) {
            // Update role or name if different
            const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({ role: targetRole, full_name: data.name })
                .eq('id', userId);

            if (profileUpdateError) return { error: `Profile update error: ${profileUpdateError.message}` };
        }

        // 3. Insert into the org-specific table
        if (data.orgType === 'hospital') {
            const { error: orgError } = await supabase
                .from('hospitals')
                .upsert({
                    id: userId,
                    license_number: data.generatedId,
                    address: 'Pending',
                    verified: true,
                }, { onConflict: 'id' });

            if (orgError) {
                return { error: `Hospital record error: ${orgError.message}` };
            }
        } else {
            const { error: orgError } = await supabase
                .from('insurance_providers')
                .upsert({
                    id: userId,
                    company_name: data.name,
                    verified: true,
                }, { onConflict: 'id' });

            if (orgError) {
                return { error: `Insurance record error: ${orgError.message}` };
            }
        }

        return {
            success: true,
            userId,
            credentials: {
                email: data.email,
                password: data.generatedPassword,
                orgId: data.generatedId,
            },
        };
    } catch (err: any) {
        return { error: err.message || 'Unknown error' };
    }
}
export async function deleteOrganization(userId: string, orgType: 'hospital' | 'insurance') {
    const supabase = createAdminClient();

    try {
        // 1. Delete organization-specific data
        if (orgType === 'hospital') {
            // Delete medical records first (dependent on hospital)
            const { error: mrError } = await supabase
                .from('medical_records')
                .delete()
                .eq('hospital_id', userId);

            if (mrError) return { error: `Medical records delete error: ${mrError.message}` };

            const { error: hError } = await supabase
                .from('hospitals')
                .delete()
                .eq('id', userId);

            if (hError) return { error: `Hospital delete error: ${hError.message}` };
        } else {
            // Insurance: Delete claims first
            const { error: cError } = await supabase
                .from('claims')
                .delete()
                .eq('provider_id', userId);

            if (cError) return { error: `Claims delete error: ${cError.message}` };

            // Delete policies
            const { error: pError_ins } = await supabase
                .from('insurance_policies')
                .delete()
                .eq('provider_id', userId);

            if (pError_ins) return { error: `Insurance policies delete error: ${pError_ins.message}` };

            const { error: iError } = await supabase
                .from('insurance_providers')
                .delete()
                .eq('id', userId);

            if (iError) return { error: `Insurance delete error: ${iError.message}` };
        }

        // 2. Delete from profiles
        const { error: pError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (pError) return { error: `Profile delete error: ${pError.message}` };

        // 3. Delete from Auth (CRITICAL)
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) return { error: `Auth delete error: ${authError.message}` };

        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'Unknown error during deletion' };
    }
}
