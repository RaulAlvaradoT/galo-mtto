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
(async function renderGaleria(){
  const grid = document.getElementById('galeria-grid');
  const fotos = (window.GALERIA_IMAGENES || []);
  const videos = (window.VIDEOS || []);
  let manifest = null;
  // try to load manifest for srcset/placeholder support
  try {
    const res = await fetch('galeria/manifest.json');
    if (res.ok) manifest = await res.json();
  } catch (err) {
    manifest = null;
  }
  if (!grid || (fotos.length === 0 && videos.length === 0)) return;

  const frag = document.createDocumentFragment();
  for (const it of fotos) {
    const card = document.createElement('article');
    card.className = 'card media-card';

    const h3 = document.createElement('h3');
    h3.textContent = it.titulo || 'Trabajo realizado';

    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'media';

    // Prefer WebP via <picture> and provide responsive srcset and LQIP placeholder if manifest exists
    const picture = document.createElement('picture');
    const webpSource = document.createElement('source');
    webpSource.type = 'image/webp';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = it.titulo ? `${it.titulo} — GALO` : 'Trabajo GALO';

    const fileKey = it.src.split('/').pop();
    if (manifest && manifest[fileKey]) {
      const entry = manifest[fileKey];
      // build srcset strings
      const webpSrcset = entry.variants.map(v => `${encodeURI(v.webp)} ${v.width}w`).join(', ');
      const jpgSrcset = entry.variants.map(v => `${encodeURI(v.jpeg)} ${v.width}w`).join(', ');
      webpSource.srcset = webpSrcset;
      picture.appendChild(webpSource);
      img.src = encodeURI(entry.variants[entry.variants.length - 1].jpeg);
      img.setAttribute('data-srcset', jpgSrcset);
      img.setAttribute('sizes', '(min-width:980px) 33vw, (min-width:640px) 48vw, 92vw');
      // placeholder
      mediaWrap.style.backgroundImage = `url('${entry.placeholder}')`;
      mediaWrap.classList.add('loading');
      img.addEventListener('load', () => { mediaWrap.classList.remove('loading'); img.style.opacity = '1'; });
      img.style.opacity = '0';
      picture.appendChild(img);
    } else {
      if (it.src_webp) {
        webpSource.srcset = encodeURI(it.src_webp);
        picture.appendChild(webpSource);
      }
      img.src = encodeURI(it.src);
      picture.appendChild(img);
    }

    mediaWrap.appendChild(picture);

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
  // After appending, set srcset on imgs that used data-srcset (defer to avoid layout thrash)
  requestAnimationFrame(()=>{
    for (const img of grid.querySelectorAll('img[data-srcset]')) {
      img.srcset = img.getAttribute('data-srcset') || '';
    }
  });
})();

// Render Antes/Después
(async function renderAntesDespues(){
  const grid = document.getElementById('comparisons-grid');
  let manifest = null;
  try {
    const res = await fetch('galeria/manifest.json');
    if (res.ok) manifest = await res.json();
  } catch (e) {
    manifest = null;
  }
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
    // Use picture for after image
    const afterPicture = document.createElement('picture');
    const afterWebp = document.createElement('source');
    afterWebp.type = 'image/webp';
    // prefer manifest variants if available
    try {
      const despuesKey = it.despues.split('/').pop();
      if (manifest && manifest[despuesKey]) {
        afterWebp.srcset = manifest[despuesKey].variants.map(v=>`${encodeURI(v.webp)} ${v.width}w`).join(', ');
      } else if (it.despues_webp) {
        afterWebp.srcset = encodeURI(it.despues_webp);
      }
    } catch (e) {
      if (it.despues_webp) afterWebp.srcset = encodeURI(it.despues_webp);
    }
    afterPicture.appendChild(afterWebp);
    imgAfterBase.src = encodeURI(it.despues); imgAfterBase.loading = 'lazy'; imgAfterBase.alt = `Después — ${it.titulo || 'Proyecto'} — GALO`;
    afterPicture.appendChild(imgAfterBase);

    // Overlay desde la izquierda: Antes
    const overlay = document.createElement('div');
    overlay.className = 'after'; // usamos la clase existente para el ancho variable
    const imgBeforeOverlay = document.createElement('img');
    const beforePicture = document.createElement('picture');
    const beforeWebp = document.createElement('source');
    beforeWebp.type = 'image/webp';
    try {
      const antesKey = it.antes.split('/').pop();
      if (manifest && manifest[antesKey]) {
        beforeWebp.srcset = manifest[antesKey].variants.map(v=>`${encodeURI(v.webp)} ${v.width}w`).join(', ');
      } else if (it.antes_webp) {
        beforeWebp.srcset = encodeURI(it.antes_webp);
      }
    } catch (e) {
      if (it.antes_webp) beforeWebp.srcset = encodeURI(it.antes_webp);
    }
    beforePicture.appendChild(beforeWebp);
    imgBeforeOverlay.src = encodeURI(it.antes); imgBeforeOverlay.loading = 'lazy'; imgBeforeOverlay.alt = `Antes — ${it.titulo || 'Proyecto'} — GALO`;
    beforePicture.appendChild(imgBeforeOverlay);
    overlay.appendChild(beforePicture);

    const handle = document.createElement('div');
    handle.className = 'handle';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', '50');

    const labelBefore = document.createElement('div'); labelBefore.className = 'label'; labelBefore.textContent = 'Antes';
    const labelAfter = document.createElement('div'); labelAfter.className = 'label right'; labelAfter.textContent = 'Después';

  wrapper.appendChild(afterPicture);
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
      handle.setAttribute('aria-valuenow', String(Math.round(pct)));
    };
    wrapper.addEventListener('mousedown', (e)=>{ start(); move(e.clientX); });
    window.addEventListener('mouseup', end);
    wrapper.addEventListener('mousemove', (e)=>{ if (isDown) move(e.clientX); });
    wrapper.addEventListener('touchstart', (e)=>{ start(); if (e.touches[0]) move(e.touches[0].clientX); }, {passive:true});
    wrapper.addEventListener('touchmove', (e)=>{ if (e.touches[0]) move(e.touches[0].clientX); }, {passive:true});
    window.addEventListener('touchend', end);

    // Keyboard support for the handle (ArrowLeft / ArrowRight)
    handle.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const cur = parseFloat(wrapper.style.getPropertyValue('--w')) || 50;
      const delta = e.key === 'ArrowLeft' ? -5 : 5;
      const next = Math.min(100, Math.max(0, cur + delta));
      wrapper.style.setProperty('--w', next + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(next)));
    });

    card.appendChild(h3);
    card.appendChild(wrapper);
    frag.appendChild(card);
  }
  grid.appendChild(frag);
})();

// Videos ya se renderizan dentro de la galería

// Enhancements: accessible lightbox and keyboard navigation
(function enhanceGallery(){
  const grid = document.getElementById('galeria-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('article.card'));
  const mediaIndex = [];

  cards.forEach((card, i) => {
    // make focusable and keyboard actionable
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
    card.addEventListener('click', () => openLightbox(i));

    // extract media info
    const video = card.querySelector('video source');
    if (video) {
      mediaIndex.push({ type: 'video', src: video.src, title: card.querySelector('h3')?.textContent || '' });
      return;
    }
    const img = card.querySelector('img');
    const webp = card.querySelector('source')?.srcset || null;
    if (img) {
      mediaIndex.push({ type: 'image', src: img.src, src_webp: webp, title: card.querySelector('h3')?.textContent || '' });
      return;
    }
    mediaIndex.push({ type: 'unknown', title: card.querySelector('h3')?.textContent || '' });
  });

  // create lightbox element
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox__overlay" tabindex="-1"></div>
    <div class="lightbox__content" role="dialog" aria-modal="true" aria-label="Visor de galería">
      <button class="lightbox__close" aria-label="Cerrar">✕</button>
      <div class="lightbox__stage" ></div>
      <button class="lightbox__nav lightbox__prev" aria-label="Anterior">‹</button>
      <button class="lightbox__nav lightbox__next" aria-label="Siguiente">›</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const stage = lightbox.querySelector('.lightbox__stage');
  const btnClose = lightbox.querySelector('.lightbox__close');
  const btnPrev = lightbox.querySelector('.lightbox__prev');
  const btnNext = lightbox.querySelector('.lightbox__next');
  const overlay = lightbox.querySelector('.lightbox__overlay');

  let current = 0;

  function renderItem(index) {
    stage.innerHTML = '';
    const item = mediaIndex[index];
    if (!item) return;
    const title = document.createElement('div');
    title.className = 'lightbox__title';
    title.textContent = item.title || '';
    if (item.type === 'video') {
      const v = document.createElement('video');
      v.controls = true; v.autoplay = false; v.preload = 'metadata'; v.setAttribute('playsinline','');
      const src = document.createElement('source'); src.src = item.src; src.type = 'video/mp4';
      v.appendChild(src);
      stage.appendChild(title);
      stage.appendChild(v);
      v.focus();
      return;
    }
    if (item.type === 'image') {
      const picture = document.createElement('picture');
      if (item.src_webp) {
        const s = document.createElement('source'); s.type = 'image/webp'; s.srcset = item.src_webp; picture.appendChild(s);
      }
      const img = document.createElement('img'); img.src = item.src; img.alt = item.title || 'Imagen'; img.loading = 'eager';
      picture.appendChild(img);
      stage.appendChild(title);
      stage.appendChild(picture);
      img.focus?.();
      return;
    }
    stage.textContent = item.title || '';
  }

  function openLightbox(index) {
    current = index;
    renderItem(current);
    lightbox.classList.add('open');
    btnClose.focus();
    document.addEventListener('keydown', onKey);
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    stage.innerHTML = '';
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  }
  function showNext() { current = (current + 1) % mediaIndex.length; renderItem(current); }
  function showPrev() { current = (current - 1 + mediaIndex.length) % mediaIndex.length; renderItem(current); }

  btnClose.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);
  btnNext.addEventListener('click', showNext);
  btnPrev.addEventListener('click', showPrev);

})();
