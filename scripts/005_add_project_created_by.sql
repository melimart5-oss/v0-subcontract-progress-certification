-- Add created_by column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
