document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reviewForm");
  const reviewsList = document.getElementById("reviewsList");
  const stars = document.querySelectorAll(".star");
  const ratingInput = document.getElementById("ratingValue");
  const fileInput = document.getElementById("imageInput");
  const fileLabel = document.getElementById("fileLabel");

  const API_URL = "http://localhost:5000/reviews";

  let reviews = [];
  let currentIndex = 0;

  /* ================= TOAST ================= */
  function showToast(message, type = "success") {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  /* ================= STARS ================= */
  stars.forEach(star => {
    star.addEventListener("click", () => {
      const value = star.dataset.value;
      ratingInput.value = value;
      stars.forEach(s =>
        s.classList.toggle("filled", s.dataset.value <= value)
      );
    });
  });

  /* ================= FILE LABEL ================= */
  if (fileInput && fileLabel) {
    fileInput.addEventListener("change", () => {
      fileLabel.textContent =
        fileInput.files.length > 0
          ? fileInput.files[0].name
          : "Upload Image";
    });
  }

  /* ================= FORM SUBMIT ================= */
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      if (!ratingInput.value) {
        showToast("Please select a rating!", "error");
        return;
      }

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          body: new FormData(form)
        });

        if (!res.ok) throw new Error("Upload failed");

        showToast("✅ Review uploaded successfully!");
        form.reset();
        stars.forEach(s => s.classList.remove("filled"));
        fileLabel.textContent = "Upload Image";

        loadReviews();
      } catch (err) {
        showToast("❌ " + err.message, "error");
      }
    });
  }

  /* ================= LOAD REVIEWS ================= */
  async function loadReviews() {
    try {
      const res = await fetch(API_URL);
      reviews = await res.json();
      if (!reviews.length) return;

      currentIndex = 0;
      renderReview(currentIndex, "right");
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= GSAP CAROUSEL ================= */
  function renderReview(index, direction) {
    const r = reviews[index];

    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <img src="${r.imageUrl}" class="review-img"/>
      <p>"${r.review}"</p>
      <h4>${r.name}</h4>
      <div class="stars-display">
        ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}
      </div>
    `;

    reviewsList.appendChild(card);

    gsap.fromTo(
      card,
      {
        x: direction === "right" ? 300 : -300,
        opacity: 0
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out"
      }
    );

    const oldCard = reviewsList.querySelector(
      ".review-card:not(:last-child)"
    );

    if (oldCard) {
      gsap.to(oldCard, {
        x: direction === "right" ? -300 : 300,
        opacity: 0,
        duration: 0.4,
        onComplete: () => oldCard.remove()
      });
    }

    card.addEventListener("click", nextReview);
  }

  function nextReview() {
    currentIndex = (currentIndex + 1) % reviews.length;
    renderReview(currentIndex, "right");
  }

  if (reviewsList) loadReviews();
});

/* ================= MOBILE NAV ================= */
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
const closeNav = document.getElementById("closeNav");

hamburger?.addEventListener("click", () => mobileNav.classList.add("active"));
closeNav?.addEventListener("click", () => mobileNav.classList.remove("active"));

/* Gsap scrolling animation */
const sections = document.querySelectorAll(".section");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.2 }
);

sections.forEach(section => observer.observe(section));

