-- ==========================================
-- EVENT SNAP: MASTER DATABASE SETUP SCRIPT
-- ==========================================
-- This script initializes all tables, RLS policies, 
-- performance indexes, and pg_cron automation.
--
-- RUN THIS IN THE SUPABASE SQL EDITOR (https://supabase.com/dashboard/project/_/sql)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS events (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  welcome_message  TEXT,
  expires_at       TIMESTAMPTZ NOT NULL,
  max_guests       INT         DEFAULT NULL,
  is_active        BOOLEAN     DEFAULT true,
  deleted_at       TIMESTAMPTZ DEFAULT NULL,
  created_at       TIMESTAMPTZ DEFAULT now(),
  logo_path        TEXT,
  theme            JSONB       NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS guests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  display_name   TEXT        NOT NULL,
  session_token  TEXT        NOT NULL UNIQUE,
  photo_count    INT         DEFAULT 0,
  consented_at   TIMESTAMPTZ,
  joined_at      TIMESTAMPTZ DEFAULT now(),
  is_removed     BOOLEAN     DEFAULT false
);

CREATE TABLE IF NOT EXISTS photos (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id         UUID        NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  storage_path     TEXT        NOT NULL,
  file_size_bytes  BIGINT,
  width            INT,
  height           INT,
  is_deleted       BOOLEAN     DEFAULT false,
  uploaded_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. SECURITY (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates on rerun
DROP POLICY IF EXISTS "events_public_read_active" ON events;
DROP POLICY IF EXISTS "events_admin_all" ON events;
DROP POLICY IF EXISTS "guests_public_read" ON guests;
DROP POLICY IF EXISTS "guests_admin_all" ON guests;
DROP POLICY IF EXISTS "photos_public_read" ON photos;
DROP POLICY IF EXISTS "photos_admin_all" ON photos;

CREATE POLICY "events_public_read_active" ON events FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "events_admin_all" ON events FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "guests_public_read" ON guests FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = guests.event_id AND events.is_active = true AND events.deleted_at IS NULL)
);
CREATE POLICY "guests_admin_all" ON guests FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "photos_public_read" ON photos FOR SELECT USING (
    is_deleted = false AND EXISTS (SELECT 1 FROM events WHERE events.id = photos.event_id AND events.is_active = true AND events.deleted_at IS NULL)
);
CREATE POLICY "photos_admin_all" ON photos FOR ALL USING (auth.role() = 'authenticated');

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_events_status ON events(is_active, deleted_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guests_event ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_token ON guests(session_token);
CREATE INDEX IF NOT EXISTS idx_photos_gallery ON photos(event_id, uploaded_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_photos_guest ON photos(guest_id, uploaded_at DESC) WHERE is_deleted = false;

-- 5. AUTOMATED CLEANUP (pg_cron)
-- This schedules a job to call your 'auto-delete-expired' Edge Function every night.
-- Ensure you replace the URL and SERVICE_ROLE_KEY below.

SELECT cron.schedule(
  'auto-expire-events-task',
  '0 1 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://fbesqscxkxklqyjwpupk.supabase.co/functions/v1/auto-delete-expired',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZXNxc2N4a3hrbHF5andwdXBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYxOTIxOCwiZXhwIjoyMDkyMTk1MjE4fQ.pmaTjqqzsq5pc9O6L77S70EfazJJlBlpCp8fw07L-qM"}'::jsonb,
      body:='{}'::jsonb
    );
  $$
);

-- 6. INITIAL ADMIN USER (TEMPORARY BYPASS)
-- Note: Replace with your own email/password
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@eventsnap.com',
  crypt('AdminPass123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false
) ON CONFLICT (id) DO NOTHING;
