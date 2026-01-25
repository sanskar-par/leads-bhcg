-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to all users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert themselves" ON users;
DROP POLICY IF EXISTS "Allow users to update their own record" ON users;
DROP POLICY IF EXISTS "Allow read access to all leads" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON leads;
DROP POLICY IF EXISTS "Allow users to update their own leads" ON leads;
DROP POLICY IF EXISTS "Allow users to delete their own leads" ON leads;

-- Disable RLS temporarily while we fix the schema
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Make password nullable (if not already done)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Enable RLS again
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Users table policies - ALLOW ALL for now to get things working
-- You can tighten these later once auth is stable
CREATE POLICY "Enable all operations for users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Leads table policies - ALLOW ALL for now
CREATE POLICY "Enable all operations for leads"
  ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- NOTE: These permissive policies allow all operations.
-- Once your auth is working, you should replace them with proper policies.
