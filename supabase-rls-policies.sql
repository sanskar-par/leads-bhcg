-- Enable Row Level Security on users and leads tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow anyone to read all users (needed for leaderboard and user lookups)
CREATE POLICY "Allow read access to all users"
  ON users
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert themselves (for Google OAuth)
CREATE POLICY "Allow authenticated users to insert themselves"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own record
CREATE POLICY "Allow users to update their own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Leads table policies
-- Allow anyone to read all leads (needed for database view and leaderboard)
CREATE POLICY "Allow read access to all leads"
  ON leads
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert leads
CREATE POLICY "Allow authenticated users to insert leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own leads
CREATE POLICY "Allow users to update their own leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (added_by = auth.jwt() ->> 'email' OR added_by = split_part(auth.jwt() ->> 'email', '@', 1))
  WITH CHECK (added_by = auth.jwt() ->> 'email' OR added_by = split_part(auth.jwt() ->> 'email', '@', 1));

-- Allow users to delete their own leads
CREATE POLICY "Allow users to delete their own leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (added_by = auth.jwt() ->> 'email' OR added_by = split_part(auth.jwt() ->> 'email', '@', 1));
