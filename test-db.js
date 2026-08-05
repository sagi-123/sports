const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ytzekcukwvpjggvtmmqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0emVrY3Vrd3ZwamdndnRtbXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTE1MTQsImV4cCI6MjA5NzM4NzUxNH0.4KqsaI_hq8b8gcO8SXpenx2_OsBK-2s1jibuY8ZEIq4';

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
    console.log('Testing connection...');
    
    // Test registrations
    const { data: regData, error: regError } = await db.from('registrations').select('*').limit(1);
    console.log('Registrations table:', regError ? `Error: ${regError.message}` : `Success (${regData.length} records)`);

    // Test newsletter
    const { data: newsData, error: newsError } = await db.from('newsletter').select('*').limit(1);
    console.log('Newsletter table:', newsError ? `Error: ${newsError.message}` : `Success (${newsData.length} records)`);

    // Test bookings
    const { data: bookData, error: bookError } = await db.from('bookings').select('*').limit(1);
    console.log('Bookings table:', bookError ? `Error: ${bookError.message}` : `Success (${bookData.length} records)`);
}

checkTables();
