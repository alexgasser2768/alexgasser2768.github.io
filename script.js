// Carousel Class
class Carousel {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('[class$="-track"]'); // Select any track
        
        // If track is missing, try looking inside gallery-carousel wrapper
        if (!this.track && container.querySelector('.gallery-carousel')) {
             this.track = container.querySelector('.gallery-carousel [class$="-track"]');
        }
        this.prevBtn = container.querySelector('[class*="btn-prev"]');
        this.nextBtn = container.querySelector('[class*="btn-next"]');
        // Find dots container - typically next sibling or within the section
        this.dotsContainer = container.nextElementSibling;
        if (!this.dotsContainer || !this.dotsContainer.classList.contains('carousel-dots')) {
             this.dotsContainer = container.parentNode.querySelector('.carousel-dots');
        }

        if (!this.track || !this.dotsContainer) return; // Guard clause

        this.cards = Array.from(this.track.children);
        this.currentIndex = 0;
        this.cardsPerView = this.getCardsPerView();
        this.totalPages = Math.ceil(this.cards.length / this.cardsPerView);

        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    getCardsPerView() {
        return window.innerWidth >= 1024 ? 4 : 1;
    }

    init() {
        this.createDots();
        this.updateCarousel();
        this.addEventListeners();
    }

    createDots() {
        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.totalPages; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToPage(i));
            this.dotsContainer.appendChild(dot);
        }
    }

    updateCarousel() {
        if (!this.cards.length) return;
        
        const cardWidth = this.cards[0].offsetWidth;
        const gap = 24;
        const offset = -(this.currentIndex * this.cardsPerView * (cardWidth + gap));
        this.track.style.transform = `translateX(${offset}px)`;
        
        // Update dots
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
        
        // Update button states
        if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
        if (this.nextBtn) this.nextBtn.disabled = this.currentIndex >= this.totalPages - 1;
    }

    goToPage(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.totalPages - 1));
        this.updateCarousel();
    }

    addEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                if (this.currentIndex > 0) {
                    this.currentIndex--;
                    this.updateCarousel();
                }
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                if (this.currentIndex < this.totalPages - 1) {
                    this.currentIndex++;
                    this.updateCarousel();
                }
            });
        }

        // Touch/swipe support
        this.track.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.track.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        // Handle resizing
        window.addEventListener('resize', () => {
            const newCardsPerView = this.getCardsPerView();
            if (newCardsPerView !== this.cardsPerView) {
                this.cardsPerView = newCardsPerView;
                this.totalPages = Math.ceil(this.cards.length / this.cardsPerView);
                this.currentIndex = 0; // Reset to start to avoid index issues
                this.createDots();
                this.updateCarousel();
            } else {
                 // Even if cards per view doesn't change, width might have
                 this.updateCarousel();
            }
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        if (this.touchStartX - this.touchEndX > swipeThreshold) {
            // Swipe left
            if (this.currentIndex < this.totalPages - 1) {
                this.currentIndex++;
                this.updateCarousel();
            }
        } else if (this.touchEndX - this.touchStartX > swipeThreshold) {
            // Swipe right
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updateCarousel();
            }
        }
    }
}

// Initialize all carousels
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel-container');
    carousels.forEach(container => new Carousel(container));

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox) {
        // Add click event to all gallery images
        document.querySelectorAll('.polaroid-frame img').forEach(img => {
            img.style.cursor = 'zoom-in'; // UX hint
            img.addEventListener('click', () => {
                lightbox.classList.add('active');
                lightboxImg.src = img.src;
                // Find caption: next sibling div .polaroid-caption text
                const caption = img.nextElementSibling;
                captionText.innerHTML = caption ? caption.innerText : img.alt;
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        // Close functionality
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        };

        closeBtn.addEventListener('click', closeLightbox);

        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});

// Chargez GSAP via CDN avant ce script
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
gsap.registerPlugin(ScrollTrigger);

// Responsive letter animation
function createLetterAnimation() {
    const isMobile = window.innerWidth < 768;
    const xRange = isMobile ? 300 : 500;
    const yRange = 2;

    gsap.from(".letter", {
        scrollTrigger: {
            trigger: ".letter",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        duration: 2,
        autoAlpha: 0,
        x: () => Math.random() * xRange * 2 - xRange,
        y: () => Math.random() * yRange - (yRange / 2),
        rotation: () => Math.random() * 360,
        scale: 0,
        ease: "bounce.out(0.5, 0.3)",
        stagger: 0.5
    });
}

// Initialize letter animation
createLetterAnimation();

// Reinitialize on resize for responsiveness
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        gsap.killTweensOf(".letter");
        createLetterAnimation();
    }, 250);
});

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('nav-toggle').checked = false;
    });
});

// ==================== SERVICES SECTION ====================
