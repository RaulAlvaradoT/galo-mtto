// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Close nav when clicking a link (mobile)
nav?.addEventListener('click', (e) => {
  const target = e.target;
  if (target instanceof HTMLElement && target.tagName === 'A') {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
});

// Dynamic year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Render galería si hay datos
(function renderGaleria(){
  const grid = document.getElementById('galeria-grid');
  const fotos = (window.GALERIA_IMAGENES || []);
  const videos = (window.VIDEOS || []);
  if (!grid || (fotos.length === 0 && videos.length === 0)) return;

  const frag = document.createDocumentFragment();
  for (const it of fotos) {
    const card = document.createElement('article');
    card.className = 'card media-card';

    const h3 = document.createElement('h3');
    h3.textContent = it.titulo || 'Trabajo realizado';

    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'media';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = it.src;
    img.alt = it.titulo ? `${it.titulo} — GALO` : 'Trabajo GALO';
    mediaWrap.appendChild(img);

    const p = document.createElement('p');
    p.textContent = it.desc || '';

    card.appendChild(h3);
    card.appendChild(mediaWrap);
    if (p.textContent) card.appendChild(p);
    frag.appendChild(card);
  }
  // Append videos as part of gallery
  for (const v of videos) {
    const card = document.createElement('article');
    card.className = 'card video-card';
    const h3 = document.createElement('h3'); h3.textContent = v.titulo || 'Video';
    const video = document.createElement('video');
    video.controls = true; video.preload = 'metadata';
    video.muted = true; video.defaultMuted = true; video.volume = 0; video.setAttribute('playsinline', '');
    const source = document.createElement('source'); source.src = v.src; source.type = 'video/mp4';
    video.appendChild(source);
    card.appendChild(h3);
    card.appendChild(video);
    frag.appendChild(card);
  }
  grid.appendChild(frag);
})();

// Render Antes/Después
(function renderAntesDespues(){
  const grid = document.getElementById('comparisons-grid');
  const items = (window.ANTES_DESPUES || []);
  if (!grid || !Array.isArray(items) || items.length === 0) return;

  const frag = document.createDocumentFragment();
  for (const it of items) {
    const card = document.createElement('article');
    card.className = 'card';

    const h3 = document.createElement('h3');
    h3.textContent = it.titulo || 'Proyecto';

    const wrapper = document.createElement('div');
    wrapper.className = 'compare';
    wrapper.style.setProperty('--w', '50%');

    // Base: Después (fondo completo)
    const imgAfterBase = document.createElement('img');
    imgAfterBase.src = it.despues; imgAfterBase.loading = 'lazy'; imgAfterBase.alt = `Después — ${it.titulo || 'Proyecto'} — GALO`;

    // Overlay desde la izquierda: Antes
    const overlay = document.createElement('div');
    overlay.className = 'after'; // usamos la clase existente para el ancho variable
    const imgBeforeOverlay = document.createElement('img');
    imgBeforeOverlay.src = it.antes; imgBeforeOverlay.loading = 'lazy'; imgBeforeOverlay.alt = `Antes — ${it.titulo || 'Proyecto'} — GALO`;
    overlay.appendChild(imgBeforeOverlay);

    const handle = document.createElement('div');
    handle.className = 'handle';

    const labelBefore = document.createElement('div'); labelBefore.className = 'label'; labelBefore.textContent = 'Antes';
    const labelAfter = document.createElement('div'); labelAfter.className = 'label right'; labelAfter.textContent = 'Después';

  wrapper.appendChild(imgAfterBase);
  wrapper.appendChild(overlay);
    wrapper.appendChild(handle);
    wrapper.appendChild(labelBefore);
    wrapper.appendChild(labelAfter);

    // Drag logic
    let isDown = false;
    const start = () => { isDown = true; };
    const end = () => { isDown = false; };
    const move = (clientX) => {
      const rect = wrapper.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const pct = (x / rect.width) * 100;
      wrapper.style.setProperty('--w', pct + '%');
    };
    wrapper.addEventListener('mousedown', (e)=>{ start(); move(e.clientX); });
    window.addEventListener('mouseup', end);
    wrapper.addEventListener('mousemove', (e)=>{ if (isDown) move(e.clientX); });
    wrapper.addEventListener('touchstart', (e)=>{ start(); if (e.touches[0]) move(e.touches[0].clientX); }, {passive:true});
    wrapper.addEventListener('touchmove', (e)=>{ if (e.touches[0]) move(e.touches[0].clientX); }, {passive:true});
    window.addEventListener('touchend', end);

    card.appendChild(h3);
    card.appendChild(wrapper);
    frag.appendChild(card);
  }
  grid.appendChild(frag);
})();

// Videos ya se renderizan dentro de la galería
