const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle?.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

// Close the mobile sidebar after choosing a destination.
document.querySelectorAll('.side-nav a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.side-nav a').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    sidebar.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Search filters app cards by their app name.
const search = document.getElementById('search');
search?.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  document.getElementById('appGrid')?.querySelectorAll('.app-card').forEach(card => {
    card.hidden = !String(card.dataset.name || '').includes(query);
  });
});

// App details dialog: version, size, category and description are demo fields.
const modal = document.getElementById('appModal');
const modalClose = document.getElementById('modalClose');
const modalIcon = document.getElementById('modalIcon');
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}
document.querySelectorAll('.app-card').forEach(card => {
  card.addEventListener('click', () => {
    const icon = card.querySelector('.app-icon');
    modalIcon.className = `modal-app-icon ${icon.className.replace('app-icon','').trim()}`;
    modalIcon.textContent = icon.textContent;
    document.getElementById('modalTitle').textContent = card.dataset.title || card.querySelector('b').textContent;
    document.getElementById('modalDescription').textContent = card.dataset.description || 'App details for this demo listing.';
    document.getElementById('modalVersion').textContent = card.dataset.version || 'Not specified';
    document.getElementById('modalSize').textContent = card.dataset.size || 'Not specified';
    document.getElementById('modalCategory').textContent = card.dataset.category || 'Apps';
    document.getElementById('modalUpdated').textContent = card.dataset.updated || 'Demo listing';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  });
});
modalClose?.addEventListener('click', closeModal);
modal?.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
document.addEventListener('keydown', event => { if(event.key === 'Escape'){ closeModal(); sidebar.classList.remove('open'); menuToggle?.setAttribute('aria-expanded','false'); } });

// Pointer-responsive glow on larger screens.
const hero = document.querySelector('.hero');
hero?.addEventListener('pointermove', event => {
  if (window.innerWidth < 760) return;
  const rect = hero.getBoundingClientRect();
  hero.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
  hero.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
});

// Open the search field from the search icon (especially useful on phones).
document.querySelector('.search-submit')?.addEventListener('click', () => {
  const field = document.getElementById('search');
  field?.focus();
});


// SNAPPSHUB_ADMIN_SYNC: load public app records maintained by the secured Admin Panel.
// The public site reads apps.json only; admin credentials and write APIs never belong here.
(async function loadAdminManagedApps(){
  const grid = document.getElementById('appGrid');
  if (!grid) return;
  const safeHttpUrl = value => {
    const raw = String(value || '').trim();
    if (!/^https?:\/\//i.test(raw)) return '';
    try {
      const url = new URL(raw);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch (_) { return ''; }
  };
  const knownIconDomains = {whatsapp:'whatsapp.com',telegram:'telegram.org',youtube:'youtube.com',facebook:'facebook.com',instagram:'instagram.com',tiktok:'tiktok.com',discord:'discord.com',spotify:'spotify.com',netflix:'netflix.com',google:'google.com',chrome:'google.com',gmail:'gmail.com',github:'github.com',firefox:'mozilla.org',snapchat:'snapchat.com',reddit:'reddit.com',pinterest:'pinterest.com',capcut:'capcut.com',chatgpt:'chatgpt.com',openai:'openai.com',zoom:'zoom.us'};
  const suggestedIcon = (name, url) => {
    const key = String(name || '').trim().toLowerCase();
    let domain = knownIconDomains[key] || '';
    if (!domain) { try { const u = new URL(String(url || '')); if (u.protocol === 'https:' || u.protocol === 'http:') domain = u.hostname; } catch (_) {} }
    return domain ? 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=128' : '';
  };
  const modal = document.getElementById('appModal');
  const modalIcon = document.getElementById('modalIcon');
  const download = document.getElementById('modalDownload');
  const closeModal = () => {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
  };
  function showDetails(card) {
    const icon = card.querySelector('.app-icon');
    modalIcon.className = `modal-app-icon ${icon?.className.replace('app-icon','').trim() || ''}`;
    modalIcon.replaceChildren();
    if (icon?.querySelector('img')) {
      const img = document.createElement('img');
      img.src = icon.querySelector('img').src;
      img.alt = '';
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:inherit';
      modalIcon.appendChild(img);
    } else modalIcon.textContent = icon?.textContent || (card.dataset.title || 'A').charAt(0);
    document.getElementById('modalTitle').textContent = card.dataset.title || 'App Details';
    document.getElementById('modalDescription').textContent = card.dataset.description || '';
    document.getElementById('modalVersion').textContent = card.dataset.version || 'Not specified';
    document.getElementById('modalSize').textContent = card.dataset.size || 'Not specified';
    document.getElementById('modalCategory').textContent = card.dataset.category || 'Apps';
    document.getElementById('modalUpdated').textContent = card.dataset.updated || 'Synced from Admin Panel';
    const url = safeHttpUrl(card.dataset.url);
    if (download) {
      download.hidden = !url;
      if (url) download.href = url;
      else download.removeAttribute('href');
    }
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
  }
  try {
    const response = await fetch('./apps.json', {cache: 'no-store', credentials: 'omit'});
    if (!response.ok) throw new Error('apps.json unavailable');
    const records = await response.json();
    if (!Array.isArray(records)) throw new Error('apps.json must be a list');
    const fragment = document.createDocumentFragment();
    records.forEach(record => {
      if (!record || typeof record !== 'object') return;
      const name = String(record.name || '').trim();
      if (!name) return;
      const description = String(record.description || '');
      const category = String(record.category || 'Apps');
      const iconValue = String(record.icon || '').trim();
      const iconUrl = safeHttpUrl(iconValue) || suggestedIcon(name, record.url);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'app-card';
      card.dataset.name = name.toLowerCase();
      card.dataset.title = name;
      card.dataset.version = String(record.version || 'Not specified');
      card.dataset.size = String(record.size || 'Not specified');
      card.dataset.category = category;
      card.dataset.updated = 'Synced from Admin Panel';
      card.dataset.description = description;
      card.dataset.url = safeHttpUrl(record.url || '');
      const icon = document.createElement('span');
      icon.className = 'app-icon';
      if (iconUrl) {
        const img = document.createElement('img');
        img.src = iconUrl; img.alt = ''; img.loading = 'lazy';
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:inherit';
        img.onerror = () => { img.remove(); icon.textContent = iconValue && !iconUrl ? iconValue : name.charAt(0).toUpperCase(); };
        icon.appendChild(img);
      } else {
        icon.textContent = iconValue && !/^https?:\/\//i.test(iconValue) ? iconValue : name.charAt(0).toUpperCase();
      }
      const title = document.createElement('b'); title.textContent = name;
      const meta = document.createElement('small'); meta.textContent = category;
      const details = document.createElement('span'); details.className = 'app-details'; details.textContent = 'App Details ↗';
      card.append(icon, title, meta, details);
      card.addEventListener('click', () => showDetails(card));
      fragment.appendChild(card);
    });
    // Keep the supplied design and CSS intact; replace only the demo card data.
    grid.replaceChildren(fragment);
    const query = document.getElementById('search')?.value.trim().toLowerCase() || '';
    grid.querySelectorAll('.app-card').forEach(card => { card.hidden = !card.dataset.name.includes(query); });
  } catch (error) {
    // If the public data file is unavailable, leave the original demo cards in place.
    console.warn('Admin app sync unavailable; showing built-in demo cards.', error);
  }
})();
