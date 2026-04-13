-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cleanup existing objects to ensure a clean state
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS schedule CASCADE;
DROP TABLE IF EXISTS cultural_results CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS houses CASCADE;
DROP FUNCTION IF EXISTS recompute_points();

-- Houses table
CREATE TABLE houses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  mascot TEXT,
  mascot_name TEXT,
  logo_url TEXT,
  banner_url TEXT,
  points INTEGER DEFAULT 0,
  rank_pos INTEGER DEFAULT 0,
  motto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  gender TEXT,
  eligible_years TEXT,
  category_type TEXT CHECK (category_type IN ('sport', 'cultural')),
  special_rules TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  registration_url TEXT,
  team_size TEXT,
  duration TEXT,
  image_url TEXT,
  judging_criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id BIGSERIAL PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  match_no INTEGER,
  team1_id TEXT REFERENCES houses(id) ON DELETE CASCADE,
  team2_id TEXT REFERENCES houses(id) ON DELETE CASCADE,
  score1 INTEGER DEFAULT 0,
  score2 INTEGER DEFAULT 0,
  winner_id TEXT REFERENCES houses(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('upcoming', 'live', 'completed')) DEFAULT 'upcoming',
  venue TEXT,
  match_time TIMESTAMP WITH TIME ZONE,
  eligible_years TEXT,
  man_of_the_match TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cultural Results table
CREATE TABLE cultural_results (
  id BIGSERIAL PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  house_id TEXT REFERENCES houses(id) ON DELETE CASCADE,
  rank INTEGER,
  points INTEGER,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule table
CREATE TABLE schedule (
  id BIGSERIAL PRIMARY KEY,
  day_label TEXT,
  day_date DATE,
  time_start TIME,
  time_end TIME,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT,
  venue TEXT,
  house_ids TEXT, -- comma separated IDs
  status TEXT CHECK (status IN ('upcoming', 'live', 'completed')) DEFAULT 'upcoming',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  key_name TEXT PRIMARY KEY,
  val TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery table
CREATE TABLE gallery (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video')) DEFAULT 'image',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notices table
CREATE TABLE notices (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT,
  event_name TEXT,
  student_name TEXT NOT NULL,
  student_class TEXT,
  student_section TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table for role management
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staged changes table for approval workflow
CREATE TABLE staged_changes (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  updates JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by_email TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'discarded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPC Function to recompute points
CREATE OR REPLACE FUNCTION recompute_points()
RETURNS void AS $$
DECLARE
  house_record RECORD;
  match_points INTEGER;
  cultural_points INTEGER;
BEGIN
  FOR house_record IN SELECT id FROM houses LOOP
    -- Points from matches (10 for win)
    SELECT COALESCE(COUNT(*) * 10, 0) INTO match_points
    FROM matches
    WHERE winner_id = house_record.id AND status = 'completed';
    
    -- Points from cultural results
    SELECT COALESCE(SUM(points), 0) INTO cultural_points
    FROM cultural_results
    WHERE house_id = house_record.id;
    
    -- Update house points
    UPDATE houses
    SET points = match_points + cultural_points
    WHERE id = house_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staged_changes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for houses" ON houses FOR SELECT USING (true);
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access for matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read access for cultural_results" ON cultural_results FOR SELECT USING (true);
CREATE POLICY "Public read access for schedule" ON schedule FOR SELECT USING (true);
CREATE POLICY "Public read access for settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read access for gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read access for notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Public read access for profiles" ON profiles FOR SELECT USING (true);

-- Create policies for admin write access
CREATE POLICY "Admin write access for houses" ON houses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for matches" ON matches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for cultural_results" ON cultural_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for schedule" ON schedule FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for notices" ON notices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for registrations" ON registrations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for staged_changes" ON staged_changes FOR ALL USING (auth.role() = 'authenticated');
