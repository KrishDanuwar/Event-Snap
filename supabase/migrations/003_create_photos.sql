-- supabase/migrations/003_create_photos.sql

CREATE TABLE photos (
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
