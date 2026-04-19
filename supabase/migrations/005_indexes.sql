-- supabase/migrations/005_indexes.sql

-- Index for querying events by status
CREATE INDEX IF NOT EXISTS idx_events_status 
  ON events(is_active, deleted_at, created_at DESC);

-- Index for guest fast lookups
CREATE INDEX IF NOT EXISTS idx_guests_event   
  ON guests(event_id);

CREATE INDEX IF NOT EXISTS idx_guests_token   
  ON guests(session_token);

-- Gallery queries (all guests, event-wide, newest first)
CREATE INDEX IF NOT EXISTS idx_photos_gallery
  ON photos(event_id, uploaded_at DESC)
  WHERE is_deleted = false;

-- Guest own-photos queries (for ZIP download)
CREATE INDEX IF NOT EXISTS idx_photos_guest
  ON photos(guest_id, uploaded_at DESC)
  WHERE is_deleted = false;
