-- supabase/migrations/001_create_events.sql

CREATE TABLE events (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  welcome_message  TEXT,
  expires_at       TIMESTAMPTZ NOT NULL,
  max_guests       INT         DEFAULT NULL,        -- NULL = unlimited
  is_active        BOOLEAN     DEFAULT true,
  deleted_at       TIMESTAMPTZ DEFAULT NULL,        -- set on manual deletion
  created_at       TIMESTAMPTZ DEFAULT now(),

  -- Branding
  logo_path        TEXT,                            -- event-assets/{id}/logo.ext
  theme            JSONB       NOT NULL DEFAULT '{}'::jsonb
);
