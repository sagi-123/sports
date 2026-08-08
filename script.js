document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Festive Bar Height adjustment for Navbar & Hero positioning
    function updateFestiveBarOffset() {
        const festiveBar = document.getElementById('top-festive-bar');
        if (festiveBar && festiveBar.offsetHeight > 0 && !festiveBar.classList.contains('hidden')) {
            document.documentElement.style.setProperty('--festive-bar-height', `${festiveBar.offsetHeight}px`);
        } else {
            document.documentElement.style.setProperty('--festive-bar-height', '0px');
        }
    }
    updateFestiveBarOffset();
    window.addEventListener('resize', updateFestiveBarOffset);
    window.addEventListener('load', updateFestiveBarOffset);

    const festiveBarElem = document.getElementById('top-festive-bar');
    if (festiveBarElem && window.ResizeObserver) {
        new ResizeObserver(updateFestiveBarOffset).observe(festiveBarElem);
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar, .floating-navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Global Mobile Menu Toggle Handler
    window.toggleMobileMenu = function (e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        const icon = document.getElementById('hamburger-icon') || (hamburger ? hamburger.querySelector('i') : null);

        if (navLinks) navLinks.classList.toggle('active');
        if (hamburger) hamburger.classList.toggle('active');

        if (icon && navLinks) {
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        }
    };

    // Mobile Menu Toggle Event Listeners
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            window.toggleMobileMenu(e);
        });
    }

    if (navLinks) {
        // Close mobile drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !e.target.closest('.floating-navbar') && !e.target.closest('.nav-links')) {
                navLinks.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
                const icon = document.getElementById('hamburger-icon') || (hamburger ? hamburger.querySelector('i') : null);
                if (icon) icon.className = 'fas fa-bars';
            }
        });
    }

    // Hero 3-Photo Carousel Navigation
    const carouselTrack = document.getElementById('hero-carousel-track');
    const prevBtn = document.getElementById('hero-carousel-prev');
    const nextBtn = document.getElementById('hero-carousel-next');

    if (carouselTrack && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            carouselTrack.scrollBy({ left: -140, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            carouselTrack.scrollBy({ left: 140, behavior: 'smooth' });
        });
    }

    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') { e.preventDefault(); return; }
            if (this.classList.contains('open-slots')) { e.preventDefault(); return; }
            
            // If clicking logo on mobile, scroll home cleanly
            if (this.classList.contains('logo')) {
                e.preventDefault();
                if (navLinks) navLinks.classList.remove('active');
                const homeSec = document.querySelector('#home');
                if (homeSec) homeSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            e.preventDefault();
            if (navLinks) navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ═══════════════════════════════════════════════════
    // ABOUT US CONTINUOUS AUTO-CHANGING SLIDESHOW
    // ═══════════════════════════════════════════════════
    const aboutSlides = document.querySelectorAll('.about-slide');
    const aboutDots = document.querySelectorAll('.about-slider-dots .dot');
    const aboutBadgeText = document.getElementById('about-badge-text');

    if (aboutSlides.length > 0) {
        let currentSlideIndex = 0;
        const slideCount = aboutSlides.length;

        function showAboutSlide(index) {
            aboutSlides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            aboutDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            if (aboutBadgeText && aboutSlides[index]) {
                const caption = aboutSlides[index].getAttribute('data-caption');
                if (caption) aboutBadgeText.textContent = caption;
            }
            currentSlideIndex = index;
        }

        // Auto cycle slides every 3.5 seconds continuously
        let aboutSlideInterval = setInterval(() => {
            let nextIndex = (currentSlideIndex + 1) % slideCount;
            showAboutSlide(nextIndex);
        }, 3500);

        // Clickable dot indicators
        aboutDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                clearInterval(aboutSlideInterval);
                showAboutSlide(i);
                aboutSlideInterval = setInterval(() => {
                    let nextIndex = (currentSlideIndex + 1) % slideCount;
                    showAboutSlide(nextIndex);
                }, 3500);
            });
        });
    }

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('reveal-active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load

    // Statistics Counter Animation
    const statsSection = document.querySelector('.statistics');
    const statNumbers = document.querySelectorAll('.stat-number');
    let started = false;

    const startCounters = () => {
        if (!statsSection) return;
        const sectionTop = statsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (sectionTop < windowHeight - 100 && !started) {
            started = true;
            statNumbers.forEach(stat => {
                const target = +stat.getAttribute('data-target');
                const duration = 2000; // ms
                const increment = target / (duration / 16); // 60fps

                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        stat.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.innerText = target;
                    }
                };
                updateCounter();
            });
        }
    };

    window.addEventListener('scroll', startCounters);
    startCounters(); // Trigger on load if in view


    // ═══════════════════════════════════════════════════════════════════════
    //  SLOT BOOKING MODAL
    // ═══════════════════════════════════════════════════════════════════════

    const slotModal = document.getElementById('slot-modal');
    const closeSlotModal = document.getElementById('close-slot-modal');
    const slotModalHero = document.getElementById('slot-modal-hero');
    const slotSportIcon = document.getElementById('slot-sport-icon');
    const slotModalTitle = document.getElementById('slot-modal-title');
    const slotDurToggle = document.getElementById('slot-duration-toggle');
    const slotGrid = document.getElementById('slot-grid');
    const slotSummary = document.getElementById('slot-summary');
    const confirmSlotBtn = document.getElementById('confirm-slot-btn');
    const slotBookMsg = document.getElementById('slot-book-msg');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summaryDuration = document.getElementById('summary-duration');
    const summarySport = document.getElementById('summary-sport');
    const summarySpIcon = document.getElementById('summary-sport-icon');
    const summaryLocation = document.getElementById('summary-location');
    const slotLocToggle = document.getElementById('slot-location-toggle');
    // Confirm Popup elements
    const confirmPopup = document.getElementById('slot-confirm-popup');
    const scpClose = document.getElementById('scp-close');
    const scpSportIcon = document.getElementById('scp-sport-icon');
    const scpSportName = document.getElementById('scp-sport-name');
    const scpLocation = document.getElementById('scp-location');
    const scpDate = document.getElementById('scp-date');
    const scpTime = document.getElementById('scp-time');
    const scpDuration = document.getElementById('scp-duration');
    const scpConfirmBtn = document.getElementById('scp-confirm-btn');
    const scpMsg = document.getElementById('scp-msg');
    // Calendar elements
    const dateTrigger = document.getElementById('slot-date-trigger');
    const dateTriggerLabel = document.getElementById('slot-date-trigger-label');
    const dateChevron = document.getElementById('slot-date-chevron');
    const calPopup = document.getElementById('slot-calendar-popup');
    const calMonthLabel = document.getElementById('cal-month-label');
    const calGrid = document.getElementById('cal-grid');
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');

    // State
    let currentSport = '';
    let currentLocation = 'Chennai';
    let currentDuration = 30;
    let selectedDate = null;
    let selectedSlot = null;
    let calViewDate = new Date(); // month currently shown in calendar

    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DAY_NAMES_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // ── Calendar popup ──────────────────────────────────────────────────────

    function getLocalDateStr(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function openCalendar() {
        calPopup.style.display = 'block';
        dateChevron.style.transform = 'rotate(180deg)';
        renderCalendar();
    }

    function closeCalendar() {
        calPopup.style.display = 'none';
        dateChevron.style.transform = 'rotate(0deg)';
    }

    function toggleCalendar() {
        if (calPopup.style.display === 'none' || calPopup.style.display === '') {
            openCalendar();
        } else {
            closeCalendar();
        }
    }

    function renderCalendar() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const year = calViewDate.getFullYear();
        const month = calViewDate.getMonth();

        calMonthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;

        // First day of month & total days
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        calGrid.innerHTML = '';

        // Blank cells before the 1st
        for (let b = 0; b < firstDay; b++) {
            const blank = document.createElement('div');
            blank.className = 'cal-cell cal-blank';
            calGrid.appendChild(blank);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const cellDate = new Date(year, month, d);
            const dateStr = getLocalDateStr(cellDate);
            const isPast = cellDate < today;
            const isToday = cellDate.getTime() === today.getTime();
            const isSelected = dateStr === selectedDate;

            const cell = document.createElement('button');
            cell.className = 'cal-cell' +
                (isPast ? ' cal-past' : '') +
                (isToday ? ' cal-today' : '') +
                (isSelected ? ' cal-selected' : '');
            cell.textContent = d;
            cell.disabled = isPast;
            cell.dataset.date = dateStr;

            cell.addEventListener('click', () => {
                selectedDate = dateStr;
                selectedSlot = null;
                hideSummary();
                // Update trigger label
                const [yr, mo, dy] = dateStr.split('-').map(Number);
                const dObj = new Date(yr, mo - 1, dy);
                dateTriggerLabel.textContent = `${DAY_NAMES_LONG[dObj.getDay()]}, ${MONTH_SHORT[dObj.getMonth()]} ${dy}, ${yr}`;
                dateTrigger.classList.add('has-date');
                closeCalendar();
                renderSlots();
            });

            calGrid.appendChild(cell);
        }
    }

    // Month navigation
    if (calPrev) {
        calPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            const today = new Date();
            const prevMonth = new Date(calViewDate.getFullYear(), calViewDate.getMonth() - 1, 1);
            // Don't go before current month
            if (prevMonth.getFullYear() > today.getFullYear() ||
                (prevMonth.getFullYear() === today.getFullYear() && prevMonth.getMonth() >= today.getMonth())) {
                calViewDate = prevMonth;
                renderCalendar();
            }
        });
    }

    if (calNext) {
        calNext.addEventListener('click', (e) => {
            e.stopPropagation();
            calViewDate = new Date(calViewDate.getFullYear(), calViewDate.getMonth() + 1, 1);
            renderCalendar();
        });
    }

    // Toggle calendar on trigger click
    if (dateTrigger) {
        dateTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCalendar();
        });
    }

    // Close calendar when clicking outside
    document.addEventListener('click', (e) => {
        if (calPopup && !calPopup.contains(e.target) && e.target !== dateTrigger) {
            closeCalendar();
        }
    });

    /** Initialize date state for the modal (today pre-selected) */
    function initDatePicker() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate = getLocalDateStr(today);
        calViewDate = new Date(today);
        const [yr, mo, dy] = selectedDate.split('-').map(Number);
        const dObj = new Date(yr, mo - 1, dy);
        dateTriggerLabel.textContent = `${DAY_NAMES_LONG[dObj.getDay()]}, ${MONTH_SHORT[dObj.getMonth()]} ${dy}, ${yr}`;
        dateTrigger.classList.add('has-date');
        closeCalendar();
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

    /** Render the time slot grid — all slots are available */
    /** Convert total minutes to a 12-hour formatted object e.g. 330 → { time:"5:30", period:"AM" } */
    function fmtTime(totalMin) {
        const normalizedMin = totalMin % 1440;
        const h24 = Math.floor(normalizedMin / 60);
        const min = normalizedMin % 60;
        const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
        const mStr = min === 0 ? '00' : String(min).padStart(2, '0');
        const ampm = h24 < 12 ? 'AM' : 'PM';
        return { time: `${h12}:${mStr}`, period: ampm };
    }

    async function renderSlots() {
        slotGrid.innerHTML = '<div style="text-align:center; padding: 20px; color:var(--text-muted);">Loading slots...</div>';
        if (!selectedDate) return;

        let remoteBookedKeys = new Set();
        if (typeof db !== 'undefined') {
            try {
                const { data, error } = await db.from('bookings')
                    .select('start_time, duration')
                    .eq('sport', currentSport)
                    .eq('booking_date', selectedDate);

                if (!error && data) {
                    data.forEach(booking => {
                        const startMin = parseTimeStr(booking.start_time);
                        const dur = booking.duration || 30;
                        for (let m = 0; m < dur; m += 30) {
                            remoteBookedKeys.add(`${currentSport}-${selectedDate}-${startMin + m}`);
                        }
                    });
                }
            } catch (e) {
                console.error("Fetch bookings error:", e);
            }
        }

        // Fetch available timeslots from database or local fallback
        let activeTimeslots = [];
        try {
            if (typeof db !== 'undefined') {
                const { data, error } = await db.from('timeslots').select('slot_time, duration').order('slot_time', { ascending: true });
                if (!error && data && data.length > 0) {
                    activeTimeslots = data;
                }
            }
        } catch (e) {
            console.warn("Fetch active timeslots error:", e);
        }

        // Merge with localStorage mirror for immediate update review
        try {
            const localSlots = JSON.parse(localStorage.getItem('apex_timeslots_custom_duration') || '[]');
            if (localSlots.length > 0) {
                activeTimeslots = localSlots;
            }
        } catch (e) {
            console.warn("Failed loading local custom timeslots:", e);
        }

        // Fallback to default timeslots if none defined
        if (activeTimeslots.length === 0) {
            const defaults30 = [
                "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
                "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
                "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
                "09:00 PM", "09:30 PM", "10:00 PM"
            ].map(time => ({ slot_time: time, duration: 30 }));

            const defaults60 = [
                "05:00 AM", "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM",
                "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
                "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
            ].map(time => ({ slot_time: time, duration: 60 }));

            const defaults120 = [
                "05:00 AM", "07:00 AM", "09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM", "09:00 PM"
            ].map(time => ({ slot_time: time, duration: 120 }));

            activeTimeslots = [...defaults30, ...defaults60, ...defaults120];
        }

        // Filter active timeslots for CURRENT duration selection (30, 60, 120)
        const filteredTimeslots = activeTimeslots.filter(s => s.duration === currentDuration);

        // Sort timeslots chronologically
        filteredTimeslots.sort((a, b) => parseTimeStr(a.slot_time) - parseTimeStr(b.slot_time));

        slotGrid.innerHTML = '';

        filteredTimeslots.forEach(slotObj => {
            const slotTimeStr = slotObj.slot_time;
            const currentSlotStart = parseTimeStr(slotTimeStr);
            const slotEnd = currentSlotStart + currentDuration;
            const start = fmtTime(currentSlotStart);
            const end = fmtTime(slotEnd);

            const samePeriod = start.period === end.period;
            const rangeLabel = samePeriod
                ? `${start.time} - ${end.time} ${end.period}`
                : `${start.time} ${start.period} - ${end.time} ${end.period}`;

            let isBooked = false;
            for (let m = 0; m < currentDuration; m += 30) {
                const subKey = `${currentSport}-${selectedDate}-${currentSlotStart + m}`;
                if (remoteBookedKeys.has(subKey)) {
                    isBooked = true;
                    break;
                }
            }

            const tile = document.createElement('div');
            tile.className = 'slot-tile' + (isBooked ? ' slot-booked' : '');
            tile.dataset.startMin = currentSlotStart;
            tile.innerHTML = `
                <span class="slot-time">${start.time}</span>
                <span class="slot-range-sep">to</span>
                <span class="slot-time">${end.time}</span>
                <span class="slot-period">${end.period}</span>
            `;

            if (isBooked) {
                tile.style.opacity = '0.8';
                tile.style.cursor = 'not-allowed';
                tile.style.pointerEvents = 'none';
                tile.style.background = 'rgba(255, 77, 77, 0.15)';
                tile.style.border = '1px solid rgba(255, 77, 77, 0.4)';
                tile.style.color = '#ff4d4d';

                const sep = tile.querySelector('.slot-range-sep');
                if (sep) {
                    sep.textContent = 'Booked';
                    sep.style.color = '#ff4d4d';
                    sep.style.fontWeight = '600';
                    sep.style.fontSize = '0.75rem';
                    sep.style.textTransform = 'uppercase';
                    sep.style.letterSpacing = '1px';
                }
            } else {
                tile.addEventListener('click', () => {
                    document.querySelectorAll('.slot-tile.slot-selected').forEach(t => t.classList.remove('slot-selected'));
                    tile.classList.add('slot-selected');
                    selectedSlot = { startMin: currentSlotStart, label: rangeLabel };
                    openConfirmPopup();
                });
            }

            slotGrid.appendChild(tile);
        });
    }

    function showSummary() {
        if (!selectedSlot) return;
        slotSummary.style.display = 'flex';
        slotBookMsg.textContent = '';
        slotBookMsg.className = 'slot-book-msg';

        // Format date nicely
        const [yr, mo, dy] = selectedDate.split('-').map(Number);
        const dObj = new Date(yr, mo - 1, dy);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        summaryDate.textContent = `${dayNames[dObj.getDay()]}, ${monthNames[dObj.getMonth()]} ${dy}`;

        summaryTime.textContent = selectedSlot.label;
        const dStr = currentDuration === 30 ? '30 Minutes' : currentDuration === 60 ? '1 Hour' : '2 Hours';
        summaryDuration.textContent = dStr;
        summarySport.textContent = currentSport;
        if (summaryLocation) summaryLocation.textContent = currentLocation;
    }

    function hideSummary() {
        slotSummary.style.display = 'none';
    }

    /** Open the floating confirm popup when a slot tile is clicked */
    function openConfirmPopup() {
        console.log("openConfirmPopup called! selectedSlot:", selectedSlot, "confirmPopup:", confirmPopup);
        if (!selectedSlot) {
            console.warn("openConfirmPopup aborted: selectedSlot is falsy");
            return;
        }
        if (!confirmPopup) {
            console.warn("openConfirmPopup aborted: confirmPopup element is not found");
            return;
        }

        try {
            // Fill popup details
            const [yr, mo, dy] = selectedDate.split('-').map(Number);
            const dObj = new Date(yr, mo - 1, dy);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            if (scpSportIcon && slotSportIcon) {
                scpSportIcon.className = slotSportIcon.className;
            }
            if (scpSportName) scpSportName.textContent = currentSport;
            if (scpLocation) scpLocation.textContent = currentLocation;
            if (scpDate) scpDate.textContent = `${dayNames[dObj.getDay()]}, ${monthNames[dObj.getMonth()]} ${dy}`;
            if (scpTime) scpTime.textContent = selectedSlot.label;
            if (scpDuration) scpDuration.textContent = currentDuration === 30 ? '30 Minutes' : currentDuration === 60 ? '1 Hour' : '2 Hours';
            if (scpMsg) { scpMsg.textContent = ''; scpMsg.style.color = ''; }
            if (scpConfirmBtn) { scpConfirmBtn.disabled = false; scpConfirmBtn.innerHTML = 'Confirm Booking <i class="fas fa-check"></i>'; }

            confirmPopup.style.display = 'flex';
            console.log("confirmPopup display set to flex successfully!");
        } catch (e) {
            console.error("Error inside openConfirmPopup:", e);
        }
    }
    window.openConfirmPopup = openConfirmPopup;

    function closeConfirmPopup() {
        if (!confirmPopup) return;
        confirmPopup.style.display = 'none';
        // Deselect tile
        document.querySelectorAll('.slot-tile.slot-selected').forEach(t => t.classList.remove('slot-selected'));
        selectedSlot = null;
    }

    /** Open the modal for a specific sport */
    function openSlotModal(sportName, imgUrl, iconClass) {
        currentSport = sportName;
        selectedSlot = null;
        currentDuration = 30;
        currentLocation = 'Chennai';

        // Reset location toggle
        document.querySelectorAll('.slot-loc-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.location === 'Chennai');
        });
        if (summaryLocation) summaryLocation.textContent = 'Chennai';

        // Reset duration toggle
        document.querySelectorAll('.slot-dur-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.duration === '30');
        });

        // Set header
        slotModalHero.style.backgroundImage = `url('${imgUrl}')`;
        slotModalTitle.textContent = sportName;
        slotSportIcon.className = iconClass;
        summarySpIcon.className = iconClass;

        // Init date picker & slots
        initDatePicker();
        hideSummary();
        renderSlots();

        // Show modal
        slotModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    window.openSlotModal = openSlotModal;

    function closeModal() {
        slotModal.style.display = 'none';
        if (confirmPopup) confirmPopup.style.display = 'none';
        document.body.style.overflow = '';
        selectedSlot = null;
    }

    // Close button
    if (closeSlotModal) {
        closeSlotModal.addEventListener('click', closeModal);
    }

    // Close on overlay click
    slotModal.addEventListener('click', (e) => {
        if (e.target === slotModal) closeModal();
    });

    // Close confirm popup button
    if (scpClose) {
        scpClose.addEventListener('click', closeConfirmPopup);
    }

    // Close confirm popup on overlay click
    if (confirmPopup) {
        confirmPopup.addEventListener('click', (e) => {
            if (e.target === confirmPopup) closeConfirmPopup();
        });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (confirmPopup && confirmPopup.style.display !== 'none') {
                closeConfirmPopup();
            } else if (slotModal.style.display !== 'none') {
                closeModal();
            }
        }
    });

    // Location toggle
    if (slotLocToggle) {
        slotLocToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('.slot-loc-btn');
            if (!btn || btn.disabled) return;
            document.querySelectorAll('.slot-loc-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLocation = btn.dataset.location || currentLocation;
            if (summaryLocation) summaryLocation.textContent = currentLocation;
            selectedSlot = null;
            hideSummary();
            renderSlots();
        });
    }

    // Duration toggle
    if (slotDurToggle) {
        slotDurToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('.slot-dur-btn');
            if (!btn) return;
            document.querySelectorAll('.slot-dur-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDuration = parseInt(btn.dataset.duration, 10);
            selectedSlot = null;
            hideSummary();
            renderSlots();
        });
    }

    // Global helper to restore pending slot booking after sign in
    window.restorePendingBooking = function () {
        try {
            const pending = sessionStorage.getItem('pending_slot_booking');
            if (!pending) return false;
            const data = JSON.parse(pending);
            if (data && data.selectedSlot) {
                selectedSlot = data.selectedSlot;
                currentSport = data.currentSport || currentSport;
                currentLocation = data.currentLocation || currentLocation;
                currentDuration = data.currentDuration || currentDuration;
                selectedDate = data.selectedDate || selectedDate;

                openConfirmPopup();
                sessionStorage.removeItem('pending_slot_booking');
                return true;
            }
        } catch (e) {
            console.error('Error restoring pending booking:', e);
        }
        return false;
    };

    // Confirm booking from floating popup
    if (scpConfirmBtn) {
        scpConfirmBtn.addEventListener('click', async () => {
            if (!selectedSlot) return;
            scpConfirmBtn.disabled = true;
            scpConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

            // Check if user is logged in
            let session = null;
            try {
                const sessionRes = await db.auth.getSession();
                session = sessionRes?.data?.session;
            } catch (err) {
                console.error('Auth check error:', err);
            }

            if (!session) {
                // Save pending slot details so they survive auth flow
                sessionStorage.setItem('pending_slot_booking', JSON.stringify({
                    selectedSlot,
                    currentSport,
                    currentLocation,
                    currentDuration,
                    selectedDate
                }));

                if (confirmPopup) confirmPopup.style.display = 'none';

                const authModal = document.getElementById('auth-modal');
                if (authModal) {
                    authModal.style.display = 'flex';
                    const tabs = document.querySelectorAll('.auth-tab');
                    const tabSignin = document.getElementById('tab-signin');
                    const tabSignup = document.getElementById('tab-signup');
                    tabs.forEach(t => t.classList.remove('active'));
                    const signinTab = document.querySelector('.auth-tab[data-tab="signin"]');
                    if (signinTab) signinTab.classList.add('active');
                    if (tabSignin) tabSignin.style.display = 'block';
                    if (tabSignup) tabSignup.style.display = 'none';
                }

                scpConfirmBtn.innerHTML = 'Confirm Booking <i class="fas fa-check"></i>';
                scpConfirmBtn.disabled = false;
                return;
            }

            // Attempt database insert & local storage fallback
            let dbSuccess = false;
            let errorMsg = null;
            try {
                const st = fmtTime(selectedSlot.startMin);
                const et = fmtTime(selectedSlot.startMin + currentDuration);
                const payload = {
                    sport: currentSport,
                    location: currentLocation,
                    booking_date: selectedDate,
                    start_time: `${st.time} ${st.period}`,
                    end_time: `${et.time} ${et.period}`,
                    duration: currentDuration,
                    user_id: session.user.id,
                    user_email: session.user.email,
                    user_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                    created_at: new Date().toISOString()
                };

                const { error } = await db.from('bookings').insert([payload]);
                if (!error) {
                    dbSuccess = true;
                } else {
                    errorMsg = error.message;
                    console.warn('Supabase insert warning:', error.message);
                }

                // Local storage sync for instant offline and admin dashboard tracking
                try {
                    const localBookings = JSON.parse(localStorage.getItem('apex_elite_bookings_mock') || '[]');
                    localBookings.unshift({ ...payload, id: `local-book-${Date.now()}` });
                    localStorage.setItem('apex_elite_bookings_mock', JSON.stringify(localBookings));
                    dbSuccess = true;
                } catch (e) {
                    console.error('LocalStorage booking sync error:', e);
                }
            } catch (err) {
                errorMsg = err.message;
                console.warn('Booking exception:', err);
            }

            if (!dbSuccess) {
                scpMsg.className = 'slot-book-msg';
                scpMsg.style.color = '#ff4d4d';
                scpMsg.textContent = `❌ Booking failed: ${errorMsg || 'Database error'}`;
                scpConfirmBtn.innerHTML = 'Confirm Booking <i class="fas fa-check"></i>';
                scpConfirmBtn.disabled = false;
                return;
            }

            scpMsg.className = 'slot-book-msg';
            scpMsg.style.color = '#16A34A';
            scpMsg.textContent = `✅ Slot booked!`;
            scpConfirmBtn.innerHTML = 'Confirmed <i class="fas fa-check-double"></i>';
            scpConfirmBtn.disabled = true;

            // Re-render behind popup
            renderSlots();
            hideSummary();

            // Auto close after 2s
            setTimeout(() => {
                closeConfirmPopup();
                closeModal();
            }, 2000);
        });
    }

    // Confirm booking (old layout fallback - keep to prevent errors if elements used elsewhere)
    if (confirmSlotBtn) {
        confirmSlotBtn.addEventListener('click', async () => {
            if (!selectedSlot) return;
            confirmSlotBtn.disabled = true;
            confirmSlotBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

            // Check if user is logged in
            let session = null;
            try {
                const sessionRes = await db.auth.getSession();
                session = sessionRes?.data?.session;
            } catch (err) {
                console.error('Auth check error:', err);
            }

            if (!session) {
                const authModal = document.getElementById('auth-modal');
                if (authModal) {
                    authModal.style.display = 'flex';
                    const tabs = document.querySelectorAll('.auth-tab');
                    const tabSignin = document.getElementById('tab-signin');
                    const tabSignup = document.getElementById('tab-signup');
                    tabs.forEach(t => t.classList.remove('active'));
                    const signinTab = document.querySelector('.auth-tab[data-tab="signin"]');
                    if (signinTab) signinTab.classList.add('active');
                    if (tabSignin) tabSignin.style.display = 'block';
                    if (tabSignup) tabSignup.style.display = 'none';
                }

                slotBookMsg.className = 'slot-book-msg';
                slotBookMsg.style.color = '#ff4d4d';
                slotBookMsg.textContent = '🔒 Please Sign In to book a slot!';
                confirmSlotBtn.innerHTML = 'Confirm Booking <i class="fas fa-check"></i>';
                confirmSlotBtn.disabled = false;
                return;
            }

            // Attempt database insert
            let dbSuccess = false;
            let errorMsg = null;
            try {
                const st = fmtTime(selectedSlot.startMin);
                const et = fmtTime(selectedSlot.startMin + currentDuration);
                const payload = {
                    sport: currentSport,
                    location: currentLocation,
                    booking_date: selectedDate,
                    start_time: `${st.time} ${st.period}`,
                    end_time: `${et.time} ${et.period}`,
                    duration: currentDuration,
                    user_id: session.user.id,
                    user_email: session.user.email,
                    user_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
                };
                const { error } = await db.from('bookings').insert([payload]);
                if (!error) {
                    dbSuccess = true;
                } else {
                    errorMsg = error.message;
                    console.warn('Supabase insert failed:', error.message);
                }
            } catch (err) {
                errorMsg = err.message;
                console.warn('Supabase booking insert skipped:', err);
            }

            if (!dbSuccess) {
                slotBookMsg.className = 'slot-book-msg';
                slotBookMsg.style.color = '#ff4d4d';
                slotBookMsg.textContent = `❌ Booking failed: ${errorMsg || 'Database error'}`;
                confirmSlotBtn.innerHTML = 'Confirm Booking <i class="fas fa-check"></i>';
                confirmSlotBtn.disabled = false;
                return;
            }

            slotBookMsg.className = 'slot-book-msg';
            slotBookMsg.style.color = '#ccff00';
            slotBookMsg.textContent = `✅ Slot booked! ${currentSport} on ${summaryDate.textContent} at ${selectedSlot.label}`;
            confirmSlotBtn.innerHTML = 'Confirm Booking <i class="fas fa-check"></i>';
            confirmSlotBtn.disabled = false;

            selectedSlot = null;
            renderSlots();
            hideSummary();

            // Auto close after 2.5s
            setTimeout(() => {
                closeModal();
                slotBookMsg.textContent = '';
            }, 2500);
        });
    }

    // Initialize facilities carousel
    initFacilitiesCarousel();

    // Wire up all .open-slots buttons (new layout universal trigger)
    document.body.addEventListener('click', (e) => {
        const openBtn = e.target.closest('.open-slots');
        if (openBtn) {
            e.preventDefault();
            // Check if button has data-sport attribute for specific sport
            const sportData = openBtn.dataset.sport || 'Badminton';
            const sportIconMap = {
                'Football': { icon: 'fas fa-futbol', img: 'assets/football_action.png' },
                'Cricket': { icon: 'fas fa-baseball-ball', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80' },
                'Basketball': { icon: 'fas fa-basketball-ball', img: 'assets/basketball_action.png' },
                'Badminton': { icon: 'fas fa-feather', img: 'assets/about_training.png' },
                'Volleyball': { icon: 'fas fa-volleyball-ball', img: 'assets/hero_volleyball.png' }
            };
            const { icon, img } = sportIconMap[sportData] || sportIconMap['Badminton'];
            openSlotModal(sportData, img, icon);
        }

        // Legacy hero explore button support
        if (e.target.closest('.btn-hero-explore')) {
            e.preventDefault();
            const target = document.querySelector('#facilities');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Initialize facility category filters
    initFacilityFilters();

    // Load and initialize player reviews dynamically
    loadAndInitReviews();

    // Star Rating selection logic
    const starRatingInput = document.getElementById('star-rating-input');
    const ratingValueInput = document.getElementById('review-rating-value');
    let selectedRating = 0;

    if (starRatingInput && ratingValueInput) {
        const stars = starRatingInput.querySelectorAll('i');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating, 10);
                ratingValueInput.value = selectedRating;
                updateStarsDisplay(selectedRating);
            });

            star.addEventListener('mouseenter', () => {
                const hoverRating = parseInt(star.dataset.rating, 10);
                updateStarsDisplay(hoverRating, true);
            });
        });

        starRatingInput.addEventListener('mouseleave', () => {
            updateStarsDisplay(selectedRating);
        });

        function updateStarsDisplay(rating, isHover = false) {
            stars.forEach(s => {
                const r = parseInt(s.dataset.rating, 10);
                if (r <= rating) {
                    s.style.color = isHover ? '#15803D' : '#16A34A';
                    s.style.transform = 'scale(1.15)';
                } else {
                    s.style.color = '#CBD5E1';
                    s.style.transform = 'scale(1)';
                }
            });
        }
    }

    // Review form submission
    const reviewForm = document.getElementById('review-form');
    const reviewModal = document.getElementById('review-modal');
    const closeReviewBtn = document.getElementById('close-review-modal');
    const openReviewBtn = document.getElementById('open-review-btn') || document.getElementById('open-review-modal');
    const reviewMsg = document.getElementById('review-msg');

    function openReviewModalFn() {
        if (!reviewModal) return;
        reviewModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (reviewForm) reviewForm.reset();
        selectedRating = 0;
        if (ratingValueInput) ratingValueInput.value = '';
        if (reviewMsg) reviewMsg.textContent = '';
        if (starRatingInput) {
            starRatingInput.querySelectorAll('i').forEach(s => {
                s.style.color = '#CBD5E1';
                s.style.transform = 'scale(1)';
            });
        }
    }

    if (openReviewBtn && reviewModal) {
        openReviewBtn.addEventListener('click', openReviewModalFn);
    }

    // Also wire up #open-review-modal as an alias
    const openReviewModalBtn2 = document.getElementById('open-review-modal');
    if (openReviewModalBtn2 && openReviewModalBtn2 !== openReviewBtn) {
        openReviewModalBtn2.addEventListener('click', openReviewModalFn);
    }

    if (closeReviewBtn && reviewModal) {
        closeReviewBtn.addEventListener('click', () => {
            reviewModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    if (reviewModal) {
        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                reviewModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('review-submit-btn');
            if (!selectedRating) {
                if (reviewMsg) {
                    reviewMsg.textContent = '❌ Please select a rating (stars).';
                    reviewMsg.style.color = '#ff4d4d';
                }
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            const payload = {
                name: document.getElementById('review-name').value.trim(),
                sport: document.getElementById('review-sport').value,
                rating: selectedRating,
                review_text: document.getElementById('review-text').value.trim(),
                approved: false,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            let success = false;
            let errorMsg = '';

            // 1. Try saving to Supabase
            try {
                if (typeof db !== 'undefined') {
                    const { error } = await db.from('reviews').insert([payload]);
                    if (!error) {
                        success = true;
                    } else {
                        errorMsg = error.message;
                    }
                }
            } catch (err) {
                console.warn('Supabase review insert failed:', err.message);
                errorMsg = err.message;
            }

            // 2. Save locally to localStorage (so author immediately sees it pending approval)
            try {
                const localReviews = JSON.parse(localStorage.getItem('apex_reviews_custom') || '[]');
                localReviews.unshift({ ...payload, id: `local-${Date.now()}` });
                localStorage.setItem('apex_reviews_custom', JSON.stringify(localReviews));
                success = true; // Mark success if we saved it locally
            } catch (e) {
                console.error('LocalStorage save for review failed:', e);
            }

            if (success) {
                if (reviewMsg) {
                    reviewMsg.textContent = '🎉 Thank you! Review submitted and pending admin approval.';
                    reviewMsg.style.color = 'var(--accent-color)';
                }
                reviewForm.reset();
                // Reload and re-init reviews
                setTimeout(async () => {
                    reviewModal.style.display = 'none';
                    document.body.style.overflow = '';
                    await loadAndInitReviews();
                }, 2000);
            } else {
                if (reviewMsg) {
                    reviewMsg.textContent = `❌ Submission failed: ${errorMsg || 'Database error'}`;
                    reviewMsg.style.color = '#ff4d4d';
                }
            }

            btn.disabled = false;
            btn.innerHTML = 'Submit Review <i class="fas fa-paper-plane"></i>';
        });
    }

    // Load admin uploaded gallery images after initialization
    loadAdminGallery();
});

// ══════════════════════════════════════════════════════════════════════════════
//  DYNAMIC GALLERY LOADER (from Admin uploads & Fallsbacks)
// ══════════════════════════════════════════════════════════════════════════════

async function loadAdminGallery() {
    // Support both old .gallery-grid and new .gallery-row-grid
    const galleryGrids = document.querySelectorAll('.gallery-grid, .gallery-row-grid');
    if (galleryGrids.length === 0) return;

    // Define curated default high-res fallback sports images
    const defaultImages = [
        { id: 'def-1', image_url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', caption: 'Intense Tournament Match', category: 'Basketball' },
        { id: 'def-2', image_url: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', caption: 'Evening Tactical Match', category: 'Football' },
        { id: 'def-3', image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', caption: 'Polyurethane Sprint Drills', category: 'Athletics' },
        { id: 'def-4', image_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', caption: 'Badminton Warmup Championship', category: 'Badminton' },
        { id: 'def-5', image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', caption: 'FIFA-Grade Synthetic Play', category: 'Football' },
        { id: 'def-6', image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', caption: 'Hardwood Shootout Action', category: 'Basketball' }
    ];

    let customImages = [];

    // ── Try Supabase first (if available and table exists) ─────────────────
    try {
        if (typeof db !== 'undefined') {
            const { data, error } = await db
                .from('gallery_images')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
                customImages = data;
            }
        }
    } catch (err) {
        console.warn('Gallery: Supabase not available, using localStorage fallback.', err.message);
    }

    // ── Always merge with localStorage (works same-origin: admin ↔ public) ─
    try {
        const localImages = JSON.parse(localStorage.getItem('apex_gallery_images') || '[]');
        if (localImages.length > 0) {
            // Merge: avoid duplicates
            const customIds = new Set(customImages.map(img => img.id));
            const localOnly = localImages.filter(img => !customIds.has(img.id));
            customImages = [...customImages, ...localOnly];
        }
    } catch (e) { /* ignore */ }

    // Merge custom images with fallback images (custom uploads first, filled with fallbacks to have at least 6)
    let finalImages = [...customImages];
    if (finalImages.length < 6) {
        const presentUrls = new Set(finalImages.map(img => img.image_url));
        for (const defImg of defaultImages) {
            if (!presentUrls.has(defImg.image_url)) {
                finalImages.push(defImg);
                if (finalImages.length >= 6) break;
            }
        }
    }

    // Clear all gallery grids and populate each with dynamic items
    galleryGrids.forEach((grid) => {
        grid.innerHTML = '';

        finalImages.forEach((img) => {
            if (!img.image_url) return;

            const item = document.createElement('div');
            item.className = 'gallery-item';

            const imgEl = document.createElement('img');
            imgEl.src = img.image_url;
            imgEl.alt = img.caption || 'Gallery Image';
            imgEl.loading = 'lazy';
            imgEl.onerror = function () {
                item.style.display = 'none';
            };

            // Caption overlay
            const overlay = document.createElement('div');
            overlay.className = 'gallery-item-overlay';
            overlay.innerHTML = `
                <h3>${escapeHTMLGallery(img.caption)}</h3>
                <span class="gallery-badge">${escapeHTMLGallery(img.category || 'General')}</span>
            `;

            item.appendChild(imgEl);
            item.appendChild(overlay);

            // Attach click event for premium lightbox
            item.addEventListener('click', () => openGalleryLightbox(img));

            grid.appendChild(item);
        });
    });

    // Fade-in animation for marquee container using GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.from('.gallery-marquee-container', {
            scrollTrigger: {
                trigger: '.gallery-marquee-container',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 1.0,
            ease: 'power3.out'
        });
    }
}

// ── Premium glassmorphic lightbox for gallery images ───────────────────────

function openGalleryLightbox(img) {
    const existing = document.getElementById('gallery-lightbox');
    if (existing) existing.remove();

    const lb = document.createElement('div');
    lb.id = 'gallery-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');

    lb.innerHTML = `
        <div class="lightbox-content-wrapper">
            <button id="lb-close" class="lightbox-close-btn" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            <img class="lightbox-image" src="${escapeHTMLGallery(img.image_url)}" alt="${escapeHTMLGallery(img.caption)}">
            <div class="lightbox-caption-box">
                <p>${escapeHTMLGallery(img.caption)}</p>
                <span class="gallery-badge">${escapeHTMLGallery(img.category || 'General')}</span>
            </div>
        </div>
    `;

    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';

    lb.addEventListener('click', (e) => {
        if (e.target === lb || e.target.id === 'lb-close' || e.target.closest('#lb-close')) {
            lb.remove();
            document.body.style.overflow = '';
        }
    });

    // Close on escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            lb.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function escapeHTMLGallery(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ── Facility category filters with smooth GSAP animations ───────────────────

function initFacilityFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.fac-card');
    const carouselContainer = document.getElementById('fac-carousel');
    if (!filterButtons.length || !cards.length) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');

            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const cardsToHide = [];
            const cardsToShow = [];

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    cardsToShow.push(card);
                } else {
                    cardsToHide.push(card);
                }
            });

            if (typeof gsap !== 'undefined') {
                if (cardsToHide.length) {
                    gsap.to(cardsToHide, {
                        opacity: 0,
                        scale: 0.8,
                        y: 15,
                        duration: 0.3,
                        stagger: 0.04,
                        ease: 'power2.in',
                        onComplete: () => {
                            cardsToHide.forEach(c => {
                                c.style.display = 'none';
                                c.classList.add('hidden');
                            });
                            showFilteredCards(cardsToShow);
                        }
                    });
                } else {
                    showFilteredCards(cardsToShow);
                }
            } else {
                cardsToHide.forEach(c => {
                    c.style.display = 'none';
                    c.classList.add('hidden');
                });
                cardsToShow.forEach(c => {
                    c.style.display = 'block';
                    c.classList.remove('hidden');
                    c.style.opacity = '1';
                    c.style.transform = 'none';
                });
            }
        });
    });

    function showFilteredCards(cardsToShow) {
        cardsToShow.forEach(c => {
            c.style.display = 'block';
            c.classList.remove('hidden');
        });

        // Set the first visible card as active
        if (cardsToShow.length) {
            const allCards = document.querySelectorAll('.fac-card');
            allCards.forEach(c => c.classList.remove('active'));
            cardsToShow[0].classList.add('active');

            // Scroll carousel back to start
            if (carouselContainer) {
                carouselContainer.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }

        gsap.fromTo(cardsToShow,
            { opacity: 0, scale: 0.8, y: 20 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: 'back.out(1.15)',
                clearProps: 'transform,opacity'
            }
        );
    }
}

// ── Sagi-style Facilities Carousel ──────────────────────────────────────────

function initFacilitiesCarousel() {
    const cards = document.querySelectorAll('.fac-card');
    const carouselContainer = document.getElementById('fac-carousel');
    const prevBtn = document.getElementById('fac-prev');
    const nextBtn = document.getElementById('fac-next');

    if (!carouselContainer || !cards.length) return;

    // 3D Tilt Effect on mouse movement
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const normalizedX = (x / rect.width) - 0.5;
            const normalizedY = (y / rect.height) - 0.5;

            const tiltY = (normalizedX * 15).toFixed(2);
            const tiltX = (normalizedY * -15).toFixed(2);

            card.style.transform = `perspective(1000px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) scale3d(1.04, 1.04, 1.04) translateY(-8px)`;

            const shine = card.querySelector('.fac-glass-shine');
            if (shine) {
                shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            const shine = card.querySelector('.fac-glass-shine');
            if (shine) {
                shine.style.background = '';
            }
        });
    });

    // Calculate scroll step based on card size
    const getScrollAmount = () => {
        const firstCard = cards[0];
        return firstCard ? firstCard.clientWidth + 30 : 310;
    };

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({
                left: -getScrollAmount(),
                behavior: 'smooth'
            });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({
                left: getScrollAmount(),
                behavior: 'smooth'
            });
        });
    }

    // Card click: make active and scroll to center
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.fac-book-btn') || e.target.closest('.fac-soon-badge')) {
                return;
            }

            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const offsetLeft = card.offsetLeft;
            const centerOffset = (carouselContainer.clientWidth / 2) - (card.clientWidth / 2);
            carouselContainer.scrollTo({
                left: offsetLeft - centerOffset,
                behavior: 'smooth'
            });
        });
    });

    // Wire up booking click
    cards.forEach(card => {
        const bookBtn = card.querySelector('.fac-book-btn');
        if (!bookBtn) return;

        bookBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const sport = card.dataset.sport || 'Sport';
            const img = card.dataset.img || '';
            const icon = card.dataset.icon || 'fas fa-star';
            window.openSlotModal(sport, img, icon);
        });
    });
}

// ══════════════════════════════════════════════════════════════════════════════
//  TESTIMONIAL CAROUSEL
// ══════════════════════════════════════════════════════════════════════════════

function initTestimonialCarousel() {
    const track = document.getElementById('testimonial-track');
    const slides = track ? Array.from(track.querySelectorAll('.testimonial-slide')) : [];
    const prevBtn = document.getElementById('tc-prev');
    const nextBtn = document.getElementById('tc-next');
    const dots = Array.from(document.querySelectorAll('.tc-dot'));
    const wrapper = document.querySelector('.testimonial-carousel-wrapper');
    const navContainer = document.querySelector('.tc-nav-container');

    if (!track || slides.length === 0 || !wrapper) return;

    let current = 0;
    let autoplayTimer = null;
    const AUTOPLAY_MS = 4500;
    const GAP_PX = 24;    // visual gap between cards (matches slide padding*2)

    // ─── How many cards to show at once ───────────────────────────
    function getSPV() {
        return window.innerWidth <= 860 ? 1 : 2;
    }

    // ─── Set each slide's explicit pixel width based on wrapper ───
    function setSlideSizes() {
        const spv = getSPV();
        const wrapperW = wrapper.clientWidth;
        // Each slide = (wrapperWidth - totalGaps) / slidesPerView
        const totalGaps = GAP_PX * (spv - 1);
        const slideW = (wrapperW - totalGaps) / spv;

        slides.forEach(slide => {
            slide.style.width = slideW + 'px';
            slide.style.padding = '0';   // remove padding-based gap approach
        });

        // Also set the gap on the track itself
        track.style.gap = GAP_PX + 'px';

        return slideW;
    }

    // ─── Max scrollable positions ──────────────────────────────────
    function totalPositions() {
        return Math.max(0, slides.length - getSPV());
    }

    // ─── Navigate to a specific index ─────────────────────────────
    function goTo(index, animate = true) {
        const max = totalPositions();
        current = Math.max(0, Math.min(index, max));

        // Re-measure slide width (may have changed on resize)
        const slideW = slides[0] ? slides[0].offsetWidth : 0;
        const offset = current * (slideW + GAP_PX);

        if (animate && typeof gsap !== 'undefined') {
            gsap.to(track, { x: -offset, duration: 0.55, ease: 'power3.out' });
        } else {
            gsap.set(track, { x: -offset });
        }

        // Sync dots
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));

        // Arrow states
        if (prevBtn) prevBtn.disabled = (current === 0);
        if (nextBtn) nextBtn.disabled = (current >= totalPositions());
    }

    function next() {
        goTo(current >= totalPositions() ? 0 : current + 1);
    }

    function prev() {
        goTo(current <= 0 ? totalPositions() : current - 1);
    }

    // ─── Arrow listeners ───────────────────────────────────────────
    if (prevBtn) prevBtn.addEventListener('click', () => { resetAutoplay(); prev(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { resetAutoplay(); next(); });

    // ─── Dot listeners ─────────────────────────────────────────────
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            resetAutoplay();
            goTo(parseInt(dot.dataset.index, 10));
        });
    });

    // ─── Keyboard ──────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
        if (!navContainer) return;
        const rect = navContainer.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inViewport) return;
        if (e.key === 'ArrowRight') { resetAutoplay(); next(); }
        if (e.key === 'ArrowLeft') { resetAutoplay(); prev(); }
    });

    // ─── Touch / swipe ─────────────────────────────────────────────
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
        const delta = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) { resetAutoplay(); delta > 0 ? next() : prev(); }
    }, { passive: true });

    // ─── Autoplay ──────────────────────────────────────────────────
    function startAutoplay() { autoplayTimer = setInterval(next, AUTOPLAY_MS); }
    function stopAutoplay() { clearInterval(autoplayTimer); }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    // Pause on hover
    if (navContainer) {
        navContainer.addEventListener('mouseenter', stopAutoplay);
        navContainer.addEventListener('mouseleave', startAutoplay);
    }

    // ─── Resize handler ────────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setSlideSizes();
            goTo(current, false);
        }, 120);
    });

    // ─── Init ──────────────────────────────────────────────────────
    setSlideSizes();
    goTo(0, false);
    startAutoplay();
}

// ══════════════════════════════════════════════════════════════════════════════
//  DYNAMIC TESTIMONIAL LOADER
// ══════════════════════════════════════════════════════════════════════════════

async function loadAndInitReviews() {
    const track = document.getElementById('testimonial-track') || document.getElementById('reviews-container');
    const dotsContainer = document.getElementById('tc-dots');
    if (!track) return;

    // Default static fallback reviews
    const defaultReviews = [
        {
            name: "Rahul Sharma",
            sport: "⚽ Football",
            rating: 5,
            review_text: "The synthetic turf quality is absolutely world-class! The lighting for late-night 5v5 matches is crisp and glare-free. Booking slots takes less than 30 seconds.",
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
        },
        {
            name: "Ananya Roy",
            sport: "🏏 Cricket",
            rating: 5,
            review_text: "We hosted our corporate cricket cup at ApexElite. The net facilities, parking, and cafeteria service were top notch. Highly recommended!",
            avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
        },
        {
            name: "Vikram Seth",
            sport: "🏸 Badminton",
            rating: 5,
            review_text: "Best badminton courts in town! Smooth wooden floor, high ceiling, and clean changing rooms with warm showers.",
            avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
        }
    ];

    let customReviews = [];

    // 1. Try fetching approved reviews from Supabase
    try {
        if (typeof db !== 'undefined') {
            const { data, error } = await db
                .from('reviews')
                .select('*')
                .or('status.eq.approved,status.eq.Approved,status.eq.APPROVED,approved.eq.true')
                .order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
                customReviews = data;
            }
        }
    } catch (err) {
        console.warn('Reviews: Supabase fetch error:', err.message);
    }

    // 2. Fetch locally approved or user-submitted reviews
    try {
        const localReviews = JSON.parse(localStorage.getItem('apex_reviews_custom') || '[]');
        if (localReviews.length > 0) {
            const dbTexts = new Set(customReviews.map(r => (r.review_text || r.text || '').trim()));
            const localOnly = localReviews.filter(r => {
                const text = (r.review_text || r.text || '').trim();
                const isApproved = r.approved === true || (r.status && r.status.toLowerCase() === 'approved');
                return text && !dbTexts.has(text) && isApproved;
            });
            customReviews = [...customReviews, ...localOnly];
        }
    } catch (e) {
        console.warn('Failed to load local reviews from localStorage:', e);
    }

    // 3. Combine custom reviews with default reviews
    let finalReviews = [...customReviews];
    if (finalReviews.length < 3) {
        for (const def of defaultReviews) {
            const defText = def.review_text.trim();
            if (!finalReviews.some(r => (r.review_text || r.text || '').trim() === defText)) {
                finalReviews.push(def);
            }
            if (finalReviews.length >= 3) break;
        }
    }

    // 4. Render cards
    track.innerHTML = '';
    finalReviews.forEach(r => {
        const name = r.user_name || r.name || r.author_name || 'Anonymous Player';
        const text = r.review_text || r.text || '';
        const sport = r.sport || 'Sports';
        const rating = r.rating || 5;
        const avatar = r.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';

        if (track.classList.contains('testimonials-grid') || track.id === 'reviews-container') {
            const card = document.createElement('div');
            card.className = 'testimonial-card white-card';
            card.innerHTML = `
                <div class="t-rating">${'★'.repeat(Math.min(5, Math.max(1, Math.round(rating))))}</div>
                <p class="t-text">"${escapeHTMLReview(text)}"</p>
                <div class="t-author">
                    <img src="${avatar}" alt="${escapeHTMLReview(name)}" class="t-avatar">
                    <div>
                        <h4 class="t-name">${escapeHTMLReview(name)}</h4>
                        <span class="t-role">${escapeHTMLReview(sport)}</span>
                    </div>
                </div>
            `;
            track.appendChild(card);
        } else {
            const slide = document.createElement('div');
            slide.className = 'testimonial-slide';

            const fullStars = Math.floor(rating);
            const hasHalf = rating % 1 !== 0;
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) {
                    starsHTML += '<i class="fas fa-star"></i>';
                } else if (i === fullStars + 1 && hasHalf) {
                    starsHTML += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    starsHTML += '<i class="far fa-star"></i>';
                }
            }

            slide.innerHTML = `
                <div class="testimonial-card glass">
                    <div class="tc-quote-icon"><i class="fas fa-quote-left"></i></div>
                    <div class="tc-stars">
                        ${starsHTML}
                        <span class="tc-rating-label">${Number(rating).toFixed(1)}</span>
                    </div>
                    <p class="review-text">"${escapeHTMLReview(text)}"</p>
                    <div class="reviewer">
                        <div class="reviewer-info">
                            <h4>${escapeHTMLReview(name)}</h4>
                            <p>${r.approved === false ? '⏳ Pending Approval' : 'Regular Player'}</p>
                        </div>
                        <span class="tc-sport-badge">${escapeHTMLReview(sport)}</span>
                    </div>
                </div>
            `;
            track.appendChild(slide);
        }
    });

    // 5. Render dots dynamically
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        const spv = window.innerWidth <= 860 ? 1 : 2;
        const totalDots = Math.max(1, finalReviews.length - spv + 1);
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.className = i === 0 ? 'tc-dot active' : 'tc-dot';
            dot.setAttribute('data-index', i);
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dotsContainer.appendChild(dot);
        }
    }

    // 6. Initialize Carousel
    initTestimonialCarousel();
}

function escapeHTMLReview(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ══════════════════════════════════════════════════════════════════════════════
//  MOUSE TILT EFFECT & FORM HANDLERS
// ══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // ── 0. Festive Offer Banner Loader ─────────────────────────────────────────
    (async function applyFestiveOfferSettings() {
        const LS_KEY = 'apex_festive_offer';
        const DB_KEY = 'festive_offer';
        const bar = document.getElementById('top-festive-bar');
        const nav = document.querySelector('.nav-wrapper');
        if (!bar) return;

        function showBanner(s) {
            const textEl = bar.querySelector('.festive-text');
            const ctaEl = bar.querySelector('.festive-cta-btn');
            if (textEl) textEl.innerHTML = `${s.message} Use Code: <span class="festive-code">${s.code}</span>`;
            if (ctaEl) ctaEl.innerHTML = `${s.cta} <i class="fas fa-bolt"></i>`;
            bar.classList.remove('hidden');
            if (nav) nav.classList.add('with-festive-bar');
        }

        function hideBanner() {
            bar.classList.add('hidden');
            if (nav) nav.classList.remove('with-festive-bar');
        }

        // 1. First apply localStorage immediately for zero delay
        try {
            const lsSettings = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
            if (lsSettings && lsSettings.enabled) {
                showBanner(lsSettings);
            }
        } catch (e) { }

        // 2. Fetch ground truth from Supabase
        try {
            const sbUrl = 'https://ytzekcukwvpjggvtmmqt.supabase.co';
            const sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0emVrY3Vrd3ZwamdndnRtbXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTE1MTQsImV4cCI6MjA5NzM4NzUxNH0.4KqsaI_hq8b8gcO8SXpenx2_OsBK-2s1jibuY8ZEIq4';
            const res = await fetch(
                `${sbUrl}/rest/v1/site_settings?key=eq.${DB_KEY}&select=value`,
                { headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` } }
            );
            if (res.ok) {
                const rows = await res.json();
                if (rows && rows.length > 0 && rows[0].value) {
                    const settings = rows[0].value;
                    localStorage.setItem(LS_KEY, JSON.stringify(settings));
                    if (settings.enabled) {
                        showBanner(settings);
                    } else {
                        hideBanner();
                    }
                }
            }
        } catch (e) {
            console.warn('[FestiveOffer] Supabase fetch error:', e);
        }

        const closeBtn = document.getElementById('close-festive-bar');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                hideBanner();
            });
        }
    })();


    // 1. 3D Mouse Tilt effect on cards
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            card.style.transform = `perspective(1000px) rotateX(${-y / 20}deg) rotateY(${x / 20}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // 2. Inline Registration & VIP Subscription Form handled in supabase-client.js

    // 4. Close Festive Offer Bar
    const closeFestiveBtn = document.getElementById('close-festive-bar');
    const festiveBar = document.getElementById('top-festive-bar');
    const navWrapper = document.querySelector('.nav-wrapper');

    if (closeFestiveBtn && festiveBar) {
        closeFestiveBtn.addEventListener('click', () => {
            festiveBar.classList.add('hidden');
            if (navWrapper) {
                navWrapper.classList.remove('with-festive-bar');
            }
        });
    }

    // Mobile Hamburger Menu Toggle
    const hamburgerBtn = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            const icon = hamburgerBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close drawer when clicking any link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = hamburgerBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });

        // Close drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = hamburgerBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // Check if there is a pending slot booking from before sign in
    setTimeout(() => {
        if (typeof window.restorePendingBooking === 'function') {
            window.restorePendingBooking();
        }
    }, 500);
});


