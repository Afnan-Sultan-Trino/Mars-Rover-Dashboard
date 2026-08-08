// ===== TIER SELECTION =====
const tierCards = document.querySelectorAll('.tier-card');
let selectedTier = null;

tierCards.forEach(card => {
    card.addEventListener('click', function() {
        // Remove selected from all
        tierCards.forEach(c => c.classList.remove('selected'));
        // Add to clicked
        this.classList.add('selected');
        selectedTier = this.dataset.tier;
    });
});

// ===== ENGAGEMENT TOGGLES =====
const engItems = document.querySelectorAll('.eng-item');
const selectedEngagements = [];

engItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // Prevent toggling if clicking the checkbox itself (already handled)
        if (e.target.tagName === 'INPUT') return;
        const checkbox = this.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        this.classList.toggle('selected', checkbox.checked);
        updateEngagements();
    });
    // Also listen for checkbox change
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
        item.classList.toggle('selected', this.checked);
        updateEngagements();
    });
});

function updateEngagements() {
    selectedEngagements.length = 0;
    engItems.forEach(item => {
        if (item.querySelector('input[type="checkbox"]').checked) {
            selectedEngagements.push(item.dataset.value);
        }
    });
}

// ===== AGREEMENT CHECK =====
const agreeCheck = document.getElementById('agreeCheck');
const agreementBox = document.getElementById('agreementBox');

agreementBox.addEventListener('click', function(e) {
    if (e.target.tagName !== 'INPUT') {
        agreeCheck.checked = !agreeCheck.checked;
    }
});

// ===== SUBMIT =====
document.getElementById('submitSponsor').addEventListener('click', function() {
    // Validate required fields
    const orgName = document.getElementById('orgName').value.trim();
    const contactPerson = document.getElementById('contactPerson').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!orgName || !contactPerson || !email) {
        alert('Please fill in all required fields (Organisation, Contact Person, Email).');
        return;
    }

    if (!selectedTier) {
        alert('Please select a sponsorship tier.');
        return;
    }

    if (!agreeCheck.checked) {
        alert('You must agree to the sponsorship terms to continue.');
        return;
    }

    // Prepare data
    const data = {
        tier: selectedTier,
        organisation: orgName,
        contactPerson: contactPerson,
        email: email,
        phone: document.getElementById('phone').value.trim(),
        message: document.getElementById('message').value.trim(),
        engagements: selectedEngagements,
        agreed: agreeCheck.checked
    };

    console.log('Sponsorship Request:', data);

    // In a real scenario, you would send this to a server.
    alert('Thank you! Your sponsorship request has been submitted. We will contact you within 48 hours. 🚀');

    // Optionally reset the form (or redirect)
    // window.location.href = 'index.html';
});