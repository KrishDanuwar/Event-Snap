-- EventSnap pg_cron Setup
-- Run this in the Supabase SQL Editor AFTER enabling the pg_cron extension
--
-- To enable pg_cron:
-- 1. Go to Supabase Dashboard → Database → Extensions
-- 2. Search for "pg_cron"
-- 3. Enable it
-- 4. Then run this SQL:

-- Schedule auto-deletion of expired events every hour
SELECT cron.schedule(
  'auto-delete-expired-events',
  '0 * * * *',  -- every hour at minute 0
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_functions_url') || '/auto-delete-expired',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )$$
);

-- NOTE: You must set the following in Supabase Vault (Dashboard → Settings → Vault):
--   app.settings.supabase_functions_url = https://fbesqscxkxklqyjwpupk.supabase.co/functions/v1
--   app.settings.service_role_key = <your service role key>
--
-- NEVER hardcode the service role key in this SQL file.
-- The Vault approach keeps secrets secure and rotatable.
