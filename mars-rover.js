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

// ===== PRESS CAROUSEL =====
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsWrap = document.getElementById('carouselDots');

if (track) {
    const slides = Array.from(track.children);

    const getPerView = () => {
        const w = window.innerWidth;
        if (w <= 820) return 1;
        if (w <= 1024) return 2;
        return 3;
    };

    let perView = getPerView();
    let pageCount = Math.max(1, slides.length - perView + 1);
    let index = 0;

    const buildDots = () => {
        dotsWrap.innerHTML = '';
        for (let i = 0; i < pageCount; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === index ? ' active' : '');
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        }
    };

    const update = () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = 16;
        track.style.transform = `translateX(-${index * (slideWidth + gap)}px)`;
        Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === index));
    };

    const goTo = (i) => {
        index = Math.max(0, Math.min(i, pageCount - 1));
        update();
    };

    prevBtn.addEventListener('click', () => goTo(index - 1 < 0 ? pageCount - 1 : index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1 >= pageCount ? 0 : index + 1));

    let autoplay = setInterval(() => goTo(index + 1 >= pageCount ? 0 : index + 1), 5000);
    [prevBtn, nextBtn, track].forEach(el => {
        el.addEventListener('mouseenter', () => clearInterval(autoplay));
        el.addEventListener('mouseleave', () => {
            autoplay = setInterval(() => goTo(index + 1 >= pageCount ? 0 : index + 1), 5000);
        });
    });

    window.addEventListener('resize', () => {
        perView = getPerView();
        pageCount = Math.max(1, slides.length - perView + 1);
        index = Math.min(index, pageCount - 1);
        buildDots();
        update();
    });

    buildDots();
    update();
}
