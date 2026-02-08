document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reviewForm");
  const reviewsList = document.getElementById("reviewsList");
  const stars = document.querySelectorAll(".star");
  const ratingInput = document.getElementById("ratingValue");
  const fileInput = document.getElementById("imageInput");
  const fileLabel = document.getElementById("fileLabel");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const API_URL = "http://localhost:5000/reviews";

  let reviews = [];
  let currentIndex = 0;
  const VISIBLE = 3; // how many cards visible

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

  /* ================= STAR RATING ================= */
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
        showToast("Please select rating!", "error");
        return;
      }

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          body: new FormData(form)
        });

        if (!res.ok) throw new Error("Upload failed");

        showToast("✅ Review uploaded!");
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
      renderReviews("right");
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= RENDER MULTIPLE CARDS ================= */
  function renderReviews(direction = "right") {
    reviewsList.innerHTML = "";

    for (let i = 0; i < VISIBLE; i++) {
      const index = (currentIndex + i) % reviews.length;
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

      gsap.from(card, {
        x: direction === "right" ? 120 : -120,
        opacity: 0,
        duration: 0.4,
        delay: i * 0.08,
        ease: "power2.out"
      });
    }
  }

  /* ================= NEXT BUTTON ================= */
  nextBtn?.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex >= reviews.length) currentIndex = 0;
    renderReviews("right");
  });

  /* ================= PREV BUTTON ================= */
  prevBtn?.addEventListener("click", () => {
    currentIndex--;
    if (currentIndex < 0) currentIndex = reviews.length - 1;
    renderReviews("left");
  });

  /* ================= AUTO SLIDE ================= */
  setInterval(() => {
    if (reviews.length > 0) {
      currentIndex++;
      if (currentIndex >= reviews.length) currentIndex = 0;
      renderReviews("right");
    }
  }, 4000);

  if (reviewsList) loadReviews();
});

/* ================= MOBILE NAV ================= */
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
const closeNav = document.getElementById("closeNav");

hamburger?.addEventListener("click", () =>
  mobileNav.classList.add("active")
);

closeNav?.addEventListener("click", () =>
  mobileNav.classList.remove("active")
);

/* ================= SCROLL ANIMATION ================= */
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
