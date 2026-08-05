// ── Supabase Client Initialization ──────────────────────────────────────────
const SUPABASE_URL = 'https://ytzekcukwvpjggvtmmqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0emVrY3Vrd3ZwamdndnRtbXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTE1MTQsImV4cCI6MjA5NzM4NzUxNH0.4KqsaI_hq8b8gcO8SXpenx2_OsBK-2s1jibuY8ZEIq4';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.db = db;

// ── DOM Elements ─────────────────────────────────────────────────────────────
const loginOverlay      = document.getElementById('admin-login-overlay');
const loginForm         = document.getElementById('admin-login-form');
const loginPasscode     = document.getElementById('admin-passcode');
const loginError        = document.getElementById('login-error');

const adminDashboard    = document.getElementById('admin-dashboard');
const logoutBtn         = document.getElementById('admin-logout-btn');
const refreshBtn        = document.getElementById('admin-refresh-btn');
const adminProfileName  = document.getElementById('admin-profile-name');

const viewTitleHeader   = document.getElementById('view-title-header');
const viewSubtitleHeader= document.getElementById('view-subtitle-header');

// Menu tabs
const menuItems         = document.querySelectorAll('.menu-item');
const views             = document.querySelectorAll('.dashboard-view');

// Stats
const statRegCount      = document.getElementById('stat-reg-count');
const statBookCount     = document.getElementById('stat-book-count');
const statSubCount      = document.getElementById('stat-sub-count');

// Tables
const regTableBody      = document.getElementById('registrations-table-body');
const bookTableBody     = document.getElementById('bookings-table-body');
const subTableBody      = document.getElementById('subscribers-table-body');
const reviewsTableBody  = document.getElementById('reviews-table-body');
const reviewsCountLabel = document.getElementById('reviews-count-label');

// Search & filters
const regSearch         = document.getElementById('reg-search');
const regFilterSport    = document.getElementById('reg-filter-sport');
const bookSearch        = document.getElementById('book-search');
const bookFilterSport   = document.getElementById('book-filter-sport');
const subSearch         = document.getElementById('sub-search');
const reviewFilterStatus = document.getElementById('review-filter-status');

// Activity & ranking
const recentActivitiesList = document.getElementById('recent-activities-list');
const sportsRankingList    = document.getElementById('sports-ranking-list');

// ── State ────────────────────────────────────────────────────────────────────
let allRegistrations    = [];
let allBookings         = [];
let allSubscribers      = [];
let allReviews          = [];

// ── Authentication Gate ──────────────────────────────────────────────────────

function checkAuthStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
        sessionStorage.removeItem('apex_admin_auth');
    }
    
    const isAuth = sessionStorage.getItem('apex_admin_auth') === 'true';
    if (isAuth) {
        showDashboard();
    } else {
        // Fallback: check if we have a current active Supabase user with admin domain
        db.auth.getSession().then(({ data: { session } }) => {
            if (session && (session.user.email === 'admin@apexelite.com' || session.user.user_metadata?.role === 'admin')) {
                sessionStorage.setItem('apex_admin_auth', 'true');
                adminProfileName.textContent = session.user.user_metadata?.full_name || session.user.email;
                showDashboard();
            }
        });
    }
}

function showDashboard() {
    loginOverlay.style.display = 'none';
    adminDashboard.style.display = 'flex';
    loadAllData();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const passcode = loginPasscode.value.trim();
    if (passcode === 'admin2026') {
        sessionStorage.setItem('apex_admin_auth', 'true');
        loginError.textContent = '';
        loginPasscode.value = '';
        showDashboard();
    } else {
        loginError.textContent = '❌ Invalid passcode. Please try again.';
        loginPasscode.value = '';
        loginPasscode.focus();
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('apex_admin_auth');
    adminDashboard.style.display = 'none';
    loginOverlay.style.display = 'flex';
    loginPasscode.focus();
});

// ── View/Tab Switching ───────────────────────────────────────────────────────

const VIEW_METADATA = {
    overview: {
        title: 'Overview Dashboard',
        subtitle: 'ApexElite sports academy statistics and records.'
    },
    registrations: {
        title: 'Trial Registrations',
        subtitle: 'Manage and review new athlete registration inquiries.'
    },
    bookings: {
        title: 'Facility Slot Bookings',
        subtitle: 'View, filter, and manage booked sports facility timeslots.'
    },
    subscribers: {
        title: 'Newsletter Subscribers',
        subtitle: 'Manage subscriber email lists and newsletter subscriptions.'
    },
    gallery: {
        title: 'Gallery Management',
        subtitle: 'Upload and manage images that appear in the public-facing gallery.'
    },
    reviews: {
        title: 'Player Reviews Moderation',
        subtitle: 'Approve, reject, and manage testimonials shown on the homepage.'
    },
    'festive-offer': {
        title: 'Festive Offer Banner',
        subtitle: 'Control the promotional banner shown at the top of the main website.'
    }
};

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const viewName = item.dataset.view;
        if (!viewName) return;

        // Update active menu tab
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Show corresponding view
        views.forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(`view-${viewName}`);
        if (targetView) targetView.classList.add('active');

        // Update headers
        const meta = VIEW_METADATA[viewName];
        if (meta) {
            viewTitleHeader.textContent = meta.title;
            viewSubtitleHeader.textContent = meta.subtitle;
        }

        // Animate progress bars if switching to overview
        if (viewName === 'overview') {
            animateSportsBars();
        }
    });
});

// ── Data Fetching & CRUD ─────────────────────────────────────────────────────

async function loadAllData() {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

    try {
        await Promise.all([
            fetchRegistrations(),
            fetchBookings(),
            fetchSubscribers(),
            fetchGalleryImages(),
            fetchReviews(),
            fetchActiveTimeslots()
        ]);

        // Update statistics on UI
        animateCounter(statRegCount, allRegistrations.length);
        animateCounter(statBookCount, allBookings.length);
        animateCounter(statSubCount, allSubscribers.length);
        updateGalleryStatCard();

        // Populate overview widgets
        populateRecentActivities();
        populateSportsRanking();

        // Populate data tables
        renderRegistrationsTable();
        renderBookingsTable();
        renderSubscribersTable();
        renderReviewsTable();
    } catch (err) {
        console.error('Error synchronizing dashboard data:', err);
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
    }
}

refreshBtn.addEventListener('click', loadAllData);

// 1. Fetch Registrations (Merge Supabase DB + Local Storage)
async function fetchRegistrations() {
    let dbRegs = [];
    try {
        const { data, error } = await db.from('registrations').select('*').order('created_at', { ascending: false });
        if (!error && data) dbRegs = data;
    } catch (err) {
        console.warn('Error fetching registrations from DB:', err.message);
    }
    const localRegs = JSON.parse(localStorage.getItem('apex_elite_registrations_mock') || '[]');
    const existingEmails = new Set(dbRegs.map(r => (r.email || '').toLowerCase().trim()));
    const localOnly = localRegs.filter(r => r.email && !existingEmails.has((r.email || '').toLowerCase().trim()));
    allRegistrations = [...dbRegs, ...localOnly];
    allRegistrations.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

// 2. Fetch Subscribers (Merge Supabase DB + Registrations + Local Storage)
async function fetchSubscribers() {
    let dbSubscribers = [];
    let dbNewsletter = [];
    let dbRegistrations = [];

    try {
        const { data } = await db.from('subscribers').select('*').order('created_at', { ascending: false });
        if (data) dbSubscribers = data;
    } catch (err) {}

    try {
        const { data } = await db.from('newsletter').select('*').order('created_at', { ascending: false });
        if (data) dbNewsletter = data;
    } catch (err) {}

    try {
        const { data } = await db.from('registrations').select('*').order('created_at', { ascending: false });
        if (data) dbRegistrations = data;
    } catch (err) {}

    const localSubs = JSON.parse(localStorage.getItem('apex_elite_subscribers_mock') || '[]');

    const combinedMap = new Map();

    const mergeSub = (item) => {
        const em = (item.email || '').toLowerCase().trim();
        if (!em) return;
        const existing = combinedMap.get(em) || {};
        
        const fn = item.full_name || item.name || existing.full_name || existing.name || 'VIP Subscriber';
        const ph = (item.phone && item.phone !== 'N/A') ? item.phone : ((existing.phone && existing.phone !== 'N/A') ? existing.phone : (item.phone_number || 'N/A'));
        const sp = (item.sport && item.sport !== 'Sports') ? item.sport : ((existing.sport && existing.sport !== 'Sports') ? existing.sport : (item.primary_sport || 'Sports'));

        combinedMap.set(em, {
            ...existing,
            ...item,
            full_name: fn,
            email: em,
            phone: ph,
            sport: sp,
            created_at: existing.created_at || item.created_at || new Date().toISOString()
        });
    };

    // 1. Process Newsletter table entries
    dbNewsletter.forEach(mergeSub);

    // 2. Process Registrations table entries (matching VIP Pass)
    dbRegistrations.forEach(item => {
        if (item.message && item.message.includes('VIP')) {
            mergeSub(item);
        }
    });

    // 3. Process Subscribers table entries
    dbSubscribers.forEach(mergeSub);

    // 4. Process Local Storage entries
    localSubs.forEach(mergeSub);

    allSubscribers = Array.from(combinedMap.values());
    allSubscribers.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

// 3. Fetch Reviews (Merge Supabase DB + Local Storage)
async function fetchReviews() {
    let dbReviews = [];
    try {
        const { data, error } = await db.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) dbReviews = data;
    } catch (err) {
        console.warn('Error fetching reviews from DB:', err.message);
    }
    const localReviews = JSON.parse(localStorage.getItem('apex_reviews_custom') || '[]');
    const existingIds = new Set(dbReviews.map(r => String(r.id)));
    const localOnly = localReviews.filter(r => r.id && !existingIds.has(String(r.id)));
    allReviews = [...dbReviews, ...localOnly];
    allReviews.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

// 3. Fetch Bookings (Support Supabase and localStorage fallback)
async function fetchBookings() {
    let dbBookings = [];

    // Try fetching from database
    try {
        const { data, error } = await db.from('bookings').select('*').order('booking_date', { ascending: false });
        if (!error && data) {
            dbBookings = data;
        }
    } catch (err) {
        console.warn('Database bookings table fetch skipped:', err);
    }

    // Sort by created date descending
    dbBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    allBookings = dbBookings;
}

// CRUD: Delete Registration
async function deleteRegistration(id, email) {
    if (!confirm('Are you sure you want to delete this trial registration?')) return;
    
    let success = false;
    try {
        const { error } = await db.from('registrations').delete().eq('email', email);
        if (!error) success = true;
    } catch (err) {
        console.error('Database delete failed, running local delete:', err);
    }

    // Fallback: local mockup handling
    allRegistrations = allRegistrations.filter(r => r.email !== email);
    localStorage.setItem('apex_elite_registrations_mock', JSON.stringify(allRegistrations));
    success = true;

    if (success) {
        loadAllData();
    }
}

// CRUD: Delete Subscriber
async function deleteSubscriber(email) {
    if (!confirm('Are you sure you want to unsubscribe this email address?')) return;
    
    let success = false;
    try {
        const { error } = await db.from('newsletter').delete().eq('email', email);
        if (!error) success = true;
    } catch (err) {
        console.error('Database delete failed:', err);
    }

    allSubscribers = allSubscribers.filter(s => s.email !== email);
    localStorage.setItem('apex_elite_subscribers_mock', JSON.stringify(allSubscribers));
    success = true;

    if (success) {
        loadAllData();
    }
}

// CRUD: Cancel Booking
async function cancelBooking(id, sport, date, startMin) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    // Remove from DB if applicable
    if (typeof id === 'string' && !id.startsWith('local-')) {
        try {
            await db.from('bookings').delete().eq('id', id);
        } catch (err) {
            console.error('Failed to cancel database booking:', err);
        }
    }

    loadAllData();
}

// ── Rendering Tables ─────────────────────────────────────────────────────────

// Render Registrations
function renderRegistrationsTable() {
    const searchVal = regSearch.value.toLowerCase().trim();
    const sportFilter = regFilterSport.value;

    const filtered = allRegistrations.filter(r => {
        const matchSearch = r.full_name.toLowerCase().includes(searchVal) ||
                            r.email.toLowerCase().includes(searchVal) ||
                            (r.phone && r.phone.includes(searchVal));
        const matchSport = sportFilter === 'all' || r.sport === sportFilter;
        return matchSearch && matchSport;
    });

    regTableBody.innerHTML = '';

    if (filtered.length === 0) {
        regTableBody.innerHTML = `<tr><td colspan="4" class="table-empty">No registrations found.</td></tr>`;
        return;
    }

    filtered.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight: 600;">${escapeHTML(r.full_name)}</td>
            <td><a href="mailto:${r.email}" style="color:var(--accent-color);">${escapeHTML(r.email)}</a></td>
            <td>${formatDate(r.created_at)}</td>
            <td>
                <button class="action-btn btn-delete" title="Delete Inquiry" onclick="deleteRegistration('${r.id}', '${r.email}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        regTableBody.appendChild(row);
    });
}

// Render Bookings
function renderBookingsTable() {
    const searchVal = bookSearch.value.toLowerCase().trim();
    const sportFilter = bookFilterSport.value;

    const filtered = allBookings.filter(b => {
        const matchSearch = b.user_name.toLowerCase().includes(searchVal) ||
                            b.user_email.toLowerCase().includes(searchVal);
        const matchSport = sportFilter === 'all' || b.sport === sportFilter;
        return matchSearch && matchSport;
    });

    bookTableBody.innerHTML = '';

    if (filtered.length === 0) {
        bookTableBody.innerHTML = `<tr><td colspan="8" class="table-empty">No facility bookings found.</td></tr>`;
        return;
    }

    filtered.forEach(b => {
        const row = document.createElement('tr');
        const formattedTime = b.start_time + (b.end_time ? ` - ${b.end_time}` : '');
        row.innerHTML = `
            <td style="font-weight: 600;">${escapeHTML(b.user_name)}</td>
            <td><a href="mailto:${b.user_email}" style="color:var(--accent-color);">${escapeHTML(b.user_email)}</a></td>
            <td><span class="sport-badge">${escapeHTML(b.sport)}</span></td>
            <td>${escapeHTML(b.booking_date)}</td>
            <td style="font-weight: 600;">${escapeHTML(formattedTime)}</td>
            <td><span class="duration-badge">${escapeHTML(b.duration)} Mins</span></td>
            <td style="font-size: 0.8rem; color:var(--text-muted);">${formatDate(b.created_at)}</td>
            <td>
                <button class="action-btn btn-delete" title="Cancel Booking" onclick="cancelBooking('${b.id}', '${b.sport}', '${b.booking_date}')">
                    <i class="fas fa-calendar-times"></i>
                </button>
            </td>
        `;
        bookTableBody.appendChild(row);
    });
}

// Render Subscribers
function renderSubscribersTable() {
    const searchVal = subSearch.value.toLowerCase().trim();

    const filtered = allSubscribers.filter(s => {
        const email = (s.email || '').toLowerCase();
        const name  = (s.full_name || '').toLowerCase();
        return email.includes(searchVal) || name.includes(searchVal);
    });

    subTableBody.innerHTML = '';

    if (filtered.length === 0) {
        subTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No subscribers found.</td></tr>`;
        return;
    }

    filtered.forEach(s => {
        const row = document.createElement('tr');
        const name = s.full_name || s.name || 'VIP Subscriber';
        const phone = s.phone || s.phone_number || 'N/A';
        const sport = s.sport || s.primary_sport || 'Sports';

        row.innerHTML = `
            <td style="font-weight: 600;">${escapeHTML(name)}</td>
            <td><a href="mailto:${s.email}" style="color:var(--accent-color);">${escapeHTML(s.email)}</a></td>
            <td>${escapeHTML(phone)}</td>
            <td><span class="sport-badge">${escapeHTML(sport)}</span></td>
            <td>${formatDate(s.created_at)}</td>
            <td>
                <button class="action-btn btn-delete" title="Remove Subscriber" onclick="deleteSubscriber('${s.email}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        subTableBody.appendChild(row);
    });
}

// Render Reviews
function renderReviewsTable() {
    const tableBody = document.getElementById('reviews-table-body');
    const countLabel = document.getElementById('reviews-count-label');
    const filterSelect = document.getElementById('review-filter-status');
    if (!tableBody) return;

    const filterVal = filterSelect ? filterSelect.value : 'all';

    const filtered = allReviews.filter(r => {
        const status = (r.status || (r.approved ? 'approved' : 'pending')).toLowerCase();
        if (filterVal === 'pending') return status === 'pending';
        if (filterVal === 'approved') return status === 'approved';
        return true;
    });

    if (countLabel) {
        countLabel.textContent = `Total: ${allReviews.length} (${filtered.length} shown)`;
    }

    tableBody.innerHTML = '';
    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No player reviews found.</td></tr>`;
        return;
    }

    filtered.forEach(r => {
        const row = document.createElement('tr');
        const status = (r.status || (r.approved ? 'approved' : 'pending')).toLowerCase();
        const isApproved = status === 'approved';
        const ratingNum = r.rating || 5;
        const stars = '⭐'.repeat(Math.min(5, Math.max(1, Math.round(ratingNum))));
        const name = r.user_name || r.name || r.author_name || 'Anonymous Player';
        const sport = r.sport || 'Sports';
        const text = r.review_text || r.text || '';

        row.innerHTML = `
            <td style="font-weight: 600;">${escapeHTML(name)}</td>
            <td><span class="sport-badge">${escapeHTML(sport)}</span></td>
            <td style="color:#eab308;">${stars} <span style="color:var(--text-muted);font-size:0.8rem;">(${ratingNum}/5)</span></td>
            <td style="max-width: 280px; font-size: 0.85rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${escapeHTML(text)}">
                ${escapeHTML(text)}
            </td>
            <td>
                <span class="status-badge" style="padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; background: ${isApproved ? '#DCFCE7' : '#FEF3C7'}; color: ${isApproved ? '#16A34A' : '#D97706'};">
                    ${isApproved ? 'APPROVED' : 'PENDING'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 6px;">
                    ${!isApproved ? `
                        <button class="action-btn" style="background:#DCFCE7; color:#16A34A; padding: 4px 10px; font-size: 0.78rem;" title="Approve Review" onclick="approveReview('${r.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                    ` : ''}
                    <button class="action-btn btn-delete" title="Delete Review" onclick="deleteReview('${r.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Approve Review Handler
async function approveReview(id) {
    if (typeof id === 'string' && !id.startsWith('local-')) {
        try {
            await db.from('reviews').update({ status: 'approved', approved: true }).eq('id', id);
        } catch (err) {
            console.warn('DB review approve error:', err);
        }
    }

    try {
        const localReviews = JSON.parse(localStorage.getItem('apex_reviews_custom') || '[]');
        const updated = localReviews.map(r => String(r.id) === String(id) ? { ...r, status: 'approved', approved: true } : r);
        localStorage.setItem('apex_reviews_custom', JSON.stringify(updated));
    } catch (e) {
        console.error('Local review update error:', e);
    }

    const item = allReviews.find(r => String(r.id) === String(id));
    if (item) {
        item.status = 'approved';
        item.approved = true;
    }

    renderReviewsTable();
}

// Delete Review Handler
async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this player review?')) return;

    if (typeof id === 'string' && !id.startsWith('local-')) {
        try {
            await db.from('reviews').delete().eq('id', id);
        } catch (err) {
            console.warn('DB review delete error:', err);
        }
    }

    try {
        const localReviews = JSON.parse(localStorage.getItem('apex_reviews_custom') || '[]');
        const updated = localReviews.filter(r => String(r.id) !== String(id));
        localStorage.setItem('apex_reviews_custom', JSON.stringify(updated));
    } catch (e) {
        console.error('Local review delete error:', e);
    }

    allReviews = allReviews.filter(r => String(r.id) !== String(id));
    renderReviewsTable();
}

// Listen to search/filter inputs
regSearch.addEventListener('input', renderRegistrationsTable);
regFilterSport.addEventListener('change', renderRegistrationsTable);
bookSearch.addEventListener('input', renderBookingsTable);
bookFilterSport.addEventListener('change', renderBookingsTable);
subSearch.addEventListener('input', renderSubscribersTable);
if (reviewFilterStatus) {
    reviewFilterStatus.addEventListener('change', renderReviewsTable);
}

// ── Overview Section Helpers ─────────────────────────────────────────────────

function populateRecentActivities() {
    recentActivitiesList.innerHTML = '';

    const items = [];
    
    allRegistrations.slice(0, 4).forEach(r => {
        const name = (r.full_name || r.name || r.user_name || (r.email ? r.email.split('@')[0] : '') || 'Member').trim();
        items.push({
            type: 'registration',
            name: name,
            badgeLabel: 'Registered',
            desc: `Sport: ${r.sport || 'General'}`,
            date: r.created_at,
            char: (name.charAt(0) || 'M').toUpperCase()
        });
    });

    allBookings.slice(0, 4).forEach(b => {
        const name = (b.user_name || b.full_name || b.name || (b.user_email ? b.user_email.split('@')[0] : '') || 'Player').trim();
        items.push({
            type: 'booking',
            name: name,
            badgeLabel: 'Slot Booked',
            desc: `${b.sport || 'Court'} (${b.booking_date || 'Upcoming'})`,
            date: b.created_at,
            char: (name.charAt(0) || 'P').toUpperCase()
        });
    });

    allSubscribers.slice(0, 4).forEach(s => {
        const name = (s.full_name || s.name || (s.email ? s.email.split('@')[0] : '') || 'VIP Subscriber').trim();
        items.push({
            type: 'subscriber',
            name: name,
            badgeLabel: 'VIP Subscribed',
            desc: `Sport: ${s.sport || 'All Sports'}`,
            date: s.created_at,
            char: (name.charAt(0) || 'S').toUpperCase()
        });
    });

    // Sort combined by date
    items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    const showItems = items.slice(0, 6);

    if (showItems.length === 0) {
        recentActivitiesList.innerHTML = `<div class="table-empty">No recent activity.</div>`;
        return;
    }

    showItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'activity-item';

        let bg = 'linear-gradient(135deg, #16A34A, #22C55E)';
        let color = '#FFFFFF';
        let typeBadgeBg = 'rgba(22, 163, 74, 0.2)';
        let typeBadgeColor = '#4ADE80';

        if (item.type === 'subscriber') {
            bg = 'linear-gradient(135deg, #EAB308, #FACC15)';
            color = '#0F172A';
            typeBadgeBg = 'rgba(234, 179, 8, 0.2)';
            typeBadgeColor = '#FACC15';
        } else if (item.type === 'registration') {
            bg = 'linear-gradient(135deg, #3B82F6, #60A5FA)';
            color = '#FFFFFF';
            typeBadgeBg = 'rgba(59, 130, 246, 0.2)';
            typeBadgeColor = '#60A5FA';
        }

        div.innerHTML = `
            <div class="activity-details" style="display: flex; align-items: center; gap: 14px;">
                <div class="activity-avatar" style="width: 40px; height: 40px; min-width: 40px; border-radius: 50%; background: ${bg}; color: ${color}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2px solid rgba(255,255,255,0.25); flex-shrink: 0;">
                    ${item.char}
                </div>
                <div class="activity-text">
                    <p style="margin: 0 0 3px 0; font-weight: 800; font-size: 0.95rem; color: #FFFFFF !important; display: flex; align-items: center; gap: 8px;">
                        <span>${escapeHTML(item.name)}</span>
                        <span style="font-size: 0.7rem; font-weight: 700; background: ${typeBadgeBg}; color: ${typeBadgeColor}; padding: 2px 8px; border-radius: 10px;">${item.badgeLabel}</span>
                    </p>
                    <span style="font-size: 0.8rem; color: #94A3B8; font-weight: 500;">${escapeHTML(item.desc)}</span>
                </div>
            </div>
            <div class="activity-time" style="font-size: 0.78rem; font-weight: 600; color: #94A3B8; background: rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;">${timeAgo(item.date)}</div>
        `;
        recentActivitiesList.appendChild(div);
    });
}

function populateSportsRanking() {
    sportsRankingList.innerHTML = '';
    
    // Count bookings by sport
    const counts = {};
    allBookings.forEach(b => {
        counts[b.sport] = (counts[b.sport] || 0) + 1;
    });

    // Make sure all default sports show in list even with 0 bookings
    const sportsList = ['Basketball', 'Football', 'Cricket', 'Volleyball', 'Athletics', 'Fitness Training', 'Shuttle Cork'];
    sportsList.forEach(s => {
        if (counts[s] === undefined) counts[s] = 0;
    });

    const sorted = Object.keys(counts)
        .map(sport => ({ sport, count: counts[sport] }))
        .sort((a, b) => b.count - a.count);

    const maxCount = sorted[0]?.count || 1;

    sorted.forEach(item => {
        const percent = Math.max(5, Math.min(100, (item.count / maxCount) * 100));
        const div = document.createElement('div');
        div.className = 'sport-ranking-item';
        div.innerHTML = `
            <div class="sport-rank-label">
                <span>${item.sport}</span>
                <span style="color: var(--accent-color);">${item.count} bookings</span>
            </div>
            <div class="sport-bar-container">
                <div class="sport-bar-fill" data-width="${percent}%"></div>
            </div>
        `;
        sportsRankingList.appendChild(div);
    });

    // Animate width expansion
    setTimeout(animateSportsBars, 150);
}

function animateSportsBars() {
    document.querySelectorAll('.sport-bar-fill').forEach(bar => {
        const w = bar.dataset.width;
        if (w) bar.style.width = w;
    });
}

// ── Export CSV Functionality ─────────────────────────────────────────────────

document.querySelectorAll('.btn-csv-export').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        if (!type) return;

        let csvContent = "";
        let filename = "";

        if (type === 'registrations') {
            filename = `apex_registrations_${formatDateStr(new Date())}.csv`;
            csvContent = "Full Name,Email,Phone,Sport,Message,Created At\n";
            allRegistrations.forEach(r => {
                csvContent += `"${cleanCSV(r.full_name)}","${cleanCSV(r.email)}","${cleanCSV(r.phone)}","${cleanCSV(r.sport)}","${cleanCSV(r.message)}","${r.created_at}"\n`;
            });
        } else if (type === 'bookings') {
            filename = `apex_bookings_${formatDateStr(new Date())}.csv`;
            csvContent = "Member Name,Email,Sport,Date,Time Slot,Duration (Mins),Created At\n";
            allBookings.forEach(b => {
                const slotLabel = b.start_time + (b.end_time ? ` - ${b.end_time}` : '');
                csvContent += `"${cleanCSV(b.user_name)}","${cleanCSV(b.user_email)}","${cleanCSV(b.sport)}","${cleanCSV(b.booking_date)}","${cleanCSV(slotLabel)}","${b.duration}","${b.created_at}"\n`;
            });
        } else if (type === 'subscribers') {
            filename = `apex_subscribers_${formatDateStr(new Date())}.csv`;
            csvContent = "Email Address,Created At\n";
            allSubscribers.forEach(s => {
                csvContent += `"${cleanCSV(s.email)}","${s.created_at}"\n`;
            });
        }

        downloadCSV(csvContent, filename);
    });
});

function cleanCSV(str) {
    if (!str) return '';
    return str.replace(/"/g, '""').replace(/\r?\n|\r/g, ' ');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ── General Utility Helpers ──────────────────────────────────────────────────

function animateCounter(el, target) {
    let current = 0;
    const duration = 800; // ms
    const increment = target / (duration / 16); // 60fps frame rate approximation
    
    if (target === 0) {
        el.textContent = "0";
        return;
    }

    const update = () => {
        current += increment;
        if (current < target) {
            el.textContent = Math.ceil(current);
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    };
    update();
}

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#039;");
}

function formatDate(isoStr) {
    if (!isoStr) return 'N/A';
    try {
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return isoStr;
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch(e) {
        return isoStr;
    }
}

function formatDateStr(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}

function timeAgo(isoStr) {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// Check status on page load
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// ── Gallery Management ───────────────────────────────────────────────────────

let allGalleryImages    = [];
let currentGalleryFile  = null;

const galleryUploadForm = document.getElementById('gallery-upload-form');
const galleryCaption    = document.getElementById('gallery-caption');
const galleryCategory   = document.getElementById('gallery-category');
const galleryImageFile  = document.getElementById('gallery-image-file');
const galleryImageUrl   = document.getElementById('gallery-image-url');
const galleryUploadMsg  = document.getElementById('gallery-upload-msg');
const galleryUploadBtn  = document.getElementById('gallery-upload-btn');
const galleryPreviewBox = document.getElementById('gallery-preview-box');
const galleryPreviewImg = document.getElementById('gallery-preview-img');
const adminGalleryGrid  = document.getElementById('admin-gallery-grid');
const galleryCountLabel = document.getElementById('gallery-count-label');
const galleryFilterCat  = document.getElementById('gallery-filter-cat');
const galleryDropZone   = document.getElementById('gallery-drop-zone');

// ── Helpers ──────────────────────────────────────────────────────────────────

function setGalleryMsg(msg, color) {
    if (!galleryUploadMsg) return;
    galleryUploadMsg.textContent = msg;
    galleryUploadMsg.style.color = color || '';
}

function updateGalleryStatCard() {
    const el = document.getElementById('stat-gallery-count');
    if (el) el.textContent = allGalleryImages.length;
}

// ── File input → base64 preview ──────────────────────────────────────────────

if (galleryImageFile) {
    galleryImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setGalleryMsg('❌ File too large. Max 10MB.', '#ff4d4d');
            return;
        }

        setGalleryMsg('⏳ Processing image...', 'var(--accent-color)');

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimensions to ensure local storage doesn't run out of space quickly
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed jpeg
                currentGalleryFile = canvas.toDataURL('image/jpeg', 0.7);

                if (galleryImageUrl) galleryImageUrl.value = ''; // clear URL field
                if (galleryPreviewBox && galleryPreviewImg) {
                    galleryPreviewImg.src = currentGalleryFile;
                    galleryPreviewBox.style.display = 'block';
                }
                setGalleryMsg('✅ Image processed successfully.', 'var(--accent-color)');
            };
            img.onerror = () => {
                setGalleryMsg('❌ Failed to load image file.', '#ff4d4d');
            };
            img.src = ev.target.result;
        };
        reader.onerror = () => {
            setGalleryMsg('❌ Failed to read file.', '#ff4d4d');
        };
        reader.readAsDataURL(file);
    });
}

// Drag-and-drop effect
if (galleryDropZone) {
    galleryDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        galleryDropZone.classList.add('dragover');
    });
    galleryDropZone.addEventListener('dragleave', () => {
        galleryDropZone.classList.remove('dragover');
    });
    galleryDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        galleryDropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            galleryImageFile.files = e.dataTransfer.files;
            galleryImageFile.dispatchEvent(new Event('change'));
        }
    });
}

// If URL is pasted, show preview and clear file
if (galleryImageUrl) {
    galleryImageUrl.addEventListener('input', () => {
        const url = galleryImageUrl.value.trim();
        if (url && galleryPreviewBox && galleryPreviewImg) {
            currentGalleryFile = null;
            galleryPreviewImg.src = url;
            galleryPreviewBox.style.display = 'block';
        } else if (!url && galleryPreviewBox) {
            galleryPreviewBox.style.display = 'none';
        }
    });
}

// ── Upload submit ────────────────────────────────────────────────────────────

if (galleryUploadForm) {
    galleryUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const caption   = galleryCaption.value.trim();
        const category  = galleryCategory.value;
        const urlVal    = galleryImageUrl.value.trim();
        const file      = galleryImageFile && galleryImageFile.files && galleryImageFile.files[0];

        if (!caption) {
            setGalleryMsg('❌ Please provide a caption/title.', '#ff4d4d');
            return;
        }
        if (!file && !urlVal && !currentGalleryFile) {
            setGalleryMsg('❌ Please upload a file or provide an image URL.', '#ff4d4d');
            return;
        }

        galleryUploadBtn.disabled = true;
        galleryUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        setGalleryMsg('', '');

        const imageData = currentGalleryFile || urlVal;

        const payload = {
            caption,
            category,
            image_url: imageData,
            created_at: new Date().toISOString()
        };

        // ── Try Supabase first (if connected) ─────────────────────────────
        let savedToSupabase = false;
        try {
            const { data, error } = await db.from('gallery_images').insert([payload]).select();
            if (error) throw error;
            if (data && data[0]) {
                allGalleryImages.unshift(data[0]);
                savedToSupabase = true;
            }
        } catch (err) {
            console.warn('Supabase not available, saving locally:', err.message);
        }

        // ── Fallback: Save to localStorage (works across all pages same origin) ──
        if (!savedToSupabase) {
            try {
                const localItem = { ...payload, id: `local-${Date.now()}` };
                const localGallery = JSON.parse(localStorage.getItem('apex_gallery_images') || '[]');
                localGallery.unshift(localItem);
                localStorage.setItem('apex_gallery_images', JSON.stringify(localGallery));
                allGalleryImages.unshift(localItem);
            } catch (err) {
                console.error('LocalStorage write failed:', err);
                setGalleryMsg('❌ Storage full. Please use a shorter URL or delete some images first.', '#ff4d4d');
                galleryUploadBtn.disabled = false;
                galleryUploadBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Gallery';
                return;
            }
        }

        setGalleryMsg('✅ Image added! Visible on the public gallery.', 'var(--accent-color)');
        galleryUploadForm.reset();
        currentGalleryFile = null;
        if (galleryPreviewBox) galleryPreviewBox.style.display = 'none';
        if (galleryPreviewImg) galleryPreviewImg.src = '';
        renderAdminGalleryGrid();
        updateGalleryStatCard();
        setTimeout(() => setGalleryMsg('', ''), 4000);

        galleryUploadBtn.disabled = false;
        galleryUploadBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Gallery';
    });
}


// ── Fetch gallery images ─────────────────────────────────────────────────────

async function fetchGalleryImages() {
    let dbImages = null;
    try {
        const { data, error } = await db.from('gallery_images').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        dbImages = data || [];
    } catch (err) {
        console.warn('Supabase gallery fetch failed, using localStorage:', err.message);
    }

    if (dbImages !== null) {
        // Supabase available — combine DB images with any local-only items
        const localItems = JSON.parse(localStorage.getItem('apex_gallery_images') || '[]');
        // Only keep local items that aren't already in the DB (i.e. local-prefixed)
        const localOnly = localItems.filter(li => typeof li.id === 'string' && li.id.startsWith('local-'));
        allGalleryImages = [...dbImages, ...localOnly];
    } else {
        // Supabase unavailable — fall back to localStorage entirely
        allGalleryImages = JSON.parse(localStorage.getItem('apex_gallery_images') || '[]');
    }

    renderAdminGalleryGrid();
    updateGalleryStatCard();
}

// ── Render admin gallery grid ────────────────────────────────────────────────

function renderAdminGalleryGrid() {
    if (!adminGalleryGrid) return;

    const filterCat = galleryFilterCat ? galleryFilterCat.value : 'all';
    const filtered = filterCat === 'all'
        ? allGalleryImages
        : allGalleryImages.filter(img => img.category === filterCat);

    adminGalleryGrid.innerHTML = '';

    if (galleryCountLabel) {
        galleryCountLabel.textContent = `${filtered.length} image${filtered.length !== 1 ? 's' : ''}`;
    }

    if (filtered.length === 0) {
        adminGalleryGrid.innerHTML = `
            <div class="gallery-empty-state">
                <i class="fas fa-images"></i>
                <p>No gallery images yet. Upload one above!</p>
            </div>
        `;
        return;
    }

    filtered.forEach(img => {
        const item = document.createElement('div');
        item.className = 'admin-gallery-item';

        const imgEl = document.createElement('img');
        imgEl.src = img.image_url;
        imgEl.alt = img.caption || '';
        imgEl.loading = 'lazy';
        imgEl.onerror = function() {
            this.src = 'https://via.placeholder.com/400x300?text=Image+Error';
            this.style.opacity = '0.4';
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'admin-gallery-delete';
        deleteBtn.title = 'Delete image';
        deleteBtn.dataset.id = img.id;   // store the UUID safely in a data attribute
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.addEventListener('click', () => deleteGalleryImage(img.id));

        const info = document.createElement('div');
        info.className = 'admin-gallery-item-info';
        info.innerHTML = `
            <div class="admin-gallery-item-caption" title="${escapeHTML(img.caption)}">${escapeHTML(img.caption)}</div>
            <div class="admin-gallery-item-meta">
                <span class="admin-gallery-badge">${escapeHTML(img.category || 'General')}</span>
                <span>${formatDate(img.created_at)}</span>
            </div>
        `;

        item.appendChild(imgEl);
        item.appendChild(deleteBtn);
        item.appendChild(info);
        adminGalleryGrid.appendChild(item);
    });
}

// ── Delete gallery image ─────────────────────────────────────────────────────

async function deleteGalleryImage(id) {
    if (!confirm('Delete this image from the gallery?')) return;

    // ── OPTIMISTIC DELETE: remove from UI immediately ──────────────────────────
    // This always works regardless of Supabase status or RLS policies.
    allGalleryImages = allGalleryImages.filter(img => img.id !== id);

    // Also remove from localStorage mirror (covers both local- and UUID items)
    const localItems = JSON.parse(localStorage.getItem('apex_gallery_images') || '[]');
    localStorage.setItem('apex_gallery_images', JSON.stringify(
        localItems.filter(img => img.id !== id)
    ));

    renderAdminGalleryGrid();
    updateGalleryStatCard();
    setGalleryMsg('✅ Image deleted.', 'var(--accent-color)');
    setTimeout(() => setGalleryMsg('', ''), 3000);

    // ── BACKGROUND SYNC: try to remove from Supabase too ─────────────────────
    const isLocal = typeof id === 'string' && id.startsWith('local-');
    if (!isLocal) {
        try {
            const { error } = await db.from('gallery_images').delete().eq('id', id);
            if (error) {
                // Log only — UI already updated
                console.warn('Supabase delete note:', error.message);
            }
        } catch (err) {
            console.warn('Supabase delete background error:', err.message);
        }
    }
}

// ── Category filter ──────────────────────────────────────────────────────────

if (galleryFilterCat) {
    galleryFilterCat.addEventListener('change', renderAdminGalleryGrid);
}

// ── Player Reviews Moderation ────────────────────────────────────────────────

if (reviewFilterStatus) {
    reviewFilterStatus.addEventListener('change', renderReviewsTable);
}

async function fetchReviews() {
    let dbReviews = null;
    try {
        const { data, error } = await db.from('reviews').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        dbReviews = data || [];
    } catch (err) {
        console.warn('Supabase reviews fetch failed, using localStorage:', err.message);
    }

    if (dbReviews !== null) {
        const localReviews = JSON.parse(localStorage.getItem('apex_reviews_custom') || '[]');
        const localOnly = localReviews.filter(lr => typeof lr.id === 'string' && lr.id.startsWith('local-'));
        const dbTexts = new Set(dbReviews.map(r => r.review_text.trim()));
        const uniqueLocal = localOnly.filter(lr => !dbTexts.has(lr.review_text.trim()));
        allReviews = [...dbReviews, ...uniqueLocal];
    } else {
        allReviews = JSON.parse(localStorage.getItem('apex_reviews_custom') || '[]');
    }

    allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderReviewsTable();
}

function renderReviewsTable() {
    if (!reviewsTableBody) return;

    const statusFilter = reviewFilterStatus ? reviewFilterStatus.value : 'all';
    const filtered = allReviews.filter(r => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'pending') return r.approved === false;
        if (statusFilter === 'approved') return r.approved === true;
        return true;
    });

    reviewsTableBody.innerHTML = '';

    if (reviewsCountLabel) {
        reviewsCountLabel.textContent = `${filtered.length} review${filtered.length !== 1 ? 's' : ''}`;
    }

    if (filtered.length === 0) {
        reviewsTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No reviews found.</td></tr>`;
        return;
    }

    filtered.forEach(r => {
        const row = document.createElement('tr');
        const isApproved = r.approved === true;
        const statusBadge = isApproved
            ? `<span class="sport-badge" style="background: rgba(204,255,0,0.1); color: var(--accent-color); border-color: rgba(204,255,0,0.2)">Approved</span>`
            : `<span class="sport-badge" style="background: rgba(255,165,0,0.1); color: #ffa500; border-color: rgba(255,165,0,0.2)">Pending</span>`;

        const approveBtn = !isApproved
            ? `<button class="action-btn btn-view" title="Approve Review" onclick="approveReview('${r.id}')" style="margin-right: 10px; color: var(--accent-color);">
                <i class="fas fa-check-circle"></i>
               </button>`
            : '';

        row.innerHTML = `
            <td style="font-weight: 600;">${escapeHTML(r.name)}</td>
            <td><span class="sport-badge">${escapeHTML(r.sport)}</span></td>
            <td style="color: #ffc107; font-weight: 600;">
                ${'★'.repeat(Math.floor(r.rating))}${r.rating % 1 !== 0 ? '½' : ''} 
                <span style="font-size: 0.8rem; color: var(--text-muted);">(${Number(r.rating).toFixed(1)})</span>
            </td>
            <td style="max-width: 300px; font-size: 0.85rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: normal;" title="${escapeHTML(r.review_text)}">
                "${escapeHTML(r.review_text)}"
            </td>
            <td>${statusBadge}</td>
            <td>
                ${approveBtn}
                <button class="action-btn btn-delete" title="Delete Review" onclick="deleteReview('${r.id}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        reviewsTableBody.appendChild(row);
    });
}

async function approveReview(id) {
    if (!confirm('Approve this review for the homepage carousel?')) return;

    const revIndex = allReviews.findIndex(r => r.id === id);
    if (revIndex !== -1) {
        allReviews[revIndex].approved = true;
    }

    const localReviews = JSON.parse(localStorage.getItem('apex_reviews_custom') || '[]');
    const localIndex = localReviews.findIndex(r => r.id === id);
    if (localIndex !== -1) {
        localReviews[localIndex].approved = true;
        localStorage.setItem('apex_reviews_custom', JSON.stringify(localReviews));
    }

    renderReviewsTable();

    const isLocal = typeof id === 'string' && id.startsWith('local-');
    if (!isLocal) {
        try {
            const { error } = await db.from('reviews').update({ approved: true }).eq('id', id);
            if (error) {
                console.error('Supabase review approval error:', error.message);
            }
        } catch (err) {
            console.error('Supabase review approval error:', err.message);
        }
    }
}

async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    allReviews = allReviews.filter(r => r.id !== id);

    const localReviews = JSON.parse(localStorage.getItem('apex_reviews_custom') || '[]');
    localStorage.setItem('apex_reviews_custom', JSON.stringify(
        localReviews.filter(r => r.id !== id)
    ));

    renderReviewsTable();

    const isLocal = typeof id === 'string' && id.startsWith('local-');
    if (!isLocal) {
        try {
            const { error } = await db.from('reviews').delete().eq('id', id);
            if (error) {
                console.error('Supabase review delete error:', error.message);
            }
        } catch (err) {
            console.error('Supabase review delete error:', err.message);
        }
    }
}

// Expose these methods to the window object so inline onclick attributes can access them
window.approveReview = approveReview;
window.deleteReview = deleteReview;
window.fetchReviews = fetchReviews;
window.removeTimeslot = removeTimeslot;

// ── AVAILABLE TIMESLOTS MANAGEMENT ───────────────────────────────────────────
let activeTimeslots = [];

const durationFilter = document.getElementById('admin-timeslot-duration-filter');
if (durationFilter) {
    durationFilter.addEventListener('change', renderActiveSlotsGrid);
}

async function fetchActiveTimeslots() {
    let dbSlots = [];
    try {
        const { data, error } = await db.from('timeslots').select('*').order('slot_time', { ascending: true });
        if (!error && data && data.length > 0) {
            dbSlots = data;
        }
    } catch (e) {
        console.warn("Supabase fetch timeslots failed, using local storage:", e);
    }

    const localSlots = JSON.parse(localStorage.getItem('apex_timeslots_custom_duration') || '[]');

    // Define complete standard timeslots for all durations
    const defaults30 = [
        "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
        "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
        "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
        "09:00 PM", "09:30 PM", "10:00 PM"
    ].map(time => ({ id: `default-30-${time}`, slot_time: time, duration: 30 }));

    const defaults60 = [
        "05:00 AM", "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM",
        "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
        "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
    ].map(time => ({ id: `default-60-${time}`, slot_time: time, duration: 60 }));

    const defaults120 = [
        "05:00 AM", "07:00 AM", "09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM", "09:00 PM"
    ].map(time => ({ id: `default-120-${time}`, slot_time: time, duration: 120 }));

    const allDefaults = [...defaults30, ...defaults60, ...defaults120];
    const sourceSlots = dbSlots.length > 0 ? dbSlots : localSlots;

    const existingMap = new Map();
    sourceSlots.forEach(s => {
        const key = `${s.duration || 60}_${s.slot_time}`;
        existingMap.set(key, s);
    });

    allDefaults.forEach(s => {
        const key = `${s.duration}_${s.slot_time}`;
        if (!existingMap.has(key)) {
            existingMap.set(key, s);
        }
    });

    activeTimeslots = Array.from(existingMap.values());
    activeTimeslots.sort((a, b) => parseTimeStr(a.slot_time) - parseTimeStr(b.slot_time));
    renderActiveSlotsGrid();
}

function parseTimeStr(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return 0;
    const time = parts[0];
    const period = parts[1];
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
}

function fmtTime(totalMin) {
    const normalizedMin = totalMin % 1440;
    const h24  = Math.floor(normalizedMin / 60);
    const min  = normalizedMin % 60;
    const h12  = h24 % 12 === 0 ? 12 : h24 % 12;
    const mStr = min === 0 ? '00' : String(min).padStart(2, '0');
    const ampm = h24 < 12 ? 'AM' : 'PM';
    return { time: `${h12}:${mStr}`, period: ampm };
}

function renderActiveSlotsGrid() {
    const container = document.getElementById('admin-active-slots-container');
    if (!container) return;

    container.innerHTML = '';
    
    const selectedDur = durationFilter ? parseInt(durationFilter.value, 10) : 60;
    const filteredSlots = activeTimeslots.filter(s => s.duration === selectedDur);

    if (filteredSlots.length === 0) {
        container.innerHTML = `<span style="color:var(--text-muted); font-size:0.9rem;">No timeslots currently defined for this duration.</span>`;
        return;
    }

    filteredSlots.forEach(slot => {
        const badge = document.createElement('div');
        badge.className = 'timeslot-pill-badge';
        badge.style.display = 'inline-flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '10px';
        badge.style.padding = '8px 14px';
        badge.style.fontSize = '0.88rem';
        badge.style.fontWeight = '700';
        badge.style.background = 'rgba(16, 185, 129, 0.12)';
        badge.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        badge.style.color = '#065F46';
        badge.style.borderRadius = '20px';

        // Calculate end time
        const startMin = parseTimeStr(slot.slot_time);
        const endMin = startMin + selectedDur;
        const startFormatted = fmtTime(startMin);
        const endFormatted = fmtTime(endMin);
        const rangeText = `${startFormatted.time} ${startFormatted.period} - ${endFormatted.time} ${endFormatted.period}`;

        badge.innerHTML = `
            <span><i class="far fa-clock" style="margin-right:4px;"></i> ${rangeText}</span>
            <i class="fas fa-times-circle" style="cursor:pointer; color:#EF4444; font-size:1rem; transition:transform 0.2s;" 
               title="Remove timeslot"
               onclick="removeTimeslot('${slot.id}', '${slot.slot_time}')"></i>
        `;
        container.appendChild(badge);
    });
}

async function removeTimeslot(id, slotTime) {
    if (!confirm(`Are you sure you want to remove the "${slotTime}" timeslot?`)) return;

    activeTimeslots = activeTimeslots.filter(s => s.id !== id);
    localStorage.setItem('apex_timeslots_custom_duration', JSON.stringify(activeTimeslots));
    
    renderActiveSlotsGrid();

    if (typeof id === 'string' && !id.startsWith('local-')) {
        try {
            await db.from('timeslots').delete().eq('id', id);
        } catch (e) {
            console.error("Failed to delete timeslot from Supabase:", e);
        }
    }
}

const addTimeslotForm = document.getElementById('admin-add-timeslot-form');
const timeslotMsg = document.getElementById('admin-timeslot-msg');

if (addTimeslotForm) {
    addTimeslotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('new-timeslot-value');
        if (!input) return;
        const newTime = input.value;
        if (!newTime) return;

        const selectedDur = durationFilter ? parseInt(durationFilter.value, 10) : 60;

        if (activeTimeslots.some(s => s.slot_time === newTime && s.duration === selectedDur)) {
            if (timeslotMsg) {
                timeslotMsg.textContent = `❌ Timeslot "${newTime}" already exists for this duration!`;
                timeslotMsg.style.color = '#ff4d4d';
                setTimeout(() => timeslotMsg.textContent = '', 3000);
            }
            return;
        }

        const newId = `local-${selectedDur}-${newTime}-${Date.now()}`;
        const newObj = { id: newId, slot_time: newTime, duration: selectedDur };
        activeTimeslots.push(newObj);
        localStorage.setItem('apex_timeslots_custom_duration', JSON.stringify(activeTimeslots));

        activeTimeslots.sort((a, b) => parseTimeStr(a.slot_time) - parseTimeStr(b.slot_time));
        renderActiveSlotsGrid();
        
        if (timeslotMsg) {
            timeslotMsg.textContent = `✅ Added timeslot "${newTime}" to ${selectedDur} Min duration.`;
            timeslotMsg.style.color = 'var(--accent-color)';
            setTimeout(() => timeslotMsg.textContent = '', 3000);
        }

        try {
            const { data, error } = await db.from('timeslots').insert([{ slot_time: newTime, duration: selectedDur }]).select();
            if (!error && data && data.length > 0) {
                const index = activeTimeslots.findIndex(s => s.id === newId);
                if (index !== -1) {
                    activeTimeslots[index] = data[0];
                    renderActiveSlotsGrid();
                }
            }
        } catch (err) {
            console.warn("Supabase timeslot insert failed, saved locally:", err);
        }
    });
}

// ══════════════════════════════════════════════════════════════════════════════
//  FESTIVE OFFER MANAGER — Supabase-backed
//  Saves settings to Supabase site_settings table.
//  Falls back to localStorage if Supabase is unavailable.
// ══════════════════════════════════════════════════════════════════════════════
(function initFestiveOfferManager() {
    const LS_KEY  = 'apex_festive_offer';
    const DB_KEY  = 'festive_offer';

    const DEFAULTS = {
        enabled: false,
        message: '🎉 Special Deal: Get 20% OFF on all Slot Bookings!',
        code:    'FESTIVE20',
        cta:     'Claim Offer'
    };

    const toggleInput = document.getElementById('festive-toggle-input');
    const toggleLabel = document.getElementById('festive-toggle-label');
    const msgInput    = document.getElementById('festive-msg-input');
    const codeInput   = document.getElementById('festive-code-input');
    const ctaInput    = document.getElementById('festive-cta-input');
    const saveBtn     = document.getElementById('festive-save-btn');
    const resetBtn    = document.getElementById('festive-reset-btn');
    const saveMsg     = document.getElementById('festive-save-msg');
    const statusBadge = document.getElementById('festive-status-badge');
    const previewText = document.getElementById('preview-text');
    const previewCta  = document.getElementById('preview-cta');
    const previewBar  = document.getElementById('festive-admin-preview');

    if (!toggleInput) return;

    // ── Update UI preview & status badge ─────────────────────────────────────
    function updateUI(s) {
        statusBadge.textContent      = s.enabled ? '● LIVE' : '○ OFF';
        statusBadge.style.background = s.enabled ? '#DCFCE7' : '#F1F5F9';
        statusBadge.style.color      = s.enabled ? '#16A34A' : '#64748B';
        toggleLabel.textContent      = s.enabled
            ? 'Banner is ON — All visitors can see this offer'
            : "Banner is OFF — Visitors won't see the offer";
        toggleLabel.style.color  = s.enabled ? '#16A34A' : 'var(--text-muted)';
        previewBar.style.opacity = s.enabled ? '1' : '0.45';
        if (previewText) previewText.innerHTML = `${s.message} Use Code: <span style="background:#fff;color:#0F172A;padding:2px 8px;border-radius:6px;font-weight:800;">${s.code}</span>`;
        if (previewCta)  previewCta.innerHTML  = `${s.cta} <i class="fas fa-bolt"></i>`;
    }

    // ── Populate form fields ──────────────────────────────────────────────────
    function applyToForm(s) {
        toggleInput.checked = s.enabled;
        msgInput.value      = s.message;
        codeInput.value     = s.code;
        ctaInput.value      = s.cta;
        updateUI(s);
    }

    // ── Load settings from Supabase (with localStorage fallback) ─────────────
    async function loadSettings() {
        try {
            const { data, error } = await db
                .from('site_settings')
                .select('value')
                .eq('key', DB_KEY)
                .single();

            if (!error && data && data.value) {
                const s = { ...DEFAULTS, ...data.value };
                localStorage.setItem(LS_KEY, JSON.stringify(s)); // sync to LS
                applyToForm(s);
                return;
            }
        } catch (err) {
            console.warn('Supabase load failed, falling back to localStorage:', err);
        }
        // Fallback
        const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null') || DEFAULTS;
        applyToForm(saved);
    }

    // ── Live preview as admin types ───────────────────────────────────────────
    function livePreview() {
        updateUI({
            enabled: toggleInput.checked,
            message: msgInput.value  || DEFAULTS.message,
            code:    codeInput.value || DEFAULTS.code,
            cta:     ctaInput.value  || DEFAULTS.cta
        });
    }

    toggleInput.addEventListener('change', livePreview);
    msgInput.addEventListener('input', livePreview);
    codeInput.addEventListener('input', livePreview);
    ctaInput.addEventListener('input', livePreview);

    // ── Save & Publish to Supabase ────────────────────────────────────────────
    async function saveSettings(showSuccessMsg = true) {
        const settings = {
            enabled: toggleInput.checked,
            message: msgInput.value.trim()   || DEFAULTS.message,
            code:    (codeInput.value.trim()  || DEFAULTS.code).toUpperCase(),
            cta:     ctaInput.value.trim()    || DEFAULTS.cta
        };

        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }

        // Save immediately to localStorage
        localStorage.setItem(LS_KEY, JSON.stringify(settings));
        updateUI(settings);

        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/site_settings?on_conflict=key`,
                {
                    method: 'POST',
                    headers: {
                        'apikey':        SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type':  'application/json',
                        'Prefer':        'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({ key: DB_KEY, value: settings, updated_at: new Date().toISOString() })
                }
            );

            console.log('[FestiveOffer] Save status:', res.status);

            if (!res.ok && res.status !== 200 && res.status !== 201) {
                const errText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errText}`);
            }

            if (showSuccessMsg && saveMsg) {
                saveMsg.innerHTML = '<i class="fas fa-check-circle" style="color:#16A34A;"></i> <span style="color:#16A34A;">✅ Saved! Banner is updated for all visitors.</span>';
                setTimeout(() => saveMsg.innerHTML = '', 5000);
            }
        } catch (err) {
            console.error('[FestiveOffer] Supabase save failed:', err);
            if (saveMsg) {
                saveMsg.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#F59E0B;"></i> <span style="color:#F59E0B;">Saved locally (Supabase: ${err.message})</span>`;
                setTimeout(() => saveMsg.innerHTML = '', 5000);
            }
        }

        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save & Publish';
        }
    }

    // Auto-save & preview on input changes
    toggleInput.addEventListener('change', () => {
        livePreview();
        saveSettings(true);
    });
    msgInput.addEventListener('input', livePreview);
    codeInput.addEventListener('input', livePreview);
    ctaInput.addEventListener('input', livePreview);

    saveBtn.addEventListener('click', () => saveSettings(true));

    // ── Reset to defaults ─────────────────────────────────────────────────────
    resetBtn.addEventListener('click', async () => {
        if (!confirm('Reset all festive offer settings to default?')) return;

        localStorage.setItem(LS_KEY, JSON.stringify(DEFAULTS));
        applyToForm(DEFAULTS);

        try {
            await fetch(
                `${SUPABASE_URL}/rest/v1/site_settings?on_conflict=key`,
                {
                    method: 'POST',
                    headers: {
                        'apikey':        SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type':  'application/json',
                        'Prefer':        'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({ key: DB_KEY, value: DEFAULTS, updated_at: new Date().toISOString() })
                }
            );
        } catch (err) {
            console.warn('[FestiveOffer] Supabase reset failed:', err);
        }

        if (saveMsg) {
            saveMsg.innerHTML = '<i class="fas fa-undo" style="color:#64748B;"></i> <span style="color:#64748B;">Reset to default settings.</span>';
            setTimeout(() => saveMsg.innerHTML = '', 3500);
        }
    });

    loadSettings();
})();
