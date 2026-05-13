# Planned Coachella

> A festival itinerary planner with a desert/boho aesthetic — pick your acts, see conflicts, build an optimized walking schedule, and share it as a link.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License](https://img.shields.io/badge/license-MIT-D4A843)](#license)

![App screenshot placeholder](./docs/screenshot.png)

> _Replace `docs/screenshot.png` with a real screenshot of the home page or a built schedule._

---

## Features

- 🌅 **Hero banner per weekend** — animated sunset gradient, SVG dunes + cacti, gentle parallax
- 🎶 **Live "now playing" stage cards** — auto-updating per stage, with a pulsing live indicator
- 🗺️ **Festival map** — Stadia Maps tiles, custom terracotta/gold pin markers, geolocation with a pulsing user dot
- 📅 **Stage accordions** — full daily lineup per stage, with checkbox selection and inline conflict badges
- ⚠️ **Conflict detection** — non-blocking toast plus persistent badges when two picks overlap
- 🧭 **Optimized schedule timeline** — sets, walks, breaks, and "leave-early" suggestions sorted into a single ordered timeline
- 💡 **Pro Tips** — contextual suggestions (food spots, crowded stages, locker advice) based on your picks
- 📍 **My picks drawer** — bottom-sheet on mobile / right-side drawer on desktop, with per-artist remove and Clear All
- 🔗 **Share via URL** — encode a day's picks into a query string and copy to clipboard; openable links auto-rehydrate the schedule
- 💾 **Auto-save to localStorage** — separate keys per weekend, with a quiet "Saved ✓" indicator
- 📱 **Mobile-responsive** — adapts layout, drawer position, and map height for small screens; all tap targets ≥ 44 px

---

## Tech Stack

- **[React 19](https://react.dev)** with hooks (no class components)
- **[Vite 8](https://vite.dev)** for dev server + build
- **[Tailwind CSS v4](https://tailwindcss.com)** via the `@tailwindcss/vite` plugin (CSS-first `@theme` config — no `tailwind.config.js`)
- **[React Router 7](https://reactrouter.com)** for `/weekend1` and `/weekend2` routes
- **[Leaflet 1.9](https://leafletjs.com) + [react-leaflet 5](https://react-leaflet.js.org)** for the festival map
- **[Stadia Maps](https://stadiamaps.com)** Alidade Smooth tiles (warm/earthy aesthetic)
- **PropTypes** for runtime prop validation on major components
- **ESLint** (react-hooks, react-refresh) — `npm run lint` runs clean

---

## Local Setup

```bash
git clone <repo-url>
cd plannedCoachellaApp
npm install
npm run dev
```

Open the URL Vite prints (typically <http://localhost:5173>).

### Other scripts

```bash
npm run build     # production build → ./dist
npm run preview   # serve the production build locally
npm run lint      # ESLint (CI-friendly; exits non-zero on issues)
```

### Production deployment notes

- **Stadia Maps** — the dev tile URL works from `localhost` without an API key (origin-gated free tier). For production hosting, sign up at [stadiamaps.com](https://stadiamaps.com) and append `?api_key=…` to `TILE_URL` in [src/components/MapView.jsx](src/components/MapView.jsx).
- **Geolocation** requires HTTPS in production (browser security policy). Localhost is exempt.
- **localStorage** is feature-detected and silently no-ops in private browsing modes or when storage is disabled.

---

## Schedule Data

All artist/stage/time data is fully static and lives in [`src/data/schedule.js`](src/data/schedule.js). The shape is:

```js
export const STAGES = [
  "Coachella Stage", "Outdoor Theatre", "Sahara",
  "Mojave", "Gobi", "Sonora", "Yuma",
];

export const DAYS = ["Friday", "Saturday", "Sunday"];

export const schedule = {
  1: {
    Friday: {
      "Coachella Stage": [
        { name: "Honey & The Hive", startTime: "1:00 PM", endTime: "2:00 PM", genre: "indie pop" },
        // ...
      ],
      // ...
    },
    Saturday: { ... },
    Sunday: { ... },
  },
  2: { ... },
};
```

### Swapping in real Coachella data

1. **Match the shape exactly** — every artist needs `name`, `startTime`, `endTime`, and `genre`. Times use 12-hour format with `AM`/`PM` (e.g. `"10:30 PM"`, `"1:00 AM"`). Cross-midnight sets are handled automatically — just keep them in the day they started.
2. **Stage names must match `STAGES`** — these strings are used to look up walk-time entries, stage accent colors, and food-spot tips. Renaming a stage means updating:
   - `STAGES` in `src/data/schedule.js`
   - `RAW_DISTANCES` walk matrix in `src/utils/scheduleOptimizer.js`
   - `STAGE_FOOD_SPOTS` and `CROWDED_STAGES` maps in the same file
   - `STAGE_COORDS` (lat/lng) in `src/components/MapView.jsx`
   - `STAGE_ACCENT` (colors) in `src/components/OptimizedSchedule.jsx`
3. **Both weekends currently share the same `lineup` object** — Coachella historically runs identical lineups across W1 and W2. If a real-world lineup diverges, replace the shared reference with two distinct objects under `schedule[1]` and `schedule[2]`.
4. **Stage coordinates are approximate** — the `STAGE_COORDS` map in [MapView.jsx](src/components/MapView.jsx) was hand-picked around Empire Polo Club (33.6823 N, 116.2380 W) for layout, not surveyed. Replace with real coordinates when you have them.

---

## Project Structure

```
src/
├── App.jsx                  # Router + NavBar
├── main.jsx                 # React entry
├── index.css                # Tailwind v4 @theme + global styles + keyframes
├── pages/
│   ├── Home.jsx
│   └── WeekendPage.jsx      # Per-weekend state, persistence, layout
├── components/
│   ├── HeroBanner.jsx       # Gradient + shimmer + parallax SVG scene
│   ├── NavBar.jsx
│   ├── LiveStageDisplay.jsx # Horizontal scroll of "now/next" stage cards
│   ├── MapView.jsx          # Leaflet map + pins + geolocation
│   ├── StageAccordion.jsx   # Per-stage daily lineup with selection
│   ├── SelectionPill.jsx    # Floating bottom CTA
│   ├── SelectedArtistsSidebar.jsx  # Drawer / bottom-sheet
│   ├── OptimizedSchedule.jsx       # Timeline of sets/walks/breaks/tips
│   └── ConflictToast.jsx    # Bottom-left warning toast
├── data/
│   └── schedule.js          # Mock artist/stage/time data
└── utils/
    ├── scheduleOptimizer.js # Walk matrix, event-array builder, tip generator
    └── artistKey.js         # Composite ID helper
```

---

## Credits

- Map tiles by **[Stadia Maps](https://stadiamaps.com)**, **[OpenMapTiles](https://openmaptiles.org)**, and **[OpenStreetMap](https://openstreetmap.org)** contributors.
- Fonts by **[Google Fonts](https://fonts.google.com)** — _Playfair Display_ (headings) and _Nunito_ (body).
- Lineup, artist names, food vendor names, and walking times are **fictional** — invented for demo purposes. Not affiliated with the real Coachella Valley Music and Arts Festival or Goldenvoice / AEG.
- Built as a learning project; inspired by the visual language of southern California desert sunsets.

## License

MIT. Add a `LICENSE` file with the standard MIT text if you intend to publish — this repo doesn't ship one by default.
