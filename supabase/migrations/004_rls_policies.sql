-- supabase/migrations/004_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

--
-- EVENTS RLS
--

-- Public (Anonymous): Can read public data of ACTIVE events
CREATE POLICY "events_public_read_active" 
  ON events FOR SELECT 
  USING (is_active = true AND deleted_at IS NULL);

-- Admin (Authenticated): Full access to ALL events
CREATE POLICY "events_admin_all" 
  ON events FOR ALL 
  USING (auth.role() = 'authenticated');

--
-- GUESTS RLS
--

-- Guests: Can read their own session via session_token for API validation bypass, but wait: 
-- The PRD specifies API routes /api/guests/* use bypass (service role) so direct access isn't strictly needed
-- However, for Supabase Realtime, guests need to subscribe to the guest list or photos.
-- But the PRD says Realtime for Guest Gallery relies on the DB. 
-- Best practice: strictly restrict client-side reads to just what is needed, or allow read if event is active.

-- Public: Can read guests if the associated event is active
-- (Needed for the gallery to show photographer names via joining)
CREATE POLICY "guests_public_read" 
  ON guests FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = guests.event_id AND events.is_active = true AND events.deleted_at IS NULL
    )
  );

-- Admin (Authenticated): Full access to ALL guests
CREATE POLICY "guests_admin_all" 
  ON guests FOR ALL 
  USING (auth.role() = 'authenticated');

--
-- PHOTOS RLS
--

-- Public: Can read photos belonging to active events, not deleted
CREATE POLICY "photos_public_read" 
  ON photos FOR SELECT 
  USING (
    is_deleted = false AND
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = photos.event_id AND events.is_active = true AND events.deleted_at IS NULL
    )
  );

-- Admin (Authenticated): Full access to ALL photos
CREATE POLICY "photos_admin_all" 
  ON photos FOR ALL 
  USING (auth.role() = 'authenticated');
