-- ── Create Supabase Storage bucket for gallery images ─────────────────────────
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ytzekcukwvpjggvtmmqt/sql

-- 1. Create the storage bucket (public so images are viewable without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anyone to READ (view) images from the gallery bucket
CREATE POLICY "Public gallery images read" ON storage.objects
    FOR SELECT USING (bucket_id = 'gallery');

-- 3. Allow anyone to UPLOAD images to the gallery bucket (admin passcode is on the frontend)
CREATE POLICY "Public gallery images insert" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'gallery');

-- 4. Allow anyone to DELETE images from the gallery bucket
CREATE POLICY "Public gallery images delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'gallery');
