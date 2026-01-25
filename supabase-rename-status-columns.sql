-- Rename mailed_status and mailed_at columns to status and status_updated_at
-- This simplifies the column naming convention

-- Drop old constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_mailed_status_check;

-- Rename columns
ALTER TABLE leads RENAME COLUMN mailed_status TO status;
ALTER TABLE leads RENAME COLUMN mailed_at TO status_updated_at;

-- Add new constraint with updated column name
ALTER TABLE leads 
ADD CONSTRAINT leads_status_check 
CHECK (status IN ('Not Mailed', 'Mailed', 'Failed'));

-- Drop old index and create new one
DROP INDEX IF EXISTS idx_leads_mailed_status;
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Update comments
COMMENT ON COLUMN leads.status IS 'Email status: Not Mailed, Mailed, or Failed';
COMMENT ON COLUMN leads.status_updated_at IS 'Timestamp when email status was last updated';
