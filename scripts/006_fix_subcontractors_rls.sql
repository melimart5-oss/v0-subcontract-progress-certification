-- Fix RLS policies for subcontractors table to allow all authenticated users to insert/update/delete

-- Drop existing restrictive policies
DROP POLICY IF EXISTS subcontractors_insert_admin ON subcontractors;
DROP POLICY IF EXISTS subcontractors_update_admin ON subcontractors;
DROP POLICY IF EXISTS subcontractors_delete_admin ON subcontractors;

-- Create new policies that allow all authenticated users
CREATE POLICY subcontractors_insert_all ON subcontractors
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY subcontractors_update_all ON subcontractors
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY subcontractors_delete_all ON subcontractors
  FOR DELETE TO authenticated
  USING (true);
