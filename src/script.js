document.addEventListener("DOMContentLoaded", function() {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".project-slide");
    const totalSlides = slides.length;
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

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

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", prevSlide);
        nextBtn.addEventListener("click", nextSlide);
    } else {
        console.error("Navigation buttons not found.");
    }

    // Show the first slide initially
    showSlide(currentSlide);

    // Toggle experience section details by clicking anywhere in the entry
    document.querySelectorAll(".experience-entry").forEach(entry => {
        // Ensure each entry has a toggle text
        let toggleText = entry.querySelector(".experience-toggle");
        if (!toggleText) {
            toggleText = document.createElement("p");
            toggleText.classList.add("experience-toggle");
            toggleText.innerText = "Click to show more";
            entry.appendChild(toggleText);
        }

        // Add click event to the whole entry, not just the text
        entry.addEventListener("click", function(event) {
            // Prevent click from bubbling if user clicks inside details
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
