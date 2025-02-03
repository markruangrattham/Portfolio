document.addEventListener("DOMContentLoaded", function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".project-slide");
    const totalSlides = slides.length;
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const toggleBtn = document.querySelector(".toggle-courses-btn");
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? "block" : "none";
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    function toggleCourses() {
        const courseList = document.getElementById("courses-list");
        if (courseList.style.display === "none" || courseList.style.display === "") {
            courseList.style.display = "block";
            toggleBtn.innerText = "Hide Courses";
        } else {
            courseList.style.display = "none";
            toggleBtn.innerText = "View Courses";
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleCourses);
    } else {
        console.error("Toggle courses button not found.");
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", prevSlide);
        nextBtn.addEventListener("click", nextSlide);
    } else {
        console.error("Navigation buttons not found.");
    }

    // Show the first slide initially
    showSlide(currentSlide);

    // Smooth scrolling for navbar links
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 50,
                    behavior: 'smooth'
                });
            }
            // Close mobile menu after clicking a link
            navLinks.classList.remove("active");
            navToggle.classList.remove("open");
        });
    });

    // Mobile navigation toggle
    if (navToggle) {
        navToggle.addEventListener("click", function () {
            navLinks.classList.toggle("active");
            navToggle.classList.toggle("open");
        });
    }

    // Close mobile nav when clicking outside
    document.addEventListener("click", function (event) {
        if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove("active");
            navToggle.classList.remove("open");
        }
    });

    // Toggle experience section details by clicking anywhere in the entry
    document.querySelectorAll(".experience-entry").forEach(entry => {
        let toggleText = entry.querySelector(".experience-toggle");
        if (!toggleText) {
            toggleText = document.createElement("p");
            toggleText.classList.add("experience-toggle");
            toggleText.innerText = "Click to show more";
            entry.appendChild(toggleText);
        }

        entry.addEventListener("click", function (event) {
            if (event.target.closest(".experience-details")) return;
            const details = entry.querySelector(".experience-details");
            if (details.style.display === "block") {
                details.style.display = "none";
                toggleText.innerText = "Click to show more";
            } else {
                details.style.display = "block";
                toggleText.innerText = "Click to show less";
            }
        });
    });
});
