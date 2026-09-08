// public/script.js
const API = '/api';

/* =========================================================
   FALLBACK CHARACTER DATASET
   Used only if the backend is unreachable, so the vault still
   renders something. The live data (source of truth) comes from
   GET /api/characters, seeded from this same set server-side.
   ========================================================= */
const FALLBACK_CHARACTERS = [
  {
    id: 1, name: 'Peter Parker', alias: 'Spider-Man (Classic)', universe: 'Earth-616',
    role: 'hero', powerLevel: 88,
    abilities: ['Wall-crawling', 'Enhanced strength', 'Danger sense', 'Web-slinging'],
    bio: 'A science-minded photographer bitten by a radioactive spider, balancing everyday life in Queens with a nightly patrol over Manhattan.',
    image: 'https://i.pinimg.com/originals/e8/41/76/e84176b926d840ced3b73a6df22f0260.jpg'
  },
  {
    id: 2, name: 'Peter Parker', alias: 'Iron Spider', universe: 'Earth-616',
    role: 'variant', powerLevel: 93,
    abilities: ['Retractable spider-arms', 'Nanotech self-repair', 'Enhanced durability', 'Glide flaps'],
    bio: 'A Stark-engineered nanotech upgrade of the classic suit, with four mechanical spider-arms and gold-plated armor panels.',
    image: 'https://wallpaperaccess.com/full/1653533.jpg'
  },
  {
    id: 3, name: 'Miles Morales', alias: 'Spider-Man', universe: 'Earth-1610',
    role: 'hero', powerLevel: 85,
    abilities: ['Bio-electric venom strike', 'Camouflage', 'Wall-crawling', 'Enhanced strength'],
    bio: 'A Brooklyn teenager whose own spider-bite granted him a unique set of stealth and shock abilities alongside the usual wall-crawling toolkit.',
    image: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'
  },
  {
    id: 4, name: 'Gwen Stacy', alias: 'Ghost-Spider', universe: 'Earth-65',
    role: 'hero', powerLevel: 82,
    abilities: ['Wall-crawling', 'Acrobatics', 'Musical drumming', 'Web-slinging'],
    bio: 'A gifted drummer and detective\u2019s daughter who became her world\u2019s spider-powered protector, moving with dancer-like precision.',
    image: 'https://i.pinimg.com/736x/13/bb/30/13bb30247b92f9581c6f3d6c2306e7ae.jpg'
  },
  {
    id: 5, name: 'Eddie Brock', alias: 'Venom', universe: 'Earth-616',
    role: 'villain', powerLevel: 84,
    abilities: ['Symbiote strength', 'Shapeshifting', 'Regeneration', 'Camouflage'],
    bio: 'A disgraced journalist bonded to an alien symbiote, gaining monstrous power, a set of fangs, and a grudge to match.',
    image: 'https://image.tmdb.org/t/p/w780/2uNW4WbgBXL25BAbXGLnLqX71Sw.jpg'
  },
  {
    id: 6, name: 'Norman Osborn', alias: 'Green Goblin', universe: 'Earth-616',
    role: 'villain', powerLevel: 78,
    abilities: ['Superhuman strength', 'Glider combat', 'Pumpkin bombs', 'Genius intellect'],
    bio: 'A brilliant industrialist whose experimental serum unlocked strength and stamina alongside violent instability.',
    image: 'https://tse4.mm.bing.net/th/id/OIP.0LWrWGqqCnF8fiokYftKXwHaEK?r=0&pid=Api&P=0&h=180'
  },
  {
    id: 7, name: 'Otto Octavius', alias: 'Doctor Octopus', universe: 'Earth-616',
    role: 'villain', powerLevel: 80,
    abilities: ['Mechanical tentacle arms', 'Genius-level intellect', 'Enhanced durability'],
    bio: 'A nuclear physicist fused with four mechanical arms after a lab accident, driven by ambition and wounded pride.',
    image: 'https://tse2.mm.bing.net/th/id/OIP.sd0maR6K6d_KHKMkDjYF3wHaEK?r=0&pid=Api&P=0&h=180'
  }
];

/* ---------- Utilities ---------- */
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add('hidden'), 2400);
}

/* ---------- Audio feedback ---------- */
const SOUND_URLS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  whoosh: 'https://assets.mixkit.co/active_storage/sfx/1114/1114-preview.mp3'
};
const soundCache = {};
const INSTAGRAM_URL = 'https://www.instagram.com/';
const THEME_TRACK_URL = './Banjaare _ Barsaat x Spider-Ma.mp3';
const MULTIVERSE_QUOTES = [
  'With great power comes great responsibility.',
  'Anyone can win a fight. When the real hero helps someone, they win.',
  'No matter how buried it gets, or lost you feel, you must promise me that you will hold on to hope.',
  'The hardest thing about this job is you cannot always save everybody.'
];

function playSound(type) {
  const source = SOUND_URLS[type];
  if (!source) return;

  try {
    if (!soundCache[type]) {
      soundCache[type] = new Audio(source);
      soundCache[type].preload = 'auto';
    }
    const sound = soundCache[type].cloneNode();
    sound.volume = type === 'click' ? 0.22 : 0.3;
    sound.play().catch(() => {});
  } catch (_) {
    // Audio is enhancement-only and must never interrupt the interface.
  }
}

function setupEngagementLayer() {
  document.querySelectorAll('[data-instagram-link]').forEach((link) => {
    link.href = INSTAGRAM_URL;
  });

  const quote = MULTIVERSE_QUOTES[Math.floor(Math.random() * MULTIVERSE_QUOTES.length)];
  document.getElementById('quote-text').textContent = `“${quote}”`;

  const themeAudio = document.getElementById('theme-audio');
  const audioWidget = document.querySelector('.audio-widget');
  const audioPlay = document.getElementById('audio-play');
  const audioMute = document.getElementById('audio-mute');
  themeAudio.src = THEME_TRACK_URL;

  audioPlay.addEventListener('click', async () => {
    if (themeAudio.paused) {
      try {
        await themeAudio.play();
        audioWidget.classList.add('is-playing');
        audioPlay.textContent = 'Ⅱ';
        audioPlay.setAttribute('aria-label', 'Pause theme audio');
        document.getElementById('audio-label').textContent = 'Now playing';
      } catch (_) {
        showToast('Theme audio is unavailable right now');
      }
    } else {
      themeAudio.pause();
      audioWidget.classList.remove('is-playing');
      audioPlay.textContent = '▶';
      audioPlay.setAttribute('aria-label', 'Play theme audio');
      document.getElementById('audio-label').textContent = 'Theme audio';
    }
  });

  audioMute.addEventListener('click', () => {
    themeAudio.muted = !themeAudio.muted;
    audioMute.textContent = themeAudio.muted ? '🔇' : '🔊';
    audioMute.setAttribute('aria-label', themeAudio.muted ? 'Unmute theme audio' : 'Mute theme audio');
  });

  setupWebShooter();
  setupFeedback();
}

function setupWebShooter() {
  const canvas = document.getElementById('web-shooter-canvas');
  const context = canvas.getContext('2d');
  const hitCount = document.getElementById('web-hit-count');
  let hits = 0;
  let shots = [];

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function animate() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    shots = shots.filter((shot) => shot.progress < 1);
    shots.forEach((shot) => {
      shot.progress += 0.075;
      const progress = Math.min(shot.progress, 1);
      const x = shot.startX + (shot.endX - shot.startX) * progress;
      const y = shot.startY + (shot.endY - shot.startY) * progress;
      context.beginPath();
      context.moveTo(shot.startX, shot.startY);
      context.lineTo(x, y);
      context.strokeStyle = `rgba(238, 241, 248, ${1 - progress * 0.5})`;
      context.lineWidth = 1.5;
      context.shadowBlur = 12;
      context.shadowColor = '#3ba7ff';
      context.stroke();
      context.shadowBlur = 0;
      context.beginPath();
      context.arc(shot.endX, shot.endY, 4 + progress * 7, 0, Math.PI * 2);
      context.strokeStyle = `rgba(59, 167, 255, ${1 - progress})`;
      context.stroke();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('click', (event) => {
    if (event.target.closest('.audio-widget, .reel-bubble, .feedback-panel, .modal')) return;
    hits += 1;
    hitCount.textContent = hits;
    shots.push({ startX: window.innerWidth / 2, startY: window.innerHeight + 12, endX: event.clientX, endY: event.clientY, progress: 0 });
    playSound('whoosh');
  });
  resizeCanvas();
  animate();
}

function setupFeedback() {
  const form = document.getElementById('feedback-form');
  const stars = [...document.querySelectorAll('.star-btn')];
  let rating = 0;

  stars.forEach((star) => star.addEventListener('click', () => {
    rating = Number(star.dataset.rating);
    stars.forEach((item) => item.classList.toggle('selected', Number(item.dataset.rating) <= rating));
  }));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!rating) {
      showToast('Choose a star rating first');
      return;
    }
    const reports = JSON.parse(localStorage.getItem('spideyverse-feedback') || '[]');
    reports.push({ rating, feedback: document.getElementById('feedback-text').value.trim(), createdAt: Date.now() });
    localStorage.setItem('spideyverse-feedback', JSON.stringify(reports.slice(-20)));
    form.reset();
    rating = 0;
    stars.forEach((star) => star.classList.remove('selected'));
    showToast('Field report received. Thank you, web-slinger.');
  });
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

/* ---------- Navigation ---------- */
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

function goToSection(name) {
  sections.forEach((s) => s.classList.toggle('active', s.id === name));
  navLinks.forEach((l) => l.classList.toggle('active', l.dataset.section === name));
  history.replaceState(null, '', `#${name}`);
}

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (!link.classList.contains('active')) playSound('whoosh');
    goToSection(link.dataset.section);
  });
});

document.addEventListener('click', (e) => {
  if (e.target.closest('button')) playSound('click');
});

window.addEventListener('DOMContentLoaded', () => {
  const initial = window.location.hash.replace('#', '') || 'home';
  goToSection(['home', 'vault', 'missions', 'suits'].includes(initial) ? initial : 'home');
});

/* ================= CHARACTER VAULT ================= */
const ROLE_LABEL = { hero: 'Hero', villain: 'Villain', variant: 'Variant' };
let allCharacters = [];
let activeFilter = '';   // '', 'hero', 'villain-variant'
let activeQuery = '';

function characterMatchesFilter(c) {
  if (!activeFilter) return true;
  if (activeFilter === 'hero') return c.role === 'hero';
  if (activeFilter === 'villain-variant') return c.role === 'villain' || c.role === 'variant';
  return true;
}

function characterCard(c) {
  const abilities = c.abilities.slice(0, 3).map((a) => `<span class="tag">${a}</span>`).join('');
  return el(`
    <article class="char-card">
      <div class="char-card-media" style="--accent:${accentForRole(c.role)}">
        <img src="${c.image}" alt="${c.alias} cinematic poster" loading="lazy" />
      </div>
      <div class="char-card-body">
        <div class="char-card-top">
          <span class="role-badge role-${c.role}">${ROLE_LABEL[c.role] || c.role}</span>
        </div>
        <h3 class="char-name">${c.alias}</h3>
        <p class="char-alias">${c.name} · ${c.universe}</p>
        <p class="char-bio">${c.bio}</p>
        <div class="power-bar-track"><div class="power-bar-fill" style="width:${c.powerLevel}%"></div></div>
        <div class="tag-row">${abilities}</div>
      </div>
    </article>
  `);
}

function accentForRole(role) {
  if (role === 'hero') return 'rgba(59,167,255,0.55)';
  if (role === 'villain') return 'rgba(230,38,44,0.55)';
  return 'rgba(240,166,60,0.5)';
}

function renderVault() {
  const grid = document.getElementById('vault-grid');
  const q = activeQuery.toLowerCase();
  const filtered = allCharacters.filter((c) => {
    const matchesQuery = !q ||
      c.name.toLowerCase().includes(q) ||
      c.alias.toLowerCase().includes(q) ||
      c.universe.toLowerCase().includes(q);
    return matchesQuery && characterMatchesFilter(c);
  });

  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.appendChild(el(`<div class="empty-state">No matches in the archive. Try a different name or filter.</div>`));
    return;
  }
  filtered.forEach((c) => grid.appendChild(characterCard(c)));
}

let searchSoundTimer;
document.getElementById('search-input').addEventListener('input', (e) => {
  activeQuery = e.target.value.trim();
  renderVault();
  clearTimeout(searchSoundTimer);
  if (activeQuery) searchSoundTimer = setTimeout(() => playSound('whoosh'), 280);
});

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.role;
    renderVault();
  });
});

async function loadCharacters() {
  try {
    allCharacters = await api('/characters');
  } catch (err) {
    showToast('Backend unreachable — showing offline character data');
    allCharacters = FALLBACK_CHARACTERS;
  }
  document.getElementById('stat-characters').textContent = allCharacters.length;
  renderVault();
}

/* ================= MISSIONS ================= */
const COLUMN_MAP = { Pending: 'col-pending', 'In Progress': 'col-progress', Completed: 'col-completed' };

function missionCard(m) {
  const card = el(`
    <div class="mission-card" data-id="${m.id}">
      <div class="mission-meta">
        <span class="threat-badge threat-${m.threatLevel}">${m.threatLevel}</span>
      </div>
      <h4>${m.title}</h4>
      <p class="m-location">📍 ${m.location}</p>
      ${m.description ? `<p class="m-desc">${m.description}</p>` : ''}
      <div class="mission-actions">
        <select class="status-select">
          <option ${m.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option ${m.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option ${m.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
        <button class="icon-btn-sm delete-mission" type="button">Delete</button>
      </div>
    </div>
  `);

  card.querySelector('.status-select').addEventListener('change', async (e) => {
    try {
      await api(`/missions/${m.id}`, { method: 'PUT', body: JSON.stringify({ status: e.target.value }) });
      showToast('Mission status updated');
      loadMissions();
    } catch (err) {
      showToast(err.message);
    }
  });

  card.querySelector('.delete-mission').addEventListener('click', async () => {
    try {
      await api(`/missions/${m.id}`, { method: 'DELETE' });
      showToast('Mission closed out');
      loadMissions();
    } catch (err) {
      showToast(err.message);
    }
  });

  return card;
}

async function loadMissions() {
  let missions = [];
  try {
    missions = await api('/missions');
  } catch (err) {
    showToast(err.message);
    return;
  }
  document.getElementById('stat-missions').textContent = missions.length;

  Object.values(COLUMN_MAP).forEach((id) => (document.getElementById(id).innerHTML = ''));
  const grouped = { Pending: [], 'In Progress': [], Completed: [] };
  missions.forEach((m) => grouped[m.status]?.push(m));

  Object.entries(grouped).forEach(([status, list]) => {
    const container = document.getElementById(COLUMN_MAP[status]);
    if (list.length === 0) {
      container.appendChild(el(`<div class="column-empty">No missions here.</div>`));
    } else {
      list.forEach((m) => container.appendChild(missionCard(m)));
    }
  });
}

const missionModal = document.getElementById('mission-modal');
document.getElementById('new-mission-btn').addEventListener('click', () => missionModal.classList.remove('hidden'));
document.getElementById('modal-close').addEventListener('click', () => missionModal.classList.add('hidden'));
missionModal.addEventListener('click', (e) => { if (e.target === missionModal) missionModal.classList.add('hidden'); });

document.getElementById('mission-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('m-title').value.trim(),
    location: document.getElementById('m-location').value.trim(),
    threatLevel: document.getElementById('m-threat').value,
    status: document.getElementById('m-status').value,
    description: document.getElementById('m-description').value.trim()
  };
  try {
    await api('/missions', { method: 'POST', body: JSON.stringify(payload) });
    playSound('whoosh');
    showToast('Mission added to the board');
    e.target.reset();
    missionModal.classList.add('hidden');
    loadMissions();
  } catch (err) {
    showToast(err.message);
  }
});

/* ================= SUITS ================= */
function statLine(label, value, accent) {
  return `
    <div class="stat-line">
      <span>${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${value}%; background:${accent}"></div></div>
      <span>${value}</span>
    </div>
  `;
}

function suitCard(s) {
  const abilities = s.abilities.map((a) => `<span class="tag">${a}</span>`).join('');
  return el(`
    <article class="suit-card" style="--accent:${s.accentColor}">
      <div class="suit-card-head">
        <div>
          <h3 class="suit-name">${s.name}</h3>
          <span class="suit-universe">${s.universe}</span>
        </div>
      </div>
      <p class="suit-desc">${s.description}</p>
      <div class="stat-row">
        ${statLine('Durability', s.durability, s.accentColor)}
        ${statLine('Agility', s.agility, s.accentColor)}
        ${statLine('Tech', s.tech, s.accentColor)}
      </div>
      <div class="tag-row">${abilities}</div>
    </article>
  `);
}

async function loadSuits() {
  try {
    const suits = await api('/suits');
    document.getElementById('stat-suits').textContent = suits.length;
    const grid = document.getElementById('suits-grid');
    grid.innerHTML = '';
    suits.forEach((s) => grid.appendChild(suitCard(s)));
  } catch (err) {
    showToast(err.message);
  }
}

/* ================= INIT ================= */
setupEngagementLayer();
loadCharacters();
loadMissions();
loadSuits();
