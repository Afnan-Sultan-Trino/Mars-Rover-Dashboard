// ===== NAVIGATION: SMOOTH SCROLL FOR INTERNAL LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== STATUS BADGE PULSE ANIMATION =====
const statusBadge = document.querySelector('.status-badge');
if (statusBadge) {
    setInterval(() => {
        statusBadge.style.opacity = statusBadge.style.opacity === '0.6' ? '1' : '0.6';
    }, 1000);
}

// ===== PROGRESS BARS ANIMATION ON SCROLL =====
const progressFills = document.querySelectorAll('.progress-fill');

const animateProgress = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const fill = entry.target;
            const width = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = width;
            }, 200);
        }
    });
};

const observer = new IntersectionObserver(animateProgress, { threshold: 0.3 });
progressFills.forEach(fill => observer.observe(fill));

// ===== DYNAMIC DATE UPDATE =====
const updateElement = document.querySelector('.status-update');
if (updateElement) {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    updateElement.innerHTML = `● Last updated: ${formattedDate} — All systems nominal`;
}