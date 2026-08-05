const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ytzekcukwvpjggvtmmqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0emVrY3Vrd3ZwamdndnRtbXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTE1MTQsImV4cCI6MjA5NzM4NzUxNH0.4KqsaI_hq8b8gcO8SXpenx2_OsBK-2s1jibuY8ZEIq4';

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fix() {
    const { data, error } = await db.from('bookings').select('*');
    if (error) {
        console.error(error);
        return;
    }
    
    for (let booking of data) {
        let needsUpdate = false;
        let newStart = booking.start_time;
        
        if (!booking.start_time.includes('AM') && !booking.start_time.includes('PM')) {
            const period = booking.end_time.includes('PM') ? 'PM' : 'AM';
            newStart = `${booking.start_time} ${period}`;
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            console.log(`Fixing ${booking.id}: ${booking.start_time} -> ${newStart}`);
            await db.from('bookings').update({ start_time: newStart }).eq('id', booking.id);
        }
    }
    console.log('Done fixing.');
}

fix();
