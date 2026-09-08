// db.js
// A tiny synchronous JSON-file "database" configured for Vercel (/tmp storage fallback).

const fs = require('fs');
const path = require('path');

// Vercel has a read-only filesystem except for the /tmp directory
const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const DEFAULT_DATA = {
  characters: [
    {
      id: 1,
      name: 'Peter Parker',
      alias: 'Spider-Man (Classic)',
      universe: 'Earth-616',
      role: 'hero',
      powerLevel: 88,
      abilities: ['Wall-crawling', 'Enhanced strength', 'Danger sense', 'Web-slinging'],
      bio: 'A science-minded photographer bitten by a radioactive spider, balancing everyday life in Queens with a nightly patrol over Manhattan.',
      image: 'https://i.pinimg.com/originals/e8/41/76/e84176b926d840ced3b73a6df22f0260.jpg'
    },
    {
      id: 2,
      name: 'Peter Parker',
      alias: 'Iron Spider',
      universe: 'Earth-616',
      role: 'variant',
      powerLevel: 93,
      abilities: ['Retractable spider-arms', 'Nanotech self-repair', 'Enhanced durability', 'Glide flaps'],
      bio: 'A Stark-engineered nanotech upgrade of the classic suit, with four mechanical spider-arms and gold-plated armor panels.',
      image: 'https://wallpaperaccess.com/full/1653533.jpg'
    },
    {
      id: 3,
      name: 'Miles Morales',
      alias: 'Spider-Man',
      universe: 'Earth-1610',
      role: 'hero',
      powerLevel: 85,
      abilities: ['Bio-electric venom strike', 'Camouflage', 'Wall-crawling', 'Enhanced strength'],
      bio: 'A Brooklyn teenager whose own spider-bite granted him a unique set of stealth and shock abilities alongside the usual wall-crawling toolkit.',
      image: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'
    },
    {
      id: 4,
      name: 'Gwen Stacy',
      alias: 'Ghost-Spider',
      universe: 'Earth-65',
      role: 'hero',
      powerLevel: 82,
      abilities: ['Wall-crawling', 'Acrobatics', 'Musical drumming', 'Web-slinging'],
      bio: 'A gifted drummer and detective’s daughter who became her world’s spider-powered protector, moving with dancer-like precision.',
      image: 'https://i.pinimg.com/736x/13/bb/30/13bb30247b92f9581c6f3d6c2306e7ae.jpg'
    },
    {
      id: 5,
      name: 'Eddie Brock',
      alias: 'Venom',
      universe: 'Earth-616',
      role: 'villain',
      powerLevel: 84,
      abilities: ['Symbiote strength', 'Shapeshifting', 'Regeneration', 'Camouflage'],
      bio: 'A disgraced journalist bonded to an alien symbiote, gaining monstrous power, a set of fangs, and a grudge to match.',
      image: 'https://image.tmdb.org/t/p/w780/2uNW4WbgBXL25BAbXGLnLqX71Sw.jpg'
    },
    {
      id: 6,
      name: 'Norman Osborn',
      alias: 'Green Goblin',
      universe: 'Earth-616',
      role: 'villain',
      powerLevel: 78,
      abilities: ['Superhuman strength', 'Glider combat', 'Pumpkin bombs', 'Genius intellect'],
      bio: 'A brilliant industrialist whose experimental serum unlocked strength and stamina alongside violent instability.',
      image: 'https://tse4.mm.bing.net/th/id/OIP.0LWrWGqqCnF8fiokYftKXwHaEK?r=0&pid=Api&P=0&h=180'
    },
    {
      id: 7,
      name: 'Otto Octavius',
      alias: 'Doctor Octopus',
      universe: 'Earth-616',
      role: 'villain',
      powerLevel: 80,
      abilities: ['Mechanical tentacle arms', 'Genius-level intellect', 'Enhanced durability'],
      bio: 'A nuclear physicist fused with four mechanical arms after a lab accident, driven by ambition and wounded pride.',
      image: 'https://tse2.mm.bing.net/th/id/OIP.sd0maR6K6d_KHKMkDjYF3wHaEK?r=0&pid=Api&P=0&h=180'
    }
  ],

  suits: [
    {
      id: 1,
      name: 'Classic Suit',
      universe: 'Earth-616',
      description: 'The original red-and-blue design: simple, flexible, and built for maximum mobility.',
      abilities: ['Web-fluid cartridges', 'Reinforced lenses', 'Lightweight weave'],
      durability: 55, agility: 90, tech: 30,
      accentColor: '#e6262c'
    },
    {
      id: 2,
      name: 'Advanced Suit',
      universe: 'Earth-616',
      description: 'A Stark-inspired upgrade with nanotech-woven fabric and a built-in heads-up display.',
      abilities: ['Impact webbing', 'HUD overlay', 'Thermal regulation', 'Recon drone'],
      durability: 75, agility: 85, tech: 80,
      accentColor: '#c62828'
    },
    {
      id: 3,
      name: 'Iron Spider Armor',
      universe: 'Earth-616',
      description: 'A gold-and-red nanotech suit with retractable mechanical arms and enhanced plating.',
      abilities: ['Retractable spider-arms', 'Nanotech self-repair', 'Enhanced durability', 'Glide flaps'],
      durability: 92, agility: 78, tech: 95,
      accentColor: '#c9a227'
    },
    {
      id: 4,
      name: '2099 Suit',
      universe: 'Earth-928',
      description: 'A sleek, high-tension fabric suit built for a future New York, optimized for gliding and stealth.',
      abilities: ['Retractable talons', 'Bio-organic web wings', 'Enhanced night vision'],
      durability: 70, agility: 88, tech: 85,
      accentColor: '#0d1b2a'
    },
    {
      id: 5,
      name: 'Noir Suit',
      universe: 'Earth-90214',
      description: 'A trench-coat era design built for the shadows of a Depression-era Manhattan.',
      abilities: ['Silent movement', 'Low-light adaptation', 'Improvised gadgetry'],
      durability: 60, agility: 82, tech: 20,
      accentColor: '#1c1c1c'
    }
  ],

  missions: [
    {
      id: 1,
      title: 'Rooftop pursuit near Queensboro Bridge',
      location: 'Queens, NYC',
      threatLevel: 'Medium',
      status: 'In Progress',
      description: 'Track a drone-delivered package theft ring operating along the bridge rooftops.',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Warehouse break-in, Hell’s Kitchen',
      location: 'Hell’s Kitchen, NYC',
      threatLevel: 'High',
      status: 'Pending',
      description: 'Reports of unusual energy readings from a disused warehouse near 10th Ave.',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Subway signal disruption',
      location: 'Midtown, NYC',
      threatLevel: 'Low',
      status: 'Completed',
      description: 'A prank device jammed the L-train signals; disarmed and handed to NYPD.',
      createdAt: new Date().toISOString()
    }
  ],

  nextIds: { characters: 8, suits: 6, missions: 4 }
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readData() {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* ---------- Generic collection helpers ---------- */
function getAll(collection) {
  return readData()[collection];
}

function getById(collection, id) {
  return readData()[collection].find((item) => item.id === Number(id));
}

function insert(collection, record) {
  const data = readData();
  const id = data.nextIds[collection]++;
  const newRecord = { id, ...record };
  data[collection].push(newRecord);
  writeData(data);
  return newRecord;
}

function update(collection, id, patch) {
  const data = readData();
  const idx = data[collection].findIndex((item) => item.id === Number(id));
  if (idx === -1) return null;
  data[collection][idx] = { ...data[collection][idx], ...patch };
  writeData(data);
  return data[collection][idx];
}

function remove(collection, id) {
  const data = readData();
  const before = data[collection].length;
  data[collection] = data[collection].filter((item) => item.id !== Number(id));
  writeData(data);
  return data[collection].length < before;
}

module.exports = { getAll, getById, insert, update, remove };
