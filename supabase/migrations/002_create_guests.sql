-- supabase/migrations/002_create_guests.sql

CREATE TABLE guests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  display_name   TEXT        NOT NULL,
  session_token  TEXT        NOT NULL UNIQUE,
  photo_count    INT         DEFAULT 0,
  consented_at   TIMESTAMPTZ,
  joined_at      TIMESTAMPTZ DEFAULT now(),
  is_removed     BOOLEAN     DEFAULT false
);
