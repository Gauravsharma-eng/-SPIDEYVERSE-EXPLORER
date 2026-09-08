// server.js
// SpideyVerse Explorer & Mission Hub — backend
//
// Express app exposing REST endpoints for characters, missions, and suits.
// Data persists to a JSON file (db.js) so the app runs with zero external
// services. Swap db.js for a MongoDB/Mongoose or MySQL/mysql2 layer later —
// every route below only calls the five functions db.js exports, so that's
// the only file that would need to change.

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];
const VALID_THREATS = ['Low', 'Medium', 'High', 'Critical'];
const VALID_ROLES = ['hero', 'villain', 'variant'];

/* =========================================================
   CHARACTERS  /api/characters
   ========================================================= */

// GET /api/characters?query=&role=
app.get('/api/characters', (req, res) => {
  const { query = '', role = '' } = req.query;
  let characters = db.getAll('characters');

  if (query) {
    const q = query.toLowerCase();
    characters = characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.alias.toLowerCase().includes(q) ||
        c.universe.toLowerCase().includes(q)
    );
  }
  if (role) {
    characters = characters.filter((c) => c.role === role);
  }

  res.json(characters);
});

app.get('/api/characters/:id', (req, res) => {
  const character = db.getById('characters', req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  res.json(character);
});

app.post('/api/characters', (req, res) => {
  const { name, alias, universe, role, bio } = req.body;
  if (!name || !alias || !universe || !role || !bio) {
    return res.status(400).json({ error: 'name, alias, universe, role, and bio are required' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of ${VALID_ROLES.join(', ')}` });
  }
  const created = db.insert('characters', {
    name,
    alias,
    universe,
    role,
    powerLevel: req.body.powerLevel ?? 50,
    abilities: req.body.abilities ?? [],
    bio,
    image:
      req.body.image ||
      'https://image.tmdb.org/t/p/w780/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg'
  });
  res.status(201).json(created);
});

app.put('/api/characters/:id', (req, res) => {
  const updated = db.update('characters', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Character not found' });
  res.json(updated);
});

app.delete('/api/characters/:id', (req, res) => {
  const ok = db.remove('characters', req.params.id);
  if (!ok) return res.status(404).json({ error: 'Character not found' });
  res.status(204).send();
});

/* =========================================================
   MISSIONS  /api/missions
   ========================================================= */

app.get('/api/missions', (req, res) => {
  const { status = '' } = req.query;
  let missions = db.getAll('missions');
  if (status) missions = missions.filter((m) => m.status === status);
  missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(missions);
});

app.get('/api/missions/:id', (req, res) => {
  const mission = db.getById('missions', req.params.id);
  if (!mission) return res.status(404).json({ error: 'Mission not found' });
  res.json(mission);
});

app.post('/api/missions', (req, res) => {
  const { title, location } = req.body;
  if (!title || !location) {
    return res.status(400).json({ error: 'title and location are required' });
  }
  const threatLevel = VALID_THREATS.includes(req.body.threatLevel) ? req.body.threatLevel : 'Medium';
  const status = VALID_STATUSES.includes(req.body.status) ? req.body.status : 'Pending';

  const created = db.insert('missions', {
    title,
    location,
    threatLevel,
    status,
    description: req.body.description || '',
    createdAt: new Date().toISOString()
  });
  res.status(201).json(created);
});

app.put('/api/missions/:id', (req, res) => {
  const patch = { ...req.body };
  if (patch.status && !VALID_STATUSES.includes(patch.status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` });
  }
  if (patch.threatLevel && !VALID_THREATS.includes(patch.threatLevel)) {
    return res.status(400).json({ error: `threatLevel must be one of ${VALID_THREATS.join(', ')}` });
  }
  const updated = db.update('missions', req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Mission not found' });
  res.json(updated);
});

app.delete('/api/missions/:id', (req, res) => {
  const ok = db.remove('missions', req.params.id);
  if (!ok) return res.status(404).json({ error: 'Mission not found' });
  res.status(204).send();
});

/* =========================================================
   SUITS  /api/suits
   ========================================================= */

app.get('/api/suits', (req, res) => {
  res.json(db.getAll('suits'));
});

app.get('/api/suits/:id', (req, res) => {
  const suit = db.getById('suits', req.params.id);
  if (!suit) return res.status(404).json({ error: 'Suit not found' });
  res.json(suit);
});

app.post('/api/suits', (req, res) => {
  const { name, universe, description } = req.body;
  if (!name || !universe || !description) {
    return res.status(400).json({ error: 'name, universe, and description are required' });
  }
  const created = db.insert('suits', {
    name,
    universe,
    description,
    abilities: req.body.abilities ?? [],
    durability: req.body.durability ?? 50,
    agility: req.body.agility ?? 50,
    tech: req.body.tech ?? 50,
    accentColor: req.body.accentColor || '#3ba7ff'
  });
  res.status(201).json(created);
});

app.delete('/api/suits/:id', (req, res) => {
  const ok = db.remove('suits', req.params.id);
  if (!ok) return res.status(404).json({ error: 'Suit not found' });
  res.status(204).send();
});

/* =========================================================
   MISC
   ========================================================= */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback for any other GET request
app.get('/*splat', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🕷️  SpideyVerse Explorer & Mission Hub running at http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && !process.env.PORT) {
      console.warn(`Port ${port} is busy; trying ${port + 1}.`);
      startServer(port + 1);
      return;
    }
    throw error;
  });
}

startServer(PORT);
