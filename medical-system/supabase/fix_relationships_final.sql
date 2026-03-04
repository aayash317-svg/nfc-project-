-- 1. Fix missing FK on claims table
ALTER TABLE public.claims 
DROP CONSTRAINT IF EXISTS claims_patient_id_fkey;

ALTER TABLE public.claims
ADD CONSTRAINT claims_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;

-- 2. Clean up redundant FKs on patients to avoid ambiguity
-- Ensure profiles PK is recognized
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_pkey') THEN
        ALTER TABLE public.profiles ADD PRIMARY KEY (id);
    END IF;
END $$;

-- 3. Re-verify basic relationships and metadata
COMMENT ON COLUMN public.claims.patient_id IS 'FK to patients.id';
COMMENT ON COLUMN public.claims.policy_id IS 'FK to insurance_policies.id';
COMMENT ON COLUMN public.claims.provider_id IS 'FK to insurance_providers.id';
