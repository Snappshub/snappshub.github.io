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
  const suggestedIcon = (name) => {
    const key = String(name || '').trim().toLowerCase().replace(/\s+(pro|lite|premium|mod|hd)$/i, '');
    const aliases = {};
    const domain = knownIconDomains[key] || aliases[key] || '';
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
    document.getElementById('modalTitle').textContent = 'Download ' + (card.dataset.title || 'App');
    document.getElementById('modalDescription').textContent = card.dataset.description || '';
    document.getElementById('modalVersion').textContent = card.dataset.version || 'Not specified';
    document.getElementById('modalSize').textContent = card.dataset.size || 'Not specified';
    document.getElementById('modalCategory').textContent = card.dataset.category || 'Apps';
    document.getElementById('modalUpdated').textContent = card.dataset.updated || 'Synced from Admin Panel';
    const url = safeHttpUrl(card.dataset.url);
    if (download) {
      download.hidden = false;
      if (url && !/^https?:\/\/(www\.)?t\.me\//i.test(url)) {
        download.href = url;
        download.target = '_blank';
        download.dataset.demoUnavailable = 'false';
        download.textContent = 'Direct Download ↓';
      } else {
        download.removeAttribute('href');
        download.dataset.demoUnavailable = 'true';
        download.textContent = 'Direct Download (Demo) ↓';
      }
    }
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
  }
  download?.addEventListener('click', event => {
    if (download.dataset.demoUnavailable === 'true') {
      event.preventDefault();
      window.alert('Demo preview: Direct Download will work after you upload the app file and add its direct URL in the admin panel.');
    }
  });
  try {
    const response = await fetch('./apps.json', {cache: 'no-store', credentials: 'omit'});
    if (!response.ok) throw new Error('apps.json unavailable');
    const records = await response.json();
    if (!Array.isArray(records)) throw new Error('apps.json must be a list');
    const fragment = document.createDocumentFragment();
    const groupedRecords = records.filter(record => record && typeof record === 'object' && String(record.name || '').trim()).sort((a,b) => String(a.category || 'Apps').localeCompare(String(b.category || 'Apps')) || String(a.name || '').localeCompare(String(b.name || '')));
    let activeGroup = '';
    groupedRecords.forEach(record => {
      const groupName = String(record.category || 'Apps');
      if (groupName !== activeGroup) {
        activeGroup = groupName;
        const heading = document.createElement('h3');
        heading.className = 'catalog-group-heading';
        heading.dataset.groupCategory = groupName;
        heading.textContent = groupName;
        fragment.appendChild(heading);
      }
      if (!record || typeof record !== 'object') return;
      const name = String(record.name || '').trim();
      if (!name) return;
      const description = String(record.description || '');
      const category = String(record.category || 'Apps');
      const iconValue = String(record.icon || '').trim();
      const rawIconUrl = safeHttpUrl(iconValue);
      const iconUrl = rawIconUrl && !/(^|\.)((t\.me)|(telegram\.org))$/i.test(new URL(rawIconUrl).hostname) ? rawIconUrl : suggestedIcon(name);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'app-card';
      card.dataset.name = name.toLowerCase();
      card.dataset.title = name;
      card.dataset.version = String(record.version || 'Not specified');
      card.dataset.size = String(record.size || 'Not specified');
      card.dataset.category = category;
      card.dataset.devices = Array.isArray(record.devices) ? record.devices.join(',') : String(record.devices || record.device || '');
      card.dataset.updated = String(record.updated || 'Not verified');
      card.dataset.description = description;
      card.dataset.url = safeHttpUrl(record.url || '');
      const icon = document.createElement('span');
      icon.className = 'app-icon';
      if (iconUrl) {
        const img = document.createElement('img');
        img.src = iconUrl; img.alt = ''; img.loading = 'lazy';
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:inherit';
        img.onerror = () => { img.remove(); icon.textContent = name.charAt(0).toUpperCase(); };
        icon.appendChild(img);
      } else {
        icon.textContent = iconValue && !/^https?:\/\//i.test(iconValue) ? iconValue : name.charAt(0).toUpperCase();
      }
      const title = document.createElement('b'); title.textContent = name;
      const meta = document.createElement('small'); meta.textContent = `${category} · ${card.dataset.devices || 'Device not verified'}`;
      const details = document.createElement('span'); details.className = 'app-details'; details.textContent = 'Download Options ↓';
      card.append(icon, title, meta, details);
      card.addEventListener('click', () => showDetails(card));
      fragment.appendChild(card);
    });
    // Keep the supplied design and CSS intact; replace only the demo card data.
    grid.replaceChildren(fragment);
    const query = document.getElementById('search')?.value.trim().toLowerCase() || '';
    grid.querySelectorAll('.app-card').forEach(card => { card.hidden = !card.dataset.name.includes(query); });
  } catch (error) {
    // Never present unrelated built-in cards as if they came from the app catalog.
    grid.replaceChildren();
    const message = document.createElement('p');
    message.className = 'catalog-empty-state';
    message.textContent = 'App listings could not be loaded. Please refresh the page.';
    grid.appendChild(message);
    console.warn('Admin app sync unavailable.', error);
  }
})();

// Device navigation and category filters for the app catalog.
(function setupCatalogFilters(){
  const grid = document.getElementById('appGrid');
  const categoryBar = document.getElementById('categories');
  if (!grid || !categoryBar) return;
  let selectedCategory = 'all';
  let selectedDevice = '';
  const normalize = value => String(value || '').trim().toLowerCase();
  function buildCategories(){
    const categories = [...new Set([...grid.querySelectorAll('.app-card')].map(card => card.dataset.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    categoryBar.replaceChildren();
    const all = document.createElement('button'); all.type='button'; all.className='category-chip active'; all.dataset.categoryFilter='all'; all.textContent='All Categories'; categoryBar.appendChild(all);
    categories.forEach(category => { const button=document.createElement('button'); button.type='button'; button.className='category-chip'; button.dataset.categoryFilter=category; button.textContent=category; categoryBar.appendChild(button); });
  }
  function applyFilters(){
    const query = normalize(document.getElementById('search')?.value);
    grid.querySelectorAll('.app-card').forEach(card => {
      const categoryMatch = selectedCategory === 'all' || normalize(card.dataset.category) === normalize(selectedCategory);
      const nameMatch = normalize(card.dataset.name || card.dataset.title).includes(query);
      const devices = normalize(card.dataset.devices || card.dataset.device || '');
      const deviceMatch = !selectedDevice || devices.split(/[,|]/).map(normalize).filter(Boolean).includes(normalize(selectedDevice));
      card.hidden = !(categoryMatch && nameMatch && deviceMatch);
    });
    grid.querySelectorAll('.catalog-group-heading').forEach(heading => {
      const hasVisibleCard = [...grid.querySelectorAll('.app-card')].some(card => !card.hidden && normalize(card.dataset.category) === normalize(heading.dataset.groupCategory));
      heading.hidden = !hasVisibleCard;
    });
    let emptyState = grid.querySelector('.catalog-empty-state');
    const visibleCount = [...grid.querySelectorAll('.app-card')].filter(card => !card.hidden).length;
    if (!visibleCount) {
      if (!emptyState) { emptyState = document.createElement('p'); emptyState.className = 'catalog-empty-state'; grid.appendChild(emptyState); }
      emptyState.textContent = selectedDevice ? 'No verified ' + selectedDevice + ' apps are listed yet.' : 'No apps match these filters.';
    } else emptyState?.remove();
    categoryBar.querySelectorAll('.category-chip').forEach(button => button.classList.toggle('active', normalize(button.dataset.categoryFilter) === normalize(selectedCategory)));
  }
  categoryBar.addEventListener('click', event => { const button=event.target.closest('[data-category-filter]'); if(!button)return; selectedCategory=button.dataset.categoryFilter; applyFilters(); });
  document.getElementById('search')?.addEventListener('input', applyFilters);
  document.getElementById('clearFilters')?.addEventListener('click', () => { selectedCategory='all'; selectedDevice=''; if(document.getElementById('search')) document.getElementById('search').value=''; applyFilters(); });
  document.querySelectorAll('[data-device-filter]').forEach(link => link.addEventListener('click', () => { selectedDevice=link.dataset.deviceFilter || ''; selectedCategory='all'; buildCategories(); applyFilters(); }));
  buildCategories();
  // Admin-managed records may load asynchronously; rebuild chips once they appear.
  const observer = new MutationObserver(() => { buildCategories(); applyFilters(); });
  observer.observe(grid, {childList:true});
})();

// Close the mobile sidebar after selecting a top navigation item or tapping outside it.
document.querySelectorAll('#mainNav a').forEach(link => link.addEventListener('click', () => {
  sidebar?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('click', event => {
  if (!sidebar?.classList.contains('open')) return;
  if (sidebar.contains(event.target) || menuToggle?.contains(event.target)) return;
  sidebar.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
});

// Sidebar tap-away dismissal: tapping anywhere outside the open sidebar closes it.
document.addEventListener('pointerdown', event => {
  if (!sidebar?.classList.contains('open')) return;
  if (sidebar.contains(event.target) || menuToggle?.contains(event.target)) return;
  sidebar.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}, true);
