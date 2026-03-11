-- Update roles to match application requirements
-- Roles: admin, jefe_obra, encargado

-- First, drop the constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint with updated roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'jefe_obra', 'encargado'));

-- Update the default role
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'encargado';

-- Migrate existing data to new roles
UPDATE public.profiles SET role = 'encargado' WHERE role IN ('supervisor', 'technical');
UPDATE public.profiles SET role = 'admin' WHERE role = 'management';

-- Update the trigger function to use new default role
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
    COALESCE(new.raw_user_meta_data ->> 'role', 'encargado')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
