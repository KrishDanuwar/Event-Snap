-- EventSnap Storage Bucket Setup
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)

-- Both buckets: private, no public access
-- All reads are via signed URLs

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('event-assets', 'event-assets', false, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('event-photos', 'event-photos', false, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies

-- Allow authenticated admin to manage all files in event-assets
CREATE POLICY "admin_manage_event_assets"
  ON storage.objects FOR ALL
  USING (bucket_id = 'event-assets' AND auth.role() = 'authenticated');

-- Allow authenticated admin to manage all files in event-photos
CREATE POLICY "admin_manage_event_photos"
  ON storage.objects FOR ALL
  USING (bucket_id = 'event-photos' AND auth.role() = 'authenticated');

-- Allow uploads via signed URLs (service role creates signed URLs server-side)
-- No additional policy needed — signed URLs bypass RLS
