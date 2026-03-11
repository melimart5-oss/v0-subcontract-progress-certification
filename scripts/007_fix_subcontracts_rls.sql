-- Fix RLS policies for subcontracts table to allow all authenticated users to insert/update/delete
DROP POLICY IF EXISTS subcontracts_insert_admin ON subcontracts;
DROP POLICY IF EXISTS subcontracts_update_admin ON subcontracts;
DROP POLICY IF EXISTS subcontracts_delete_admin ON subcontracts;

CREATE POLICY subcontracts_insert_all ON subcontracts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY subcontracts_update_all ON subcontracts
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY subcontracts_delete_all ON subcontracts
  FOR DELETE TO authenticated
  USING (true);

-- Fix RLS policies for subcontract_items table
DROP POLICY IF EXISTS subcontract_items_insert_admin ON subcontract_items;
DROP POLICY IF EXISTS subcontract_items_update_admin ON subcontract_items;
DROP POLICY IF EXISTS subcontract_items_delete_admin ON subcontract_items;

CREATE POLICY subcontract_items_insert_all ON subcontract_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY subcontract_items_update_all ON subcontract_items
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY subcontract_items_delete_all ON subcontract_items
  FOR DELETE TO authenticated
  USING (true);
