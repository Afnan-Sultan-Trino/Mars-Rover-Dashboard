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
    '.pillar-card, .team-node, .leader-node, .timeline-item, .clipping, .achievement-pill, .faculty-card'
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

// ============================================================
// TEAM MODAL LOGIC 
// ============================================================

const teamData = {
    software: {
        title: 'Software Team',
        leader: { name: 'Muksitul Ziad', img: 'Muksit.jpeg' },
        members: [
            { name: 'Abdullah Nahian', img: 'NAHIYAN.jpeg' },
            { name: 'Farhan Sadik', img: 'Fahim.jpeg' },
            { name: 'Afnan Sultan Trino', img: 'Trino.jpeg' }
        ]
    },
    electrical: {
        title: 'Electrical Team',
        leader: { name: 'Abul Bashar Sad', img: 'SAD.jpeg' },
        members: [
            { name: 'Simran Hossain', img: 'Simran.jpeg' },
            { name: 'Khandakar Omit', img: 'AMIT.webp' }
        ]
    },
    mechanical: {
        title: 'Mechanical Team',
        leader: { name: 'Sabbir Hasan', img: 'Sabbir.jpg' },
        members: [] // Empty array -> No "Coming Soon" text will show
    },
    science: {
        title: 'Science Team',
        leader: { name: 'Md. Arifullah', img: 'ARIF.jpg' }, // Fixed .HEIC to .jpg
        members: [
            { name: 'Aurthy Sarker', img: 'AURTHY.jpeg' },
            { name: 'Aha-raf-e Islam Ridita', img: 'Ridita.jpeg' },
            { name: 'Mudabbiur Rahman Suhad', img: 'Suhad.png' }
        ]
    }
};

const modal = document.getElementById('teamModal');
const closeModalBtn = document.getElementById('closeModal');
const modalTeamName = document.getElementById('modalTeamName');
const modalLeaderName = document.getElementById('modalLeaderName');
const modalLeaderAvatar = document.getElementById('modalLeaderAvatar');
const modalMemberGrid = document.getElementById('modalMemberGrid');
const orbitRing = document.querySelector('.orbit-ring');

function openTeamModal(teamKey) {
    const data = teamData[teamKey];
    if (!data) return;

    // Populate Leader Data
    modalTeamName.textContent = data.title;
    modalLeaderName.textContent = data.leader.name;
    modalLeaderAvatar.style.backgroundImage = `url('${data.leader.img}')`;

    // Generate Member Grid HTML (If members exist)
    modalMemberGrid.innerHTML = data.members.map(m => `
        <div class="member">
            <div class="member-avatar" style="background-image: url('${m.img}');"></div>
            <span class="member-name">${m.name}</span>
        </div>
    `).join('');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (orbitRing) orbitRing.style.animationPlayState = 'paused';
}

function closeTeamModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (orbitRing) orbitRing.style.animationPlayState = 'running';
}

document.querySelectorAll('.leader-node').forEach(node => {
    node.addEventListener('click', () => {
        openTeamModal(node.dataset.team);
    });
});

closeModalBtn.addEventListener('click', closeTeamModal);
modal.querySelector('.modal-overlay').addEventListener('click', closeTeamModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeTeamModal();
    }
});