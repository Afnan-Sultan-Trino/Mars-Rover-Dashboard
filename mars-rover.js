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

// 1. Data for all 4 teams
const teamData = {
    software: {
        title: 'Software Team',
        leader: { name: 'Muksitul Ziad', img: 'https://i.pravatar.cc/150?img=1' },
        members: [
            { name: 'Abdullah Al Nahian', img: 'https://i.pravatar.cc/100?img=2' },
            { name: 'Farhan Sadik', img: 'https://i.pravatar.cc/100?img=3' },
            { name: 'Stephen', img: 'https://i.pravatar.cc/100?img=4' },
            { name: 'Shahriar Hossain', img: 'https://i.pravatar.cc/100?img=5' },
            { name: 'Tasnim Ferdous', img: 'https://i.pravatar.cc/100?img=6' },
            { name: 'Kamal Hossain', img: 'https://i.pravatar.cc/100?img=7' }
        ]
    },
    electrical: {
        title: 'Electrical Team',
        leader: { name: 'Sabbir Hasan', img: 'https://i.pravatar.cc/150?img=8' },
        members: [
            { name: 'Rukhsar Akhter', img: 'https://i.pravatar.cc/100?img=9' },
            { name: 'Sabbir Ahmed', img: 'https://i.pravatar.cc/100?img=10' },
            { name: 'Nadia Sultana', img: 'https://i.pravatar.cc/100?img=11' },
            { name: 'Imran Hossain', img: 'https://i.pravatar.cc/100?img=12' },
            { name: 'Sharmin Akhtar', img: 'https://i.pravatar.cc/100?img=13' },
            { name: 'Rafiqul Islam', img: 'https://i.pravatar.cc/100?img=14' }
        ]
    },
    mechanical: {
        title: 'Mechanical Team',
        leader: { name: 'Farhan Zaman', img: 'https://i.pravatar.cc/150?img=15' },
        members: [
            { name: 'Tahsin Ahmed', img: 'https://i.pravatar.cc/100?img=16' },
            { name: 'Shahinur Rahman', img: 'https://i.pravatar.cc/100?img=17' },
            { name: 'Moumita Sarker', img: 'https://i.pravatar.cc/100?img=18' },
            { name: 'Ishrak Hossain', img: 'https://i.pravatar.cc/100?img=19' },
            { name: 'Nusrat Jahan', img: 'https://i.pravatar.cc/100?img=20' },
            { name: 'Ariful Islam', img: 'https://i.pravatar.cc/100?img=21' }
        ]
    },
    science: {
        title: 'Science Team',
        leader: { name: 'Tasnuva Sultana', img: 'https://i.pravatar.cc/150?img=22' },
        members: [
            { name: 'Imtiaz Ahmed', img: 'https://i.pravatar.cc/100?img=23' },
            { name: 'Anika Noor', img: 'https://i.pravatar.cc/100?img=24' },
            { name: 'Shafiqur Rahman', img: 'https://i.pravatar.cc/100?img=25' },
            { name: 'Nazia Tasnim', img: 'https://i.pravatar.cc/100?img=26' },
            { name: 'Mahmudul Hasan', img: 'https://i.pravatar.cc/100?img=27' },
            { name: 'Sadia Afrin', img: 'https://i.pravatar.cc/100?img=28' }
        ]
    }
};

// 2. DOM Elements
const modal = document.getElementById('teamModal');
const closeModalBtn = document.getElementById('closeModal');
const modalTeamName = document.getElementById('modalTeamName');
const modalLeaderName = document.getElementById('modalLeaderName');
const modalLeaderAvatar = document.getElementById('modalLeaderAvatar');
const modalMemberGrid = document.getElementById('modalMemberGrid');
const orbitRing = document.querySelector('.orbit-ring');

// 3. Open Modal Function
function openTeamModal(teamKey) {
    const data = teamData[teamKey];
    if (!data) return;

    // Populate Data
    modalTeamName.textContent = data.title;
    modalLeaderName.textContent = data.leader.name;
    modalLeaderAvatar.style.backgroundImage = `url('${data.leader.img}')`;

    // Generate Member Grid HTML
    modalMemberGrid.innerHTML = data.members.map(m => `
        <div class="member">
            <div class="member-avatar" style="background-image: url('${m.img}');"></div>
            <span class="member-name">${m.name}</span>
        </div>
    `).join('');

    // Show Modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Pause the orbit rotation while modal is open
    if (orbitRing) orbitRing.style.animationPlayState = 'paused';
}

// 4. Close Modal Function
function closeTeamModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Resume the orbit rotation
    if (orbitRing) orbitRing.style.animationPlayState = 'running';
}

// 5. Event Listeners
document.querySelectorAll('.leader-node').forEach(node => {
    node.addEventListener('click', () => {
        openTeamModal(node.dataset.team);
    });
});

closeModalBtn.addEventListener('click', closeTeamModal);
modal.querySelector('.modal-overlay').addEventListener('click', closeTeamModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeTeamModal();
    }
});