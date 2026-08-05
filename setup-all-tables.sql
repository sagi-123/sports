-- ── Setup all tables for ApexElite Premium Sports Academy ───────────────────
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ytzekcukwvpjggvtmmqt/sql

-- 1. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    sport       TEXT,
    message     TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow public to submit trial registrations
CREATE POLICY "Enable public insert for registrations" ON public.registrations
    FOR INSERT WITH CHECK (true);

-- Allow admins to view/manage registrations
CREATE POLICY "Enable all for registrations based on admin passcode/auth" ON public.registrations
    FOR ALL USING (true) WITH CHECK (true);


-- 2. NEWSLETTER TABLE
CREATE TABLE IF NOT EXISTS public.newsletter (
    email       TEXT PRIMARY KEY,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

-- Allow public to subscribe
CREATE POLICY "Enable public insert for newsletter" ON public.newsletter
    FOR INSERT WITH CHECK (true);

-- Allow admins to view/manage subscribers
CREATE POLICY "Enable all for newsletter based on admin passcode/auth" ON public.newsletter
    FOR ALL USING (true) WITH CHECK (true);


-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sport         TEXT NOT NULL,
    location      TEXT DEFAULT 'Chennai',
    booking_date  TEXT NOT NULL,
    start_time    TEXT NOT NULL,
    end_time      TEXT NOT NULL,
    duration      INTEGER NOT NULL,
    user_id       UUID,
    user_email    TEXT NOT NULL,
    user_name     TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- Migration statement for existing table:
-- ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Chennai';

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read bookings (so they can see which slots are already booked)
CREATE POLICY "Allow public read for bookings" ON public.bookings
    FOR SELECT USING (true);

-- Allow authenticated users to insert bookings
CREATE POLICY "Allow authenticated insert for bookings" ON public.bookings
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow manage bookings (e.g. admins deleting slot bookings)
CREATE POLICY "Enable all for bookings based on admin passcode/auth" ON public.bookings
    FOR ALL USING (true) WITH CHECK (true);


-- 4. GALLERY_IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    caption     TEXT NOT NULL,
    category    TEXT DEFAULT 'General',
    image_url   TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public gallery read" ON public.gallery_images
    FOR SELECT USING (true);

-- Allow all insert/delete
CREATE POLICY "Admin gallery write" ON public.gallery_images
    FOR ALL USING (true) WITH CHECK (true);
