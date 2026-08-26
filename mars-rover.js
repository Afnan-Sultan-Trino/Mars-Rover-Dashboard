// ===== NAV: SCROLLED STATE =====
const siteNav = document.getElementById('siteNav');
const onScroll = () => {
    siteNav.classList.toggle('scrolled', window.scrollY > 20);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== NAV: MOBILE TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// ===== NAV: ACTIVE LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navAnchors.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

sections.forEach(section => sectionObserver.observe(section));

// ===== SCROLL REVEAL =====
const revealTargets = document.querySelectorAll(
    '.pillar-card, .unit-card, .timeline-item, .clipping, .achievement-pill, .faculty-card'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

revealTargets.forEach(el => revealObserver.observe(el));

// ===== COLLAPSIBLE TEAM CARDS =====
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtns = document.querySelectorAll('.unit-card .toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.unit-card');
            if (!card) return;
            const isOpen = card.classList.toggle('open');
            this.setAttribute('aria-expanded', isOpen);
        });
    });
});