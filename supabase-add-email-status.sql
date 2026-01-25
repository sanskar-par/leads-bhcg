-- Add email mailing status columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS mailed_status TEXT DEFAULT 'not_mailed' CHECK (mailed_status IN ('not_mailed', 'mailed', 'failed')),
ADD COLUMN IF NOT EXISTS mailed_at TIMESTAMPTZ;

-- Create index for querying by mailed status
CREATE INDEX IF NOT EXISTS idx_leads_mailed_status ON leads(mailed_status);

-- Update existing leads to have default status
UPDATE leads SET mailed_status = 'not_mailed' WHERE mailed_status IS NULL;

COMMENT ON COLUMN leads.mailed_status IS 'Email status: not_mailed, mailed, or failed';
COMMENT ON COLUMN leads.mailed_at IS 'Timestamp when email was successfully sent';
