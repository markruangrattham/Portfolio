document.addEventListener("DOMContentLoaded", function () {
    // Render shared components first
    renderNavbar();

    // Initialize all components
    initializeProjectSlider();
    initializeMobileNavigation();
    initializeSmoothScrolling();
    initializeContactForm();
    initializeExperienceToggles();
    initializeScrollAnimations();
    initializeCoursesToggle();
    initializeImageModal();
    initializeLastUpdatedFooter();

    // Load dynamic sections from cloud (blog preview, and any empty experience/project containers)
    if (typeof initPortfolioData === 'function') {
        initPortfolioData();
    }
});

// Reusable Navbar Renderer
function renderNavbar() {
    const mount = document.getElementById('navbarMount');
    if (!mount) return;

    const isHome = /(^|\/)index\.html$/.test(location.pathname) || location.pathname.endsWith('/') || !!document.getElementById('hero');

    const link = (hashOrPath) => isHome ? `#${hashOrPath}` : `index.html#${hashOrPath}`;

    const isBlog = location.pathname.includes('blog');

    const navHtml = `
    <nav class="navbar" id="mainNavbar">
        <div class="nav-container">
            <a href="${isHome ? '#hero' : 'index.html'}" class="logo">
                <div class="logo-mark">MR</div>
                <span class="logo-name">Mark<span class="logo-dot">.</span></span>
            </a>
            <button class="nav-toggle" aria-label="Toggle navigation">&#9776;</button>
            <ul class="nav-links">
                <li><a href="${link('hero')}">Home</a></li>
                <li><a href="${link('skills')}">Skills</a></li>
                <li><a href="${link('projects')}">Projects</a></li>
                <li><a href="${link('experience')}">Experience</a></li>
                <li><a href="blog.html" class="${isBlog ? 'active' : ''}">Blog</a></li>
                <li><a href="${link('about')}">About</a></li>
                <li><a href="${link('contact')}">Contact</a></li>
            </ul>
        </div>
    </nav>`;

    mount.innerHTML = navHtml;
}

// Project Slider Functionality
function initializeProjectSlider() {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".project-slide");
    const totalSlides = slides.length;

    // If there are no slides on this page, safely exit
    if (totalSlides === 0) {
        return;
    }

    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? "grid" : "none";
        });
        const currentSlideElement = slides[index];
        if (!currentSlideElement) return;
        currentSlideElement.style.opacity = "0";
        currentSlideElement.style.transform = "translateY(20px)";
        setTimeout(() => {
            currentSlideElement.style.transition = "all 0.5s ease-out";
            currentSlideElement.style.opacity = "1";
            currentSlideElement.style.transform = "translateY(0)";
        }, 50);
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", prevSlide);
        nextBtn.addEventListener("click", nextSlide);
        document.addEventListener("keydown", function(event) {
            if (event.key === "ArrowLeft") {
                prevSlide();
            } else if (event.key === "ArrowRight") {
                nextSlide();
            }
        });
    }

    showSlide(currentSlide);
}

// Mobile Navigation
function initializeMobileNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (navToggle) {
        navToggle.addEventListener("click", function () {
            navLinks.classList.toggle("active");
            navToggle.classList.toggle("open");
            
            // Add animation to toggle button
            if (navToggle.classList.contains("open")) {
                navToggle.innerHTML = "✕";
            } else {
                navToggle.innerHTML = "&#9776;";
            }
        });
    }

    // Close mobile nav when clicking outside
    document.addEventListener("click", function (event) {
        if (navToggle && !navToggle.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove("active");
            navToggle.classList.remove("open");
            navToggle.innerHTML = "&#9776;";
        }
    });
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            const href = this.getAttribute('href') || '';

            // Only intercept in-page anchors (e.g., #skills) or same-page index anchors (index.html#skills when already on home)
            const onHome = /(^|\/)index\.html$/.test(location.pathname) || location.pathname.endsWith('/');
            const isHashLink = href.startsWith('#');
            const isIndexHashLink = href.startsWith('index.html#') && onHome;

            if (!isHashLink && !isIndexHashLink) {
                // Normal navigation (e.g., blog.html, external links, or index.html# when not on home)
                // Close mobile menu then navigate explicitly to avoid any interference
                const navLinks = document.querySelector('.nav-links');
                const navToggle = document.querySelector('.nav-toggle');
                if (navLinks && navToggle) {
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('open');
                    navToggle.innerHTML = '&#9776;';
                }
                // Let default proceed, but also set location to be safe
                // Use setTimeout to allow click ripple if any
                setTimeout(() => { window.location.href = href; }, 0);
                return;
            }

            event.preventDefault();
            const targetId = isHashLink ? href.substring(1) : href.split('#')[1];
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }

            // Close mobile menu after clicking a link
            const navLinks = document.querySelector('.nav-links');
            const navToggle = document.querySelector('.nav-toggle');
            if (navLinks && navToggle) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('open');
                navToggle.innerHTML = '&#9776;';
            }
        });
    });
}

// Contact Form
function initializeContactForm() {
    const form = document.getElementById("contactForm");
    
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = "Sending...";
            submitBtn.disabled = true;
            
            fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    showNotification("Message sent successfully!", "success");
                    form.reset();
                } else {
                    showNotification("Oops! There was a problem submitting your form.", "error");
                }
            }).catch(error => {
                showNotification("Something went wrong. Please try again later.", "error");
            }).finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }
}

// Experience Toggles
function initializeExperienceToggles() {
    document.querySelectorAll(".experience-entry").forEach(entry => {
        entry.addEventListener("click", function (event) {
            if (event.target.closest(".experience-details")) return;
            
            const details = entry.querySelector(".experience-details");
            const isActive = entry.classList.contains("active");
            
            // Close all other entries
            document.querySelectorAll(".experience-entry").forEach(otherEntry => {
                if (otherEntry !== entry) {
                    otherEntry.classList.remove("active");
                    const otherDetails = otherEntry.querySelector(".experience-details");
                    if (otherDetails) {
                        otherDetails.style.display = "none";
                    }
                }
            });
            
            // Toggle current entry
            if (isActive) {
                entry.classList.remove("active");
                if (details) {
                    details.style.display = "none";
                }
            } else {
                entry.classList.add("active");
                if (details) {
                    details.style.display = "block";
                }
            }
        });
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-in");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.skill-category, .timeline-item, .project-card, .blog-card, .stat-card, .about-content'
    );
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Toggle white background once user scrolls past hero
        if (navbar) {
            if (scrollTop > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            if (navbar) navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            if (navbar) navbar.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });
}

// Courses Toggle
function initializeCoursesToggle() {
    const toggleBtn = document.querySelector(".toggle-courses-btn");
    const courseList = document.getElementById("courses-list");

    if (toggleBtn && courseList) {
        toggleBtn.addEventListener("click", function() {
            const isHidden = courseList.classList.contains("hidden");
            if (isHidden) {
                courseList.classList.remove("hidden");
                toggleBtn.querySelector("span").textContent = "Hide Courses";
            } else {
                courseList.classList.add("hidden");
                toggleBtn.querySelector("span").textContent = "View Courses";
            }
        });
    }
}

// Notification System
function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Legacy function for backward compatibility
function toggleDetails(element) {
    const details = element.querySelector(".experience-details");
    const isActive = element.classList.contains("active");
    
    if (isActive) {
        element.classList.remove("active");
        if (details) {
            details.style.display = "none";
        }
    } else {
        element.classList.add("active");
        if (details) {
            details.style.display = "block";
        }
    }
}

function toggleCourses() {
    const toggleBtn = document.querySelector(".toggle-courses-btn");
    const courseList = document.getElementById("courses-list");

    if (courseList && toggleBtn) {
        const isHidden = courseList.classList.contains("hidden");
        if (isHidden) {
            courseList.classList.remove("hidden");
            toggleBtn.querySelector("span").textContent = "Hide Courses";
        } else {
            courseList.classList.add("hidden");
            toggleBtn.querySelector("span").textContent = "View Courses";
        }
    }
}

// Add loading animation to page elements
window.addEventListener('load', function() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        element.classList.add('loaded');
    });
});

function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;

    const modalImg = modal.querySelector('.modal-image');
    const modalVideo = modal.querySelector('.modal-video');
    const closeBtn = modal.querySelector('.close-btn');

    // Attach for image triggers
    document.querySelectorAll('img.modal-trigger').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            const src = img.getAttribute('data-modal-image') || img.src;
            modalVideo.style.display = 'none';
            modalVideo.src = '';
            modalImg.src = src;
            modalImg.style.display = 'block';
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    });

    // Attach for video triggers
    document.querySelectorAll('[data-modal-video]').forEach(el => {
        el.style.cursor = 'zoom-in';
        el.addEventListener('click', () => {
            const src = el.getAttribute('data-modal-video');
            modalImg.style.display = 'none';
            modalImg.src = '';
            modalVideo.src = src;
            modalVideo.style.display = 'block';
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            // Autoplay when opened
            modalVideo.play().catch(() => {});
        });
    });

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        modalImg.src = '';
        modalVideo.pause();
        modalVideo.currentTime = 0;
        modalVideo.src = '';
        document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
}

// Auto-fill "Last Updated" in footer across all pages
function initializeLastUpdatedFooter() {
    const targets = document.querySelectorAll('.footer .footer-info i, [data-last-updated]');
    if (!targets.length) return;

    const date = new Date();
    const months = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
    ];
    const day = date.getDate();
    const formatted = `${months[date.getMonth()]} ${addOrdinal(day)}, ${date.getFullYear()}`;

    targets.forEach(el => {
        el.textContent = `Last Updated: ${formatted}`;
    });
}

function addOrdinal(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
