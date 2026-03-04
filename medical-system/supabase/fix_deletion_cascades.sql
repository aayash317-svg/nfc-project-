-- Add cascading deletes to tables that were missing them

-- 1. Claims Table
ALTER TABLE public.claims 
DROP CONSTRAINT IF EXISTS claims_patient_id_fkey,
DROP CONSTRAINT IF EXISTS claims_policy_id_fkey,
DROP CONSTRAINT IF EXISTS claims_provider_id_fkey;

ALTER TABLE public.claims
ADD CONSTRAINT claims_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE,
ADD CONSTRAINT claims_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
ADD CONSTRAINT claims_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.insurance_providers(id) ON DELETE CASCADE;

-- 2. Insurance Policies Table
ALTER TABLE public.insurance_policies
DROP CONSTRAINT IF EXISTS insurance_policies_patient_id_fkey,
DROP CONSTRAINT IF EXISTS insurance_policies_provider_id_fkey;

ALTER TABLE public.insurance_policies
ADD CONSTRAINT insurance_policies_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE,
ADD CONSTRAINT insurance_policies_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.insurance_providers(id) ON DELETE CASCADE;

-- 3. Medical Records Table
ALTER TABLE public.medical_records
DROP CONSTRAINT IF EXISTS medical_records_patient_id_fkey,
DROP CONSTRAINT IF EXISTS medical_records_hospital_id_fkey;

ALTER TABLE public.medical_records
ADD CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE,
ADD CONSTRAINT medical_records_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE CASCADE;
