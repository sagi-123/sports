-- ── Create gallery_images table ──────────────────────────────────────────────
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ytzekcukwvpjggvtmmqt/sql

CREATE TABLE IF NOT EXISTS public.gallery_images (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    caption     TEXT NOT NULL,
    category    TEXT DEFAULT 'General',
    image_url   TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Allow anyone to read gallery images (public gallery)
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public gallery read" ON public.gallery_images
    FOR SELECT USING (true);

-- Allow all insert/delete (admin is authenticated by passcode on frontend)
CREATE POLICY "Admin gallery write" ON public.gallery_images
    FOR ALL USING (true) WITH CHECK (true);
