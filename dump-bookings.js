const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ytzekcukwvpjggvtmmqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0emVrY3Vrd3ZwamdndnRtbXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTE1MTQsImV4cCI6MjA5NzM4NzUxNH0.4KqsaI_hq8b8gcO8SXpenx2_OsBK-2s1jibuY8ZEIq4';

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function dump() {
    const { data, error } = await db.from('bookings').select('*');
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

dump();
