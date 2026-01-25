-- Update mailed_status values to use capitalized format
-- This migration updates existing status values from lowercase to capitalized

-- Update existing status values
UPDATE leads SET mailed_status = 'Mailed' WHERE mailed_status = 'mailed';
UPDATE leads SET mailed_status = 'Failed' WHERE mailed_status = 'failed';
UPDATE leads SET mailed_status = 'Not Mailed' WHERE mailed_status = 'not_mailed' OR mailed_status IS NULL;

-- Drop the old constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_mailed_status_check;

-- Add new constraint with capitalized values
ALTER TABLE leads 
ADD CONSTRAINT leads_mailed_status_check 
CHECK (mailed_status IN ('Not Mailed', 'Mailed', 'Failed'));

-- Update default value to use capitalized format
ALTER TABLE leads ALTER COLUMN mailed_status SET DEFAULT 'Not Mailed';

-- Update comments
COMMENT ON COLUMN leads.mailed_status IS 'Email status: Not Mailed, Mailed, or Failed';
