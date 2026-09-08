# SpideyVerse Explorer & Mission Hub

A cinematic, Marvel-inspired full-stack app: a searchable/filterable character
vault, a live NYC patrol mission board (full CRUD), and a suit upgrades
gallery — all backed by a real REST API.

## Tech stack

- **Frontend:** HTML5, CSS3 (dark red / black / electric-blue glassmorphism
  theme, responsive grid, keyframe animations), vanilla JavaScript.
- **Backend:** Node.js + Express.js.
- **Database:** JSON-file-backed store (`db.js` + `data/store.json`) — the
  "fallback JSON structure" option, so the app runs anywhere with zero native
  modules and zero external services. See **Swapping the database** below to
  move to MongoDB or MySQL.

## A note on character images

Real Marvel character art/photos are copyrighted, so this app can't source or
embed official artwork. Each character instead gets a distinct, auto-generated
avatar from **DiceBear** (a free, open illustration API) via a stable
per-character seed — a real working image URL for every card, just not
official Marvel art. Swap the `image` field in `db.js`/`script.js` for your
own licensed assets if you have them.

## Project structure

```
spideyverse-explorer/
├── server.js          # Express app + all API routes
├── db.js              # JSON-file persistence layer
├── package.json
├── data/
│   └── store.json     # created automatically on first run
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

## Running it locally

```bash
cd spideyverse-explorer
npm install
npm start
```

Open **http://localhost:3000**. `data/store.json` is created automatically on
first run, pre-seeded with 7 characters, 5 suits, and 3 sample missions.
Delete that file any time to reset to the seed data.

If port 3000 is already in use on your machine:
```bash
# macOS/Linux
PORT=3001 npm start
# Windows PowerShell
$env:PORT=3001; npm start
```

## API reference

| Method | Route                 | Description                                    |
|--------|------------------------|-------------------------------------------------|
| GET    | `/api/characters`      | List/search characters (`?query=&role=`)        |
| GET    | `/api/characters/:id`  | Get one character                               |
| POST   | `/api/characters`      | Create a character                              |
| PUT    | `/api/characters/:id`  | Update a character                              |
| DELETE | `/api/characters/:id`  | Delete a character                              |
| GET    | `/api/missions`        | List missions (`?status=`)                      |
| POST   | `/api/missions`        | Create a mission                                |
| PUT    | `/api/missions/:id`    | Update a mission (e.g. change status)           |
| DELETE | `/api/missions/:id`    | Delete a mission                                |
| GET    | `/api/suits`           | List suits                                      |
| POST   | `/api/suits`           | Add a suit                                      |
| DELETE | `/api/suits/:id`       | Remove a suit                                   |
| GET    | `/api/health`          | Health check                                    |

`role` on characters is one of `hero`, `villain`, `variant`. The frontend's
"Villains & Variants" filter button matches both `villain` and `variant` in
one click; "Heroes" matches `hero`.

## Swapping the database

Every route in `server.js` only calls the five functions `db.js` exports
(`getAll`, `getById`, `insert`, `update`, `remove`), so that's the only file
you'd touch:

- **MongoDB:** `npm install mongoose`, define `Character`/`Suit`/`Mission`
  schemas, and reimplement those five functions against `Model.find()`,
  `Model.findById()`, `Model.create()`, `Model.findByIdAndUpdate()`, and
  `Model.findByIdAndDelete()`.
- **MySQL:** `npm install mysql2`, create three tables mirroring the JSON
  shapes (store `abilities` as a JSON column or a join table), and reimplement
  the five functions as `async` queries against a connection pool.

## Content note

All character bios, suit specs, and mission text are original short
descriptions written for this project — no copyrighted text or artwork —
so it's safe to use, edit, and extend freely.
