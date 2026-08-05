// ── Supabase Client ──────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://ytzekcukwvpjggvtmmqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0emVrY3Vrd3ZwamdndnRtbXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTE1MTQsImV4cCI6MjA5NzM4NzUxNH0.4KqsaI_hq8b8gcO8SXpenx2_OsBK-2s1jibuY8ZEIq4';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.db = db;
console.log('✅ Supabase initialized');

// ── Auth Modal Logic ─────────────────────────────────────────────────────────
const authModal    = document.getElementById('auth-modal');
const openBtn      = document.getElementById('open-auth-modal');
const closeBtn     = document.getElementById('close-auth-modal');
const navAuthArea  = document.getElementById('nav-auth-area');
const tabs         = document.querySelectorAll('.auth-tab');
const tabSignin    = document.getElementById('tab-signin');
const tabSignup    = document.getElementById('tab-signup');

// Open / Close modal
if (openBtn) {
    openBtn.addEventListener('click', () => { authModal.style.display = 'flex'; });
}
if (closeBtn) {
    closeBtn.addEventListener('click', () => { authModal.style.display = 'none'; });
}
if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) authModal.style.display = 'none';
    });
}

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        tabSignin.style.display = target === 'signin' ? 'block' : 'none';
        tabSignup.style.display = target === 'signup' ? 'block' : 'none';
    });
});

// Sync user registration to admin registrations tracking (deduplicated)
async function syncUserRegistration(user) {
    if (!user || !user.email) return;
    const email = user.email.toLowerCase().trim();
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
    const phone = user.user_metadata?.phone || user.phone || 'N/A';
    const sport = user.user_metadata?.sport || 'General';

    const payload = {
        full_name: name,
        email: email,
        phone: phone,
        sport: sport,
        created_at: new Date().toISOString()
    };

    // 1. Sync to LocalStorage without duplicates
    try {
        const localRegs = JSON.parse(localStorage.getItem('apex_elite_registrations_mock') || '[]');
        if (!localRegs.some(r => (r.email || '').toLowerCase().trim() === email)) {
            localRegs.unshift(payload);
            localStorage.setItem('apex_elite_registrations_mock', JSON.stringify(localRegs));
        }
    } catch (e) {
        console.error('Sync user reg LocalStorage error:', e);
    }

    // 2. Sync to Supabase registrations table without duplicates
    try {
        const { data } = await db.from('registrations').select('id, email').eq('email', email);
        if (!data || data.length === 0) {
            await db.from('registrations').insert([payload]);
        }
    } catch (e) {
        console.warn('Sync user reg DB error:', e);
    }
}

// Update navbar based on auth state
function updateNavAuth(user) {
    const adminBtn = `<a href="admin.html" target="_blank" class="nav-admin-btn" id="admin-portal-btn"><i class="fas fa-user-shield"></i> Admin</a>`;

    const navAdminLink = document.getElementById('nav-admin-link');
    const navAuthLink = document.getElementById('nav-auth-link');

    if (user) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        navAuthArea.innerHTML = `
            ${adminBtn}
            <div class="nav-user" style="display:inline-flex;align-items:center;gap:10px;">
                <span class="nav-user-name" style="font-weight:700;font-size:0.85rem;">👋 ${name}</span>
                <button class="nav-auth-btn" id="signout-btn">Sign Out</button>
            </div>`;

        if (navAdminLink) navAdminLink.style.display = 'inline-block';
        if (navAuthLink) navAuthLink.textContent = 'Sign Out';

        authModal.style.display = 'none';
        syncUserRegistration(user);

        // Restore pending booking popup immediately upon sign in (self-contained for deployment resilience)
        setTimeout(() => {
            if (typeof window.restorePendingBooking === 'function') {
                window.restorePendingBooking();
            } else {
                restorePendingSlotBookingSelfContained();
            }
        }, 200);
    } else {
        navAuthArea.innerHTML = `${adminBtn}<button id="open-auth-modal" class="nav-auth-btn">Sign In</button>`;

        if (navAdminLink) navAdminLink.style.display = 'inline-block';
        if (navAuthLink) navAuthLink.textContent = 'Sign In';
    }
}

// Self-contained restore helper for deployment resilience
function restorePendingSlotBookingSelfContained() {
    try {
        const pending = sessionStorage.getItem('pending_slot_booking');
        if (!pending) return false;
        const data = JSON.parse(pending);
        if (data && data.selectedSlot) {
            const scpSport = document.getElementById('scp-sport');
            const scpLoc   = document.getElementById('scp-location');
            const scpDate  = document.getElementById('scp-date');
            const scpTime  = document.getElementById('scp-time');
            const scpPrice = document.getElementById('scp-price');

            if (scpSport && data.currentSport) scpSport.textContent = data.currentSport;
            if (scpLoc && data.currentLocation)   scpLoc.textContent = data.currentLocation;
            if (scpDate && data.selectedDate)  scpDate.textContent = data.selectedDate;

            if (scpTime && data.selectedSlot.startMin) {
                const duration = data.currentDuration || 60;
                const fmt = (totalMin) => {
                    const normalizedMin = totalMin % 1440;
                    const h24 = Math.floor(normalizedMin / 60);
                    const min = normalizedMin % 60;
                    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
                    const mStr = min === 0 ? '00' : String(min).padStart(2, '0');
                    const ampm = h24 < 12 ? 'AM' : 'PM';
                    return { time: `${h12}:${mStr}`, period: ampm };
                };
                const st = fmt(data.selectedSlot.startMin);
                const et = fmt(data.selectedSlot.startMin + duration);
                scpTime.textContent = `${st.time} ${st.period} - ${et.time} ${et.period}`;
            }

            if (scpPrice && data.selectedSlot.price) {
                const duration = data.currentDuration || 60;
                const total = data.selectedSlot.price * (duration / 60);
                scpPrice.textContent = `₹${total}`;
            }

            const confirmPopup = document.getElementById('slot-confirm-popup');
            if (confirmPopup) {
                confirmPopup.style.display = 'flex';
            }
            sessionStorage.removeItem('pending_slot_booking');
            return true;
        }
    } catch (e) {
        console.error('Error restoring pending slot booking in supabase-client:', e);
    }
    return false;
}

// ── Auth Click Event Delegation ──────────────────────────────────────────────
document.body.addEventListener('click', async (e) => {
    const target = e.target;
    
    // Helper to close mobile menu
    const closeMobileMenu = () => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) navLinks.classList.remove('active');
        const hamburger = document.querySelector('.hamburger i');
        if (hamburger) {
            hamburger.classList.remove('fa-times');
            hamburger.classList.add('fa-bars');
        }
    };

    // Sign In click (handles both main menu link and dynamic navbar button)
    if (target.closest('#open-auth-modal') || (target.closest('#nav-auth-link') && target.textContent.trim() === 'Sign In')) {
        e.preventDefault();
        closeMobileMenu();
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'flex';
    }

    // Sign Out click (handles both dynamic signout button and menu link)
    if (target.closest('#signout-btn') || (target.closest('#nav-auth-link') && target.textContent.trim() === 'Sign Out')) {
        e.preventDefault();
        closeMobileMenu();
        if (typeof db !== 'undefined') {
            await db.auth.signOut();
        }
    }
});

// Listen to auth state changes
db.auth.onAuthStateChange((_event, session) => {
    updateNavAuth(session?.user || null);
});

// Check current session on load
db.auth.getSession().then(({ data: { session } }) => {
    updateNavAuth(session?.user || null);
});
db.auth.getSession().then(({ data: { session } }) => {
    updateNavAuth(session?.user || null);
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
async function signInWithGoogle() {
    console.log('🔵 Google Sign-in button clicked!');
    try {
        const { data, error } = await db.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname,
            }
        });
        console.log('🔵 signInWithOAuth response:', { data, error });
        if (error) {
            // Show error inline in the modal if Google popup fails
            const msg = document.getElementById('signin-msg') || document.getElementById('signup-msg');
            if (msg) {
                msg.textContent = '❌ ' + error.message;
                msg.style.color = '#ff4d4d';
            }
        }
    } catch (err) {
        console.error('🔴 Exception in signInWithGoogle:', err);
    }
}

// Wire up both Google buttons (sign-in tab + sign-up tab)
const googleSignInBtn  = document.getElementById('google-signin-btn');
const googleSignUpBtn  = document.getElementById('google-signup-btn');
if (googleSignInBtn) googleSignInBtn.addEventListener('click', signInWithGoogle);
if (googleSignUpBtn)  googleSignUpBtn.addEventListener('click', signInWithGoogle);

// ── Sign In Form ─────────────────────────────────────────────────────────────
document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    const btn      = document.getElementById('signin-btn');
    const msg      = document.getElementById('signin-msg');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    const { data, error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
        msg.textContent = '❌ ' + error.message;
        msg.style.color = '#ff4d4d';
    } else {
        if (data && data.user) syncUserRegistration(data.user);
        msg.textContent = '✅ Signed in successfully!';
        msg.style.color = '#ccff00';
        setTimeout(() => {
            authModal.style.display = 'none';
            msg.textContent = '';
            
            // If user came from booking flow, re-open Confirm Booking Box for final confirmation
            const confirmPopup = document.getElementById('slot-confirm-popup');
            if (window.pendingSlotBooking && confirmPopup) {
                confirmPopup.style.display = 'flex';
                window.pendingSlotBooking = false;
            }
        }, 1000);
    }

    btn.disabled = false;
    btn.innerHTML = 'Sign In <i class="fas fa-arrow-right"></i>';
});

// ── Sign Up Form ─────────────────────────────────────────────────────────────
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const btn      = document.getElementById('signup-btn');
    const msg      = document.getElementById('signup-msg');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    const { error } = await db.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
    });

    if (error) {
        msg.textContent = '❌ ' + error.message;
        msg.style.color = '#ff4d4d';
    } else {
        // Sync new member registration to database and local tracking
        try {
            await db.from('registrations').insert([{
                full_name: name,
                email: email,
                created_at: new Date().toISOString()
            }]);
        } catch (dbErr) {
            console.warn('Registrations table sync error:', dbErr);
        }

        try {
            const localRegs = JSON.parse(localStorage.getItem('apex_elite_registrations_mock') || '[]');
            if (!localRegs.some(r => r.email === email)) {
                localRegs.push({ name, full_name: name, email, created_at: new Date().toISOString() });
                localStorage.setItem('apex_elite_registrations_mock', JSON.stringify(localRegs));
            }
        } catch (localErr) {
            console.error('Local registrations sync error:', localErr);
        }

        msg.innerHTML = '<div style="margin-top:8px; padding: 10px 14px; background: #DCFCE7; color: #15803D; border: 1px solid #BBF7D0; border-radius: 10px; font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="fas fa-check-circle"></i> Account created! You can now sign in.</div>';
        document.getElementById('signup-form').reset();
    }

    btn.disabled = false;
    btn.innerHTML = 'Create Account <i class="fas fa-arrow-right"></i>';
});

// ── Newsletter Form ──────────────────────────────────────────────────────────
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletter-email').value.trim();
        const btn   = newsletterForm.querySelector('button[type="submit"]');
        const msg   = document.getElementById('newsletter-msg');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        let success = false;
        let isDuplicate = false;

        try {
            const { error } = await db.from('newsletter').insert([{ email }]);
            if (error) {
                if (error.code === '23505') {
                    isDuplicate = true;
                }
            } else {
                success = true;
            }
        } catch (err) {
            console.warn('Supabase newsletter insert failed, using local fallback:', err.message);
        }

        // Handle local storage storage
        try {
            const localSubs = JSON.parse(localStorage.getItem('apex_elite_subscribers_mock') || '[]');
            if (localSubs.some(s => s.email === email)) {
                isDuplicate = true;
            } else {
                localSubs.push({ email, created_at: new Date().toISOString() });
                localStorage.setItem('apex_elite_subscribers_mock', JSON.stringify(localSubs));
                success = true;
            }
        } catch (err) {
            console.error('Local storage fallback error:', err);
        }

        if (isDuplicate) {
            msg.textContent = 'Already subscribed!';
            msg.style.color = '#ccff00';
        } else if (success) {
            msg.textContent = '✅ Subscribed successfully!';
            msg.style.color = '#ccff00';
            newsletterForm.reset();
        } else {
            msg.textContent = 'Error. Try again.';
            msg.style.color = '#ff4d4d';
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        setTimeout(() => { msg.textContent = ''; }, 4000);
    });
}

// ── Dedicated Newsletter Section Form ────────────────────────────────────────
const sectionNewsletterForm = document.getElementById('section-newsletter-form');
if (sectionNewsletterForm) {
    sectionNewsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('section-newsletter-email');
        const email = emailInput.value.trim();
        const btn   = document.getElementById('section-newsletter-btn');
        const msg   = document.getElementById('section-newsletter-msg');

        btn.disabled = true;
        const originalBtnHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        msg.textContent = '';

        let success = false;
        let isDuplicate = false;

        try {
            const { error } = await db.from('newsletter').insert([{ email }]);
            if (error) {
                if (error.code === '23505') {
                    isDuplicate = true;
                }
            } else {
                success = true;
            }
        } catch (err) {
            console.warn('Supabase section newsletter insert failed, using local fallback:', err.message);
        }

        // Handle local storage storage
        try {
            const localSubs = JSON.parse(localStorage.getItem('apex_elite_subscribers_mock') || '[]');
            if (localSubs.some(s => s.email === email)) {
                isDuplicate = true;
            } else {
                localSubs.push({ email, created_at: new Date().toISOString() });
                localStorage.setItem('apex_elite_subscribers_mock', JSON.stringify(localSubs));
                success = true;
            }
        } catch (err) {
            console.error('Local storage fallback error:', err);
        }

        if (isDuplicate) {
            msg.textContent = 'Already subscribed!';
            msg.style.color = '#ccff00';
        } else if (success) {
            msg.textContent = '🎉 Subscribed successfully!';
            msg.style.color = '#ccff00';
            sectionNewsletterForm.reset();
        } else {
            msg.textContent = 'Error. Please try again.';
            msg.style.color = '#ff4d4d';
        }

        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
        setTimeout(() => { msg.textContent = ''; }, 5000);
    });
}

// ── Inline VIP Subscription Form on Homepage ──────────────────────────────
const inlineSubscribeForm = document.getElementById('inline-subscribe-form');
if (inlineSubscribeForm) {
    inlineSubscribeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name  = (document.getElementById('sub-fullname')?.value || '').trim();
        const email = (document.getElementById('sub-email-input')?.value || '').trim();
        const phone = (document.getElementById('sub-phone')?.value || '').trim();
        const sport = document.getElementById('sub-sport')?.value || 'Sports';
        const btn   = inlineSubscribeForm.querySelector('button[type="submit"]');
        const msg   = document.getElementById('sub-msg');

        if (!email) return;

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        }

        const payload = {
            full_name: name || 'VIP Subscriber',
            name: name || 'VIP Subscriber',
            email: email,
            phone: phone || 'N/A',
            phone_number: phone || 'N/A',
            sport: sport,
            primary_sport: sport,
            created_at: new Date().toISOString()
        };

        let isDuplicate = false;
        let success = false;

        // 1. Save subscriber details to Supabase (subscribers, newsletter, & registrations)
        try {
            const { error: subErr } = await db.from('subscribers').insert([payload]);
            if (!subErr) {
                success = true;
            }
        } catch (err) {
            console.warn('Subscribers table insert skipped:', err);
        }

        try {
            await db.from('newsletter').insert([{ email: email, created_at: payload.created_at }]);
            success = true;
        } catch (err) {
            console.warn('Newsletter table insert skipped:', err);
        }

        try {
            await db.from('registrations').insert([{
                full_name: name || 'VIP Subscriber',
                email: email,
                phone: phone || 'N/A',
                sport: sport || 'Sports',
                message: 'VIP Pass Subscriber',
                created_at: payload.created_at
            }]);
            success = true;
        } catch (err) {
            console.warn('Registrations VIP insert skipped:', err);
        }

        // 2. Save subscriber details to LocalStorage for Admin Panel Tracking (Subscribers tab)
        try {
            const localSubs = JSON.parse(localStorage.getItem('apex_elite_subscribers_mock') || '[]');
            const existingIdx = localSubs.findIndex(s => (s.email || '').toLowerCase() === email.toLowerCase());
            if (existingIdx !== -1) {
                // Update existing mock subscriber with full details
                localSubs[existingIdx] = { ...localSubs[existingIdx], ...payload };
            } else {
                localSubs.unshift(payload);
            }
            localStorage.setItem('apex_elite_subscribers_mock', JSON.stringify(localSubs));
            success = true;
        } catch (e) {
            console.error('LocalStorage subscribe error:', e);
        }

        if (msg) {
            if (isDuplicate) {
                msg.textContent = 'Already subscribed!';
                msg.style.color = '#ccff00';
            } else if (success) {
                msg.textContent = '🎉 Subscribed successfully! Added to VIP subscriber list.';
                msg.style.color = '#ccff00';
                inlineSubscribeForm.reset();
            } else {
                msg.textContent = 'Error subscribing. Please try again.';
                msg.style.color = '#ff4d4d';
            }
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Subscribe <i class="fas fa-paper-plane"></i>';
        }

        if (msg) {
            setTimeout(() => { msg.textContent = ''; }, 4000);
        }
    });
}

// ── Inline Registration & VIP Subscription Form ──────────────────────────────
const inlineRegisterForm = document.getElementById('inline-register-form');
if (inlineRegisterForm) {
    inlineRegisterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name        = document.getElementById('reg-fullname').value.trim();
        const email       = document.getElementById('reg-email').value.trim();
        const phone       = document.getElementById('reg-phone').value.trim();
        const sport       = document.getElementById('reg-sport').value;
        const vipCheckbox = document.getElementById('reg-vip-subscribe');
        const isVip       = vipCheckbox ? vipCheckbox.checked : true;
        const btn         = inlineRegisterForm.querySelector('button[type="submit"]');
        const msg         = document.getElementById('reg-form-msg');

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        const payload = {
            full_name: name,
            email: email,
            phone: phone,
            sport: sport,
            vip_subscribed: isVip,
            created_at: new Date().toISOString()
        };

        let success = false;

        // 1. Insert into Supabase registrations
        try {
            const { error } = await db.from('registrations').insert([payload]);
            if (!error) success = true;
        } catch (err) {
            console.warn('Supabase registration error:', err);
        }

        // 2. If VIP checked, also save to subscribers table
        if (isVip) {
            try {
                await db.from('subscribers').insert([{ email, created_at: new Date().toISOString() }]);
            } catch (subErr) {
                console.warn('Supabase subscriber sync error:', subErr);
            }
        }

        // 3. Save to localStorage for instant admin dashboard tracking
        try {
            const localRegs = JSON.parse(localStorage.getItem('apex_elite_registrations_mock') || '[]');
            localRegs.unshift({ ...payload, id: `local-reg-${Date.now()}` });
            localStorage.setItem('apex_elite_registrations_mock', JSON.stringify(localRegs));

            if (isVip) {
                const localSubs = JSON.parse(localStorage.getItem('apex_elite_subscribers_mock') || '[]');
                if (!localSubs.some(s => (s.email || '').toLowerCase() === email.toLowerCase())) {
                    localSubs.unshift({ email, created_at: new Date().toISOString() });
                    localStorage.setItem('apex_elite_subscribers_mock', JSON.stringify(localSubs));
                }
            }

            success = true;
        } catch (e) {
            console.error('LocalStorage registration error:', e);
        }

        if (msg) {
            if (success) {
                msg.innerHTML = '<div style="margin-top:12px; padding: 12px 16px; background: #DCFCE7; color: #15803D; border: 1px solid #BBF7D0; border-radius: 10px; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px; text-align: center;"><i class="fas fa-check-circle" style="font-size:1.1rem;"></i> 🎉 Account Registered & VIP Pass Activated! Welcome to ApexElite.</div>';
                inlineRegisterForm.reset();
            } else {
                msg.innerHTML = '<div style="margin-top:12px; padding: 12px 16px; background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; border-radius: 10px; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px; text-align: center;"><i class="fas fa-exclamation-circle" style="font-size:1.1rem;"></i> Registration error. Please try again.</div>';
            }
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Register & Activate VIP Pass <i class="fas fa-bolt"></i>';
        }
    });
}
