-- Add budget column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS budget NUMERIC(15, 2) DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN projects.budget IS 'Total budget for the project in the selected currency';
