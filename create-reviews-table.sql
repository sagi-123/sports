-- ── Create reviews table for player feedback ──────────────────────────────────
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ytzekcukwvpjggvtmmqt/sql

CREATE TABLE IF NOT EXISTS public.reviews (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name          TEXT NOT NULL,
    sport         TEXT NOT NULL,
    rating        NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text   TEXT NOT NULL,
    avatar_url    TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    approved      BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read of reviews (so the client site can load approved ones, and admin can view all)
CREATE POLICY "Allow public select on reviews" ON public.reviews
    FOR SELECT USING (true);

-- Allow public insert of reviews (so clients can submit)
CREATE POLICY "Allow public insert on reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Allow admin full access (update/delete) based on client-side authentication or passcode
CREATE POLICY "Allow all on reviews for admins" ON public.reviews
    FOR ALL USING (true) WITH CHECK (true);
