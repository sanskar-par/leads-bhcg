-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_url TEXT NOT NULL,
  name TEXT NOT NULL,
  latest_company TEXT NOT NULL,
  industry TEXT NOT NULL,
  role_type TEXT NOT NULL,
  email TEXT NOT NULL,
  alternate_email TEXT,
  phone_number TEXT,
  is_bitsian BOOLEAN NOT NULL DEFAULT false,
  remarks TEXT,
  added_by TEXT NOT NULL REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_added_by ON leads(added_by);
CREATE INDEX IF NOT EXISTS idx_leads_added_at ON leads(added_at DESC);

-- Insert sample users (password: password123 for all)
INSERT INTO users (id, name, password) VALUES
  ('user1', 'Rithvik Kumar', 'password123'),
  ('user2', 'Priya Singh', 'password123'),
  ('user3', 'Arjun Patel', 'password123')
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads (optional - remove if you want to start fresh)
INSERT INTO leads (
  linkedin_url,
  name,
  latest_company,
  industry,
  role_type,
  email,
  alternate_email,
  phone_number,
  is_bitsian,
  remarks,
  added_by
) VALUES
  (
    'https://www.linkedin.com/in/johndoe',
    'John Doe',
    'Tech Corp',
    'Technology',
    'CEO',
    'john.doe@techcorp.com',
    'jdoe@personal.com',
    '+1-555-0101',
    true,
    'Met at tech conference 2024',
    'user1'
  ),
  (
    'https://www.linkedin.com/in/janesmith',
    'Jane Smith',
    'HealthCare Inc',
    'Healthcare',
    'VP',
    'jane.smith@healthcare.com',
    NULL,
    '+1-555-0102',
    false,
    NULL,
    'user2'
  ),
  (
    'https://www.linkedin.com/in/mikejohnson',
    'Mike Johnson',
    'Finance Solutions',
    'Finance',
    'Director',
    'mike.j@financesol.com',
    'm.johnson@gmail.com',
    NULL,
    true,
    'Interested in partnership opportunities',
    'user1'
  )
ON CONFLICT DO NOTHING;
