/* =============================================
   BookNotes Premium — Client JS
   Features: dark mode, view toggle, reading goal,
             keyboard shortcuts, scroll-to-top,
             cover fetch, favorite toggle, etc.
   ============================================= */

// ── Theme ──────────────────────────────────────
const html       = document.documentElement;
const themeBtn   = document.getElementById('themeToggle');
const iconMoon   = document.getElementById('iconMoon');
const iconSun    = document.getElementById('iconSun');
const savedTheme = localStorage.getItem('bn-theme') || 'light';

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('bn-theme', theme);
  if (iconMoon && iconSun) {
    iconMoon.style.display = theme === 'dark' ? 'none'  : '';
    iconSun.style.display  = theme === 'dark' ? ''      : 'none';
  }
}

setTheme(savedTheme);
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
}

// ── Rating Slider ──────────────────────────────
function updateRating(val) {
  const display = document.getElementById('ratingDisplay');
  const slider  = document.getElementById('rating');
  if (display) display.textContent = val;
  if (slider) {
    const pct = ((val - 1) / 9) * 100;
    slider.style.background =
      `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--border-strong) ${pct}%)`;
  }
}

// ── DOMContentLoaded ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Author / Director label swap ─────────────
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

  // ── Init rating slider ────────────────────────
  const slider = document.getElementById('rating');
  if (slider) updateRating(slider.value);

  // ── Search: Escape clears, / focuses ─────────
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.closest('form').submit();
      }
    });
  }

  // ── Card stagger animation ────────────────────
  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.animation = `fadeUp 0.35s ${i * 0.035}s var(--ease) both`;
  });

  // ── User dropdown ─────────────────────────────
  const menuBtn  = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdown');
  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
    dropdown.addEventListener('click', e => e.stopPropagation());
  }

  // ── Auto-dismiss flash messages ───────────────
  document.querySelectorAll('.flash').forEach(el => {
    el.style.transition = 'opacity 0.4s ease';
    setTimeout(() => { el.style.opacity = '0'; }, 4000);
    setTimeout(() => el.remove(), 4400);
  });

  // ── Grid / List view toggle ───────────────────
  const cardsGrid = document.getElementById('cardsGrid');
  const gridBtn   = document.getElementById('viewGrid');
  const listBtn   = document.getElementById('viewList');

  if (cardsGrid && gridBtn && listBtn) {
    const savedView = localStorage.getItem('bn-view') || 'grid';
    applyView(savedView);

    gridBtn.addEventListener('click', () => { applyView('grid'); localStorage.setItem('bn-view', 'grid'); });
    listBtn.addEventListener('click', () => { applyView('list'); localStorage.setItem('bn-view', 'list'); });

    function applyView(view) {
      if (view === 'list') {
        cardsGrid.classList.add('list-view');
        gridBtn.classList.remove('active');
        listBtn.classList.add('active');
      } else {
        cardsGrid.classList.remove('list-view');
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
      }
    }
  }

  // ── Reading Goal ──────────────────────────────
  initReadingGoal();

  // ── Keyboard Shortcuts ────────────────────────
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'n') {
      const addLink = document.querySelector('a.nav-cta[href="/reviews/new"]');
      if (addLink) { e.preventDefault(); window.location.href = '/reviews/new'; }
    }
    if (e.key === '/') {
      e.preventDefault();
      if (searchInput) { searchInput.focus(); searchInput.select(); }
    }
  });

  // ── Scroll to Top ─────────────────────────────
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 380);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Cover Art Auto-Fetch ──────────────────────
  const fetchBtn     = document.getElementById('fetchCoverBtn');
  const coverUrlInp  = document.getElementById('cover_url');
  const coverPreview = document.getElementById('coverPreview');
  const coverImg     = document.getElementById('coverImg');

  if (fetchBtn) {
    fetchBtn.addEventListener('click', async () => {
      const titleVal  = document.getElementById('title')?.value?.trim();
      const authorVal = document.getElementById('author_director')?.value?.trim();
      const yearVal   = document.getElementById('year')?.value?.trim();
      const typeVal   = document.querySelector('input[name="type"]:checked')?.value;

      if (!titleVal) { alert('Please enter a title first.'); return; }

      fetchBtn.disabled = true;
      const origHtml = fetchBtn.innerHTML;
      fetchBtn.innerHTML = `
        <svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;animation:spin 1s linear infinite" viewBox="0 0 24 24">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Fetching…`;

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
          fetchBtn.innerHTML = `
            <svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Found!`;
        } else {
          fetchBtn.innerHTML = `
            <svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Not found`;
        }
      } catch {
        fetchBtn.innerHTML = `
          <svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Error`;
      }

      setTimeout(() => {
        fetchBtn.disabled = false;
        fetchBtn.innerHTML = origHtml;
      }, 2500);
    });

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

  // ── Favorite Toggle ───────────────────────────
  const favBtn = document.getElementById('favBtn');
  if (favBtn) {
    favBtn.addEventListener('click', async () => {
      const id = favBtn.dataset.id;
      try {
        const res  = await fetch(`/reviews/${id}/favorite`, { method: 'PATCH' });
        const data = await res.json();
        if (data.ok) {
          const isNowFav = favBtn.classList.toggle('fav-active');
          const label = isNowFav ? 'Favorited' : 'Favorite';
          // Keep the SVG, update text node
          const textNode = Array.from(favBtn.childNodes)
            .find(n => n.nodeType === 3 && n.textContent.trim());
          if (textNode) textNode.textContent = ` ${label}`;
          favBtn.title = isNowFav ? 'Remove from favorites' : 'Add to favorites';
        }
      } catch (err) {
        console.error('Favorite toggle error:', err);
      }
    });
  }

});

// ── Reading Goal ────────────────────────────────
function initReadingGoal() {
  const year    = new Date().getFullYear();
  const goalKey = `bn-goal-${year}`;

  document.querySelectorAll('[data-goal-widget]').forEach(widget => {
    const completed = parseInt(widget.dataset.completed || 0);
    const goal      = parseInt(localStorage.getItem(goalKey) || 0);

    const numEl    = widget.querySelector('[data-goal-num]');
    const denomEl  = widget.querySelector('[data-goal-denom]');
    const barEl    = widget.querySelector('[data-goal-bar]');
    const pctEl    = widget.querySelector('[data-goal-pct]');
    const barLgEl  = widget.querySelector('[data-goal-bar]');

    if (numEl) numEl.textContent = completed;

    if (goal > 0) {
      const pct = Math.min(Math.round((completed / goal) * 100), 100);
      if (denomEl) {
        // hero widget shows "/ 24" style, stats shows "/ 24 books"
        const isStats = denomEl.textContent.includes('books');
        denomEl.textContent = isStats ? `/ ${goal} books` : `/ ${goal}`;
      }
      if (barEl)   barEl.style.width  = pct + '%';
      if (barLgEl) barLgEl.style.width = pct + '%';
      if (pctEl)   pctEl.textContent  = pct + '% of goal';
      widget.classList.remove('goal-not-set');
    } else {
      if (denomEl) {
        const isStats = denomEl.textContent && denomEl.textContent.includes('/');
        denomEl.textContent = isStats ? '/ — books' : 'books read';
      }
      if (barEl)  barEl.style.width  = '0%';
      if (pctEl)  pctEl.textContent = 'Set a goal to track progress';
      widget.classList.add('goal-not-set');
    }
  });

  document.querySelectorAll('[data-set-goal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = parseInt(localStorage.getItem(goalKey)) || 0;
      const val = prompt(
        `Set your ${year} reading goal (number of books):\n(Enter 0 to clear)`,
        current || 24
      );
      if (val === null) return;
      const num = parseInt(val);
      if (num > 0) {
        localStorage.setItem(goalKey, num);
      } else {
        localStorage.removeItem(goalKey);
      }
      initReadingGoal();
    });
  });
}

// ── Spin keyframe (for fetch button) ───────────
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleEl);
