-- ── Site Settings Table for ApexElite Admin ──────────────────────────────────
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ytzekcukwvpjggvtmmqt/sql

CREATE TABLE IF NOT EXISTS public.site_settings (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to read site settings (so main site can show the banner)
CREATE POLICY "Public can read site settings" ON public.site_settings
    FOR SELECT USING (true);

-- Allow anyone to insert/update (admin controls via passcode)
CREATE POLICY "Admin can write site settings" ON public.site_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Insert the default festive offer row
INSERT INTO public.site_settings (key, value)
VALUES (
    'festive_offer',
    '{
        "enabled": false,
        "message": "🎉 Special Deal: Get 20% OFF on all Slot Bookings!",
        "code": "FESTIVE20",
        "cta": "Claim Offer"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
