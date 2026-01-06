document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reviewForm');
  const reviewsList = document.getElementById('reviewsList');
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('ratingValue');
  const fileInput = document.getElementById('imageInput');
  const fileLabel = document.getElementById('fileLabel');
  const API_URL = 'http://localhost:5000/reviews';

  // 🌟 Toast Notification Function
  function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ⭐ Interactive Star Rating
  if (stars.length && ratingInput) {
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = parseInt(star.getAttribute('data-value'));
        ratingInput.value = value;
        stars.forEach(s => {
          s.classList.toggle('filled', s.getAttribute('data-value') <= value);
        });
      });

      star.addEventListener('mouseover', () => {
        const value = parseInt(star.getAttribute('data-value'));
        stars.forEach(s => {
          s.classList.toggle('filled', s.getAttribute('data-value') <= value);
        });
      });

      star.addEventListener('mouseleave', () => {
        const current = parseInt(ratingInput.value) || 0;
        stars.forEach(s => {
          s.classList.toggle('filled', s.getAttribute('data-value') <= current);
        });
      });
    });
  }

  // 📸 File Input Label Update
  if (fileInput && fileLabel) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        fileLabel.textContent = fileInput.files[0].name;
      } else {
        fileLabel.textContent = 'Upload Image';
      }
    });
  }

  // 📝 Form Submission Handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check that a rating was selected
      if (!ratingInput.value) {
        showToast('Please select a rating before submitting!', 'error');
        return;
      }

      const formData = new FormData(form);

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          body: formData
        });

        const result = await res.json();

        if (!res.ok) throw new Error(result.error || 'Upload failed');

        showToast('✅ Review uploaded successfully!', 'success');
        form.reset();

        // Reset star visuals
        stars.forEach(s => s.classList.remove('filled'));
        ratingInput.value = '';
        fileLabel.textContent = 'Upload Image';

        if (reviewsList) loadReviews();
      } catch (err) {
        showToast('❌ Error uploading review: ' + err.message, 'error');
      }
    });
  }

  // 💬 Load & Display Reviews
  async function loadReviews() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!reviewsList) return;

      reviewsList.innerHTML = data.map(r => `
        <div class="review-card">
          <img src="${r.imageUrl}" alt="Review Image" class="review-img" />
          <p>"${r.review}"</p>
          <h4>${r.name}</h4>
          <div class="stars-display">
            ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  }

  // Load reviews when page opens
  if (reviewsList) loadReviews();
});
