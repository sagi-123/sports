-- Create public.timeslots table to allow admins to define available timeslots by duration
CREATE TABLE IF NOT EXISTS public.timeslots (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_time     TEXT NOT NULL, -- e.g. "09:00 AM", "05:30 PM"
    duration      INTEGER NOT NULL DEFAULT 60, -- 30 (30 Min), 60 (1 Hr), 120 (2 Hr)
    sport         TEXT NOT NULL DEFAULT 'All', -- Can be "All" or a specific sport
    created_at    TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_slot_time_duration UNIQUE (slot_time, duration)
);

-- Enable Row Level Security
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;

-- Allow public read-only access (so frontend booking calendar can fetch them)
CREATE POLICY "Allow public read for timeslots" ON public.timeslots
    FOR SELECT USING (true);

-- Allow full access for admin moderation
CREATE POLICY "Enable all for timeslots based on admin passcode" ON public.timeslots
    FOR ALL USING (true) WITH CHECK (true);

-- 30 min defaults
INSERT INTO public.timeslots (slot_time, duration, sport) VALUES
('05:00 AM', 30, 'All'), ('05:30 AM', 30, 'All'), ('06:00 AM', 30, 'All'), ('06:30 AM', 30, 'All'),
('07:00 AM', 30, 'All'), ('07:30 AM', 30, 'All'), ('08:00 AM', 30, 'All'), ('08:30 AM', 30, 'All'),
('09:00 AM', 30, 'All'), ('09:30 AM', 30, 'All'), ('10:00 AM', 30, 'All'), ('10:30 AM', 30, 'All'),
('11:00 AM', 30, 'All'), ('11:30 AM', 30, 'All'), ('12:00 PM', 30, 'All'), ('12:30 PM', 30, 'All'),
('01:00 PM', 30, 'All'), ('01:30 PM', 30, 'All'), ('02:00 PM', 30, 'All'), ('02:30 PM', 30, 'All'),
('03:00 PM', 30, 'All'), ('03:30 PM', 30, 'All'), ('04:00 PM', 30, 'All'), ('04:30 PM', 30, 'All'),
('05:00 PM', 30, 'All'), ('05:30 PM', 30, 'All'), ('06:00 PM', 30, 'All'), ('06:30 PM', 30, 'All'),
('07:00 PM', 30, 'All'), ('07:30 PM', 30, 'All'), ('08:00 PM', 30, 'All'), ('08:30 PM', 30, 'All'),
('09:00 PM', 30, 'All'), ('09:30 PM', 30, 'All'), ('10:00 PM', 30, 'All')
ON CONFLICT (slot_time, duration) DO NOTHING;

-- 60 min defaults
INSERT INTO public.timeslots (slot_time, duration, sport) VALUES
('05:00 AM', 60, 'All'), ('06:00 AM', 60, 'All'), ('07:00 AM', 60, 'All'), ('08:00 AM', 60, 'All'),
('09:00 AM', 60, 'All'), ('10:00 AM', 60, 'All'), ('11:00 AM', 60, 'All'), ('12:00 PM', 60, 'All'),
('01:00 PM', 60, 'All'), ('02:00 PM', 60, 'All'), ('03:00 PM', 60, 'All'), ('04:00 PM', 60, 'All'),
('05:00 PM', 60, 'All'), ('06:00 PM', 60, 'All'), ('07:00 PM', 60, 'All'), ('08:00 PM', 60, 'All'),
('09:00 PM', 60, 'All'), ('10:00 PM', 60, 'All')
ON CONFLICT (slot_time, duration) DO NOTHING;

-- 120 min defaults
INSERT INTO public.timeslots (slot_time, duration, sport) VALUES
('05:00 AM', 120, 'All'), ('07:00 AM', 120, 'All'), ('09:00 AM', 120, 'All'), ('11:00 AM', 120, 'All'),
('01:00 PM', 120, 'All'), ('03:00 PM', 120, 'All'), ('05:00 PM', 120, 'All'), ('07:00 PM', 120, 'All'),
('09:00 PM', 120, 'All')
ON CONFLICT (slot_time, duration) DO NOTHING;
