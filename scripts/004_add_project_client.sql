-- Add client column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client TEXT;

-- Add location column if missing
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location TEXT;
