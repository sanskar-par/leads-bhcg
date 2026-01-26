# Database Column Rename: STATUS COLUMNS

## What Changed

All references to `mailed_status`/`mailedStatus` have been changed to `status` throughout the codebase.
All references to `mailed_at`/`mailedAt` have been changed to `status_updated_at`/`statusUpdatedAt`.

## Files Updated

### TypeScript Files
1. **src/lib/types.ts** - Updated Lead type definition
2. **src/lib/data-supabase.ts** - Updated data mapping in `getLeads()` and `getLeadsByUser()`
3. **src/lib/supabase.ts** - Updated Database type definitions
4. **src/components/admin/email-sender.tsx** - Updated all references to use `status` instead of `mailedStatus`

### Database Migration
**New file created: `supabase-rename-status-columns.sql`**

## ACTION REQUIRED: Run Database Migration

You MUST run the following SQL migration in your Supabase database:

```sql
-- Rename mailed_status and mailed_at columns to status and status_updated_at

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
```

### How to Run Migration

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-rename-status-columns.sql`
4. Click "Run" to execute the migration

## What This Fixes

✅ The "Mailed" filter will now work correctly
✅ Stats cards will accurately reflect mailed/not mailed/failed counts
✅ Consistent naming convention throughout the codebase (no more confusion between `mailed_status` vs `status`)
✅ The API route for sending emails will properly update the status column

## Status Values

The status column accepts these values (title case):
- `'Not Mailed'` - Email has not been sent yet (default)
- `'Mailed'` - Email was successfully sent
- `'Failed'` - Email sending failed
