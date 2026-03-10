-- Construction Management System Database Schema

-- Profiles table for user metadata
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'supervisor' CHECK (role IN ('supervisor', 'admin', 'technical', 'management')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects / Obras table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_select_all" ON public.projects FOR SELECT USING (true);
CREATE POLICY "projects_insert_admin" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "projects_update_admin" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "projects_delete_admin" ON public.projects FOR DELETE USING (true);

-- Subcontractors table
CREATE TABLE IF NOT EXISTS public.subcontractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  cuit_cuil TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subcontractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subcontractors_select_all" ON public.subcontractors FOR SELECT USING (true);
CREATE POLICY "subcontractors_insert_admin" ON public.subcontractors FOR INSERT WITH CHECK (true);
CREATE POLICY "subcontractors_update_admin" ON public.subcontractors FOR UPDATE USING (true);
CREATE POLICY "subcontractors_delete_admin" ON public.subcontractors FOR DELETE USING (true);

-- Subcontracts table
CREATE TABLE IF NOT EXISTS public.subcontracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_code TEXT NOT NULL UNIQUE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES public.subcontractors(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  cost_allocation TEXT,
  start_date DATE NOT NULL,
  required_completion_date DATE NOT NULL,
  estimated_duration_days INTEGER,
  certification_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (certification_frequency IN ('weekly', 'biweekly', 'monthly', 'final_only', 'by_progress')),
  contract_type TEXT NOT NULL DEFAULT 'global' CHECK (contract_type IN ('global', 'by_items')),
  contract_total_amount DECIMAL(15, 2) NOT NULL,
  advance_type TEXT CHECK (advance_type IN ('fixed', 'percentage', NULL)),
  advance_amount DECIMAL(15, 2),
  advance_percentage DECIMAL(5, 4),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subcontracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subcontracts_select_all" ON public.subcontracts FOR SELECT USING (true);
CREATE POLICY "subcontracts_insert_admin" ON public.subcontracts FOR INSERT WITH CHECK (true);
CREATE POLICY "subcontracts_update_admin" ON public.subcontracts FOR UPDATE USING (true);
CREATE POLICY "subcontracts_delete_admin" ON public.subcontracts FOR DELETE USING (true);

-- Subcontract Items table (for BY_ITEMS contracts)
CREATE TABLE IF NOT EXISTS public.subcontract_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcontract_id UUID NOT NULL REFERENCES public.subcontracts(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  contracted_quantity DECIMAL(15, 4) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_amount DECIMAL(15, 2) GENERATED ALWAYS AS (contracted_quantity * unit_price) STORED,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subcontract_id, item_code)
);

ALTER TABLE public.subcontract_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subcontract_items_select_all" ON public.subcontract_items FOR SELECT USING (true);
CREATE POLICY "subcontract_items_insert_admin" ON public.subcontract_items FOR INSERT WITH CHECK (true);
CREATE POLICY "subcontract_items_update_admin" ON public.subcontract_items FOR UPDATE USING (true);
CREATE POLICY "subcontract_items_delete_admin" ON public.subcontract_items FOR DELETE USING (true);

-- Measurement Acts (AM) table
CREATE TABLE IF NOT EXISTS public.measurement_acts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcontract_id UUID NOT NULL REFERENCES public.subcontracts(id) ON DELETE CASCADE,
  am_number INTEGER NOT NULL,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  previous_progress DECIMAL(5, 4) DEFAULT 0,
  current_progress DECIMAL(5, 4) NOT NULL DEFAULT 0,
  accumulated_progress DECIMAL(5, 4) GENERATED ALWAYS AS (previous_progress + current_progress) STORED,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'observed', 'approved')),
  observations TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  observation_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subcontract_id, am_number)
);

ALTER TABLE public.measurement_acts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "measurement_acts_select_all" ON public.measurement_acts FOR SELECT USING (true);
CREATE POLICY "measurement_acts_insert_all" ON public.measurement_acts FOR INSERT WITH CHECK (true);
CREATE POLICY "measurement_acts_update_all" ON public.measurement_acts FOR UPDATE USING (true);
CREATE POLICY "measurement_acts_delete_all" ON public.measurement_acts FOR DELETE USING (true);

-- Measurement Act Items table (for BY_ITEMS contracts)
CREATE TABLE IF NOT EXISTS public.measurement_act_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  measurement_act_id UUID NOT NULL REFERENCES public.measurement_acts(id) ON DELETE CASCADE,
  subcontract_item_id UUID NOT NULL REFERENCES public.subcontract_items(id) ON DELETE CASCADE,
  previous_quantity DECIMAL(15, 4) DEFAULT 0,
  current_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0,
  accumulated_quantity DECIMAL(15, 4) GENERATED ALWAYS AS (previous_quantity + current_quantity) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(measurement_act_id, subcontract_item_id)
);

ALTER TABLE public.measurement_act_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "measurement_act_items_select_all" ON public.measurement_act_items FOR SELECT USING (true);
CREATE POLICY "measurement_act_items_insert_all" ON public.measurement_act_items FOR INSERT WITH CHECK (true);
CREATE POLICY "measurement_act_items_update_all" ON public.measurement_act_items FOR UPDATE USING (true);
CREATE POLICY "measurement_act_items_delete_all" ON public.measurement_act_items FOR DELETE USING (true);

-- Certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcontract_id UUID NOT NULL REFERENCES public.subcontracts(id) ON DELETE CASCADE,
  measurement_act_id UUID NOT NULL REFERENCES public.measurement_acts(id) ON DELETE CASCADE,
  certificate_number INTEGER NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  previous_progress DECIMAL(5, 4) DEFAULT 0,
  current_progress DECIMAL(5, 4) NOT NULL,
  accumulated_progress DECIMAL(5, 4) NOT NULL,
  previous_amount DECIMAL(15, 2) DEFAULT 0,
  current_amount DECIMAL(15, 2) NOT NULL,
  accumulated_amount DECIMAL(15, 2) NOT NULL,
  advance_deduction_amount DECIMAL(15, 2) DEFAULT 0,
  net_payable_amount DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'paid', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subcontract_id, certificate_number)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certificates_select_all" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "certificates_insert_admin" ON public.certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "certificates_update_admin" ON public.certificates FOR UPDATE USING (true);
CREATE POLICY "certificates_delete_admin" ON public.certificates FOR DELETE USING (true);

-- Certificate Items table (for BY_ITEMS contracts)
CREATE TABLE IF NOT EXISTS public.certificate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  subcontract_item_id UUID NOT NULL REFERENCES public.subcontract_items(id) ON DELETE CASCADE,
  previous_quantity DECIMAL(15, 4) DEFAULT 0,
  current_quantity DECIMAL(15, 4) NOT NULL,
  accumulated_quantity DECIMAL(15, 4) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  previous_amount DECIMAL(15, 2) DEFAULT 0,
  current_amount DECIMAL(15, 2) NOT NULL,
  accumulated_amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(certificate_id, subcontract_item_id)
);

ALTER TABLE public.certificate_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certificate_items_select_all" ON public.certificate_items FOR SELECT USING (true);
CREATE POLICY "certificate_items_insert_admin" ON public.certificate_items FOR INSERT WITH CHECK (true);
CREATE POLICY "certificate_items_update_admin" ON public.certificate_items FOR UPDATE USING (true);
CREATE POLICY "certificate_items_delete_admin" ON public.certificate_items FOR DELETE USING (true);

-- Attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('subcontract', 'measurement_act', 'certificate')),
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attachments_select_all" ON public.attachments FOR SELECT USING (true);
CREATE POLICY "attachments_insert_all" ON public.attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "attachments_delete_all" ON public.attachments FOR DELETE USING (true);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    COALESCE(new.raw_user_meta_data ->> 'role', 'supervisor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subcontracts_project ON public.subcontracts(project_id);
CREATE INDEX IF NOT EXISTS idx_subcontracts_subcontractor ON public.subcontracts(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_measurement_acts_subcontract ON public.measurement_acts(subcontract_id);
CREATE INDEX IF NOT EXISTS idx_measurement_acts_status ON public.measurement_acts(status);
CREATE INDEX IF NOT EXISTS idx_certificates_subcontract ON public.certificates(subcontract_id);
CREATE INDEX IF NOT EXISTS idx_certificates_measurement_act ON public.certificates(measurement_act_id);
