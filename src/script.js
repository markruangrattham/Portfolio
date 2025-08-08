document.addEventListener("DOMContentLoaded", function () {
    // Initialize all components
    initializeProjectSlider();
    initializeMobileNavigation();
    initializeSmoothScrolling();
    initializeContactForm();
    initializeExperienceToggles();
    initializeScrollAnimations();
    initializeCoursesToggle();
});

// Project Slider Functionality
function initializeProjectSlider() {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".project-slide");
    const totalSlides = slides.length;
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? "grid" : "none";
        });
        
        // Add fade-in animation
        const currentSlideElement = slides[index];
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
        
        // Add keyboard navigation
        document.addEventListener("keydown", function(event) {
            if (event.key === "ArrowLeft") {
                prevSlide();
            } else if (event.key === "ArrowRight") {
                nextSlide();
            }
        });
    }

    // Show the first slide initially
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
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu after clicking a link
            const navLinks = document.querySelector(".nav-links");
            const navToggle = document.querySelector(".nav-toggle");
            if (navLinks && navToggle) {
                navLinks.classList.remove("active");
                navToggle.classList.remove("open");
                navToggle.innerHTML = "&#9776;";
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
    const animateElements = document.querySelectorAll('.skill-box, .experience-entry, .project-slide, .about-me-container');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
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
            const isVisible = courseList.style.display === "block";
            
            if (isVisible) {
                courseList.style.display = "none";
                toggleBtn.textContent = "View Courses";
            } else {
                courseList.style.display = "block";
                courseList.classList.add("show");
                toggleBtn.textContent = "Hide Courses";
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
        const isVisible = courseList.style.display === "block";
        
        if (isVisible) {
            courseList.style.display = "none";
            toggleBtn.textContent = "View Courses";
        } else {
            courseList.style.display = "block";
            courseList.classList.add("show");
            toggleBtn.textContent = "Hide Courses";
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
