/* =============================================
   BookNotes v2 — Client JS
   ============================================= */

// ── Dark Mode ─────────────────────────────────
const html      = document.documentElement;
const themeBtn  = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('bn-theme') || 'light';

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('bn-theme', theme);
  if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

setTheme(savedTheme);
if (themeBtn) themeBtn.addEventListener('click', () => {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ── Rating Slider ─────────────────────────────
function updateRating(val) {
  const display = document.getElementById('ratingDisplay');
  const slider  = document.getElementById('rating');
  if (display) display.textContent = val;
  if (slider) {
    const pct = ((val - 1) / 9) * 100;
    slider.style.background =
      `linear-gradient(to right, var(--primary) 0%, var(--primary) ${pct}%, var(--border) ${pct}%)`;
  }
}

// ── DOMContentLoaded ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Author/Director label swap
  const typeRadios  = document.querySelectorAll('input[name="type"]');
  const authorLabel = document.getElementById('author-label');
  const authorInput = document.getElementById('author_director');

  function updateAuthorLabel() {
    const sel = document.querySelector('input[name="type"]:checked');
    if (!sel || !authorLabel) return;
    if (sel.value === 'movie') {
      authorLabel.textContent = 'Director';
      if (authorInput) authorInput.placeholder = 'Director name…';
    } else {
      authorLabel.textContent = 'Author';
      if (authorInput) authorInput.placeholder = 'Author name…';
    }
  }
  typeRadios.forEach(r => r.addEventListener('change', updateAuthorLabel));
  updateAuthorLabel();

  // Init slider
  const slider = document.getElementById('rating');
  if (slider) updateRating(slider.value);

  // Escape to clear search
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.closest('form').submit();
      }
    });
  }

  // Card stagger animation
  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.animation = `fadeUp 0.35s ${i * 0.04}s ease both`;
  });

  // ── User dropdown ─────────────────────────
  const menuBtn      = document.getElementById('userMenuBtn');
  const dropdown     = document.getElementById('userDropdown');

  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
    dropdown.addEventListener('click', e => e.stopPropagation());
  }

  // ── Auto-dismiss flash messages ──────────
  document.querySelectorAll('.flash').forEach(el => {
    setTimeout(() => el.style.opacity = '0', 4000);
    setTimeout(() => el.remove(), 4400);
    el.style.transition = 'opacity 0.4s ease';
  });

  // ── Cover Art Auto-Fetch ──────────────────
  const fetchBtn    = document.getElementById('fetchCoverBtn');
  const coverUrlInp = document.getElementById('cover_url');
  const coverPreview = document.getElementById('coverPreview');
  const coverImg    = document.getElementById('coverImg');

  if (fetchBtn) {
    fetchBtn.addEventListener('click', async () => {
      const titleVal  = document.getElementById('title')?.value?.trim();
      const authorVal = document.getElementById('author_director')?.value?.trim();
      const yearVal   = document.getElementById('year')?.value?.trim();
      const typeVal   = document.querySelector('input[name="type"]:checked')?.value;

      if (!titleVal) {
        alert('Please enter a title first.');
        return;
      }

      fetchBtn.disabled = true;
      fetchBtn.textContent = '⏳ Fetching…';

      try {
        const params = new URLSearchParams({ type: typeVal, title: titleVal });
        if (authorVal) params.append('author', authorVal);
        if (yearVal)   params.append('year', yearVal);

        const res  = await fetch(`/api/cover?${params}`);
        const data = await res.json();

        if (data.url) {
          coverUrlInp.value = data.url;
          coverImg.src = data.url;
          coverPreview.style.display = 'block';
          fetchBtn.textContent = '✅ Found!';
        } else {
          fetchBtn.textContent = '❌ Not found';
          if (data.note) console.info('Cover note:', data.note);
        }
      } catch (err) {
        fetchBtn.textContent = '❌ Error';
        console.error('Cover fetch error:', err);
      }

      setTimeout(() => {
        fetchBtn.disabled = false;
        fetchBtn.textContent = '🔍 Auto-fetch';
      }, 2500);
    });

    // Live preview when URL typed manually
    if (coverUrlInp && coverImg && coverPreview) {
      coverUrlInp.addEventListener('input', () => {
        const url = coverUrlInp.value.trim();
        if (url) {
          coverImg.src = url;
          coverPreview.style.display = 'block';
          coverImg.onerror = () => { coverPreview.style.display = 'none'; };
        } else {
          coverPreview.style.display = 'none';
        }
      });
    }
  }

  // ── Favorite toggle (detail page) ─────────
  const favBtn = document.getElementById('favBtn');
  if (favBtn) {
    favBtn.addEventListener('click', async () => {
      const id = favBtn.dataset.id;
      try {
        const res  = await fetch(`/reviews/${id}/favorite`, { method: 'PATCH' });
        const data = await res.json();
        if (data.ok) {
          const isNowFav = favBtn.classList.toggle('fav-active');
          favBtn.textContent = isNowFav ? '⭐ Favorited' : '☆ Favorite';
          favBtn.title       = isNowFav ? 'Remove from favorites' : 'Add to favorites';
        }
      } catch (err) {
        console.error('Favorite toggle error:', err);
      }
    });
  }

});
