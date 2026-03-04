
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("--- Supabase State Check ---");

    // 1. Providers
    const { data: providers } = await supabase.from('insurance_providers').select('*');
    console.log("\nInsurance Providers:");
    providers?.forEach(p => console.log(`- ${p.company_name} | ID: ${p.id}`));

    // 2. Recent Patients
    const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'patient').order('created_at', { ascending: false }).limit(5);
    console.log("\nRecent Patients:");
    profiles?.forEach(p => console.log(`- ${p.full_name} | ${p.email} | ID: ${p.id}`));

    // 3. Policies for the first provider found
    if (providers && providers.length > 0) {
        const pId = providers[0].id;
        console.log(`\nChecking policies for provider: ${providers[0].company_name} (${pId})`);
        const { data: policies } = await supabase.from('insurance_policies').select('*').eq('provider_id', pId);
        console.log(`- Found ${policies?.length || 0} policies.`);
        policies?.forEach(pol => console.log(`  * Policy ${pol.policy_number} for patient ${pol.patient_id}`));
    }
}

check();
