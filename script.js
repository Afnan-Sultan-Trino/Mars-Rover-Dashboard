// ===== BACKGROUND SLIDESHOW =====
const slides = document.querySelectorAll('.slide');
let bgIndex = 0;
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach((s, i) => {
        s.classList.toggle('active', i === index);
    });
}

// ===== TEXT SLIDESHOW (4 blocks) =====
const textBlock1 = document.getElementById('textBlock1');
const textBlock2 = document.getElementById('textBlock2');
const textBlock3 = document.getElementById('textBlock3');
const textBlock4 = document.getElementById('textBlock4');
const allTextBlocks = [textBlock1, textBlock2, textBlock3, textBlock4];

function setActiveText(index) {
    allTextBlocks.forEach(block => {
        block.classList.remove('active');
    });
    allTextBlocks[index].classList.add('active');
}

setTimeout(() => {
    setActiveText(0);
}, 100);

function advanceSlide() {
    bgIndex = (bgIndex + 1) % totalSlides;
    showSlide(bgIndex);
    setActiveText(bgIndex);

    const currentBlock = allTextBlocks[bgIndex];
    const animationClass = (bgIndex % 2 === 0) ? 'slide-left' : 'slide-bottom';

    setTimeout(() => {
        currentBlock.classList.remove(animationClass);
        void currentBlock.offsetWidth;
        currentBlock.classList.add(animationClass);
    }, 50);
}

setInterval(advanceSlide, 5000);
showSlide(0);

function setTextContainerHeight() {
    const container = document.getElementById('textSlideshow');
    let maxHeight = 250;
    allTextBlocks.forEach(block => {
        const h = block.scrollHeight;
        if (h > maxHeight) maxHeight = h;
    });
    container.style.minHeight = maxHeight + 'px';
}

window.addEventListener('load', setTextContainerHeight);
setTimeout(setTextContainerHeight, 500);

// ===== SMOOTH SCROLL FOR NAVIGATION =====
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
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

// // ===== MARS ROVER LINK (opens new page/blank) =====
// document.getElementById('marsRoverLink').addEventListener('click', function(e) {
//     e.preventDefault();
//     window.open('https://marsrover.aiub.edu.bd', '_blank');
// });

// ===== CONTACT FORM SUBMISSION (demo) =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon. 🚀');
    this.reset();
});