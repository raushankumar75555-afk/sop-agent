-- ============================================
-- SOP Agent Pro - Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist (CAUTION: This deletes data!)
-- Uncomment only if you want to reset everything
-- DROP TABLE IF EXISTS history;
-- DROP TABLE IF EXISTS sops;
-- DROP TABLE IF EXISTS licenses;
-- DROP TABLE IF EXISTS settings;

-- Licenses / WhoKeys table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'team')),
  label TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  brokerage TEXT DEFAULT 'default'
);

-- Settings table (Owner toggles)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_active BOOLEAN DEFAULT true,
  sop_lockdown BOOLEAN DEFAULT false,
  anthropic_api_key TEXT,
  brokerage TEXT DEFAULT 'default',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOPs table
CREATE TABLE IF NOT EXISTS sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  brokerage TEXT DEFAULT 'default',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- History table
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL,
  role TEXT NOT NULL,
  label TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  brokerage TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS Policies
-- ============================================

-- Licenses: Allow all reads (keys are validated in Edge Function)
CREATE POLICY "Allow all reads on licenses" 
  ON licenses FOR SELECT 
  USING (true);

CREATE POLICY "Allow all inserts on licenses" 
  ON licenses FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all updates on licenses" 
  ON licenses FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all deletes on licenses" 
  ON licenses FOR DELETE 
  USING (true);

-- Settings: Allow all reads
CREATE POLICY "Allow all reads on settings" 
  ON settings FOR SELECT 
  USING (true);

CREATE POLICY "Allow all updates on settings" 
  ON settings FOR UPDATE 
  USING (true);

-- SOPs: Allow all CRUD (key validation in Edge Function)
CREATE POLICY "Allow all on sops" 
  ON sops FOR ALL 
  USING (true);

-- History: Allow all operations
CREATE POLICY "Allow all on history" 
  ON history FOR ALL 
  USING (true);

-- ============================================
-- Seed Data
-- ============================================

-- Insert default settings
INSERT INTO settings (tool_active, sop_lockdown, anthropic_api_key)
VALUES (true, false, NULL)
ON CONFLICT DO NOTHING;

-- Insert default owner key (change this!)
INSERT INTO licenses (key, role, label, is_active)
VALUES ('RK-ADMIN-2026-X9', 'owner', 'Owner', true)
ON CONFLICT (key) DO NOTHING;

-- Insert sample SOPs for Australian P&C Insurance
INSERT INTO sops (title, content, category, created_by)
VALUES 
  (
    'Claims Handling Procedure - Property Damage',
    '1. Log incident in claims register with date/time\n2. Gather initial details: policy number, extent of damage, photos if available\n3. Contact insurer within 2 hours for urgent property claims\n4. Advise client to mitigate further damage\n5. Document all communication in client file\n6. Follow up within 24 hours with claim number and adjuster details',
    'Claims Handling',
    'System'
  ),
  (
    'After Hours Emergency Claims',
    '1. Client calls 24/7 emergency hotline (on policy schedule)\n2. If cannot reach insurer, contact after-hours mobile listed on voicemail\n3. For life-threatening emergencies, call 000 first\n4. Document call in claims register Monday morning\n5. Follow up with insurer Monday before 9am\n6. Contact client within 2 hours of opening',
    'After Hours',
    'System'
  ),
  (
    'FSG Distribution Compliance',
    'Provide FSG before providing personal advice, when new client engages services, upon FSG update, when requested, or if remuneration basis changes. Keep records for 7 years per ASIC requirements.',
    'Compliance',
    'System'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_history_license_key ON history(license_key);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sops_category ON sops(category);
CREATE INDEX IF NOT EXISTS idx_sops_title ON sops(title);
