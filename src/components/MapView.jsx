import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import PropTypes from "prop-types";
import { STAGES, schedule } from "../data/schedule.js";

const VENUE_CENTER = [33.6823, -116.238];

// Approximate stage positions inside Empire Polo Club. Offsets are illustrative,
// not surveyed — swap in real coords if/when you have them.
const STAGE_COORDS = {
  "Coachella Stage": [33.6833, -116.239],
  "Outdoor Theatre": [33.6816, -116.2393],
  Sahara: [33.6831, -116.2367],
  Mojave: [33.6822, -116.238],
  Gobi: [33.6827, -116.2375],
  Sonora: [33.6815, -116.2369],
  Yuma: [33.6819, -116.2361],
};

const TILE_URL =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
  '&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
  '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const PIN_SVG = `
<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M18 1 C 8.5 1, 1 8.5, 1 18 C 1 28, 18 43, 18 43 C 18 43, 35 28, 35 18 C 35 8.5, 27.5 1, 18 1 Z"
        fill="#C4622D" stroke="#FDF6EC" stroke-width="2" stroke-linejoin="round" />
  <circle cx="18" cy="16.5" r="5.5" fill="#D4A843" />
</svg>`;

function createStageIcon(stageName) {
  return L.divIcon({
    className: "stage-pin-icon",
    html: `
      <div role="img" aria-label="${stageName} stage" style="position:relative; width:120px; height:72px;">
        <div style="position:absolute; left:42px; top:0;">${PIN_SVG}</div>
        <div style="
          position:absolute; left:50%; top:46px; transform: translateX(-50%);
          white-space: nowrap;
          background: rgba(253,246,236,0.95);
          color: #3D2B56;
          padding: 2px 8px;
          border-radius: 10px;
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: 1px solid rgba(196,98,45,0.35);
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
        ">${stageName}</div>
      </div>
    `,
    iconSize: [120, 72],
    iconAnchor: [60, 44],
    popupAnchor: [0, -44],
  });
}

const USER_ICON = L.divIcon({
  className: "user-loc-icon",
  html: `
    <div role="img" aria-label="Your current location" style="position:relative; width:24px; height:24px;">
      <div class="animate-user-loc-pulse" style="
        position:absolute; top:0; left:0; width:24px; height:24px;
        background: rgba(59,130,246,0.4);
        border-radius:50%;
      "></div>
      <div style="
        position:absolute; top:6px; left:6px; width:12px; height:12px;
        background:#3B82F6; border:2px solid #FDF6EC;
        border-radius:50%;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.25);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function parseTimeToMinutes(t) {
  const [time, mer] = t.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hour = h % 12;
  if (mer === "PM") hour += 12;
  return hour * 60 + m;
}

function getSetWindow(set) {
  const start = parseTimeToMinutes(set.startTime);
  let end = parseTimeToMinutes(set.endTime);
  if (end <= start) end += 1440;
  return { start, end };
}

function getFestivalNow() {
  const d = new Date();
  let m = d.getHours() * 60 + d.getMinutes();
  if (m < 5 * 60) m += 1440;
  return m;
}

function findCurrentOrNext(sets, now) {
  let current = null;
  let next = null;
  let earliestFuture = Infinity;
  for (const s of sets) {
    const w = getSetWindow(s);
    if (w.start <= now && now < w.end) {
      current = s;
    } else if (w.start > now && w.start < earliestFuture) {
      earliestFuture = w.start;
      next = s;
    }
  }
  return { current, next };
}

function CrosshairIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeOpacity="0.2"
      />
      <path
        d="M12 3 a 9 9 0 0 1 9 9"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MapView({ weekend, day }) {
  const mapRef = useRef(null);
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [now, setNow] = useState(getFestivalNow);

  useEffect(() => {
    const id = setInterval(() => setNow(getFestivalNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!geoError) return;
    const t = setTimeout(() => setGeoError(null), 4000);
    return () => clearTimeout(t);
  }, [geoError]);

  const stageIcons = useMemo(() => {
    const map = {};
    for (const stage of STAGES) map[stage] = createStageIcon(stage);
    return map;
  }, []);

  const handleLocate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation not supported");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
        mapRef.current?.flyTo([latitude, longitude], 17, { duration: 1.2 });
        setLocating(false);
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location permission denied"
            : err.code === 3
              ? "Location request timed out"
              : "Couldn't pinpoint your location";
        setGeoError(msg);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return (
    <section className="mt-10" aria-label="Festival map">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
        <h3 className="font-display text-2xl text-deep-purple">Festival map</h3>
        <span className="font-sans text-xs uppercase tracking-[0.2em] text-deep-purple/70">
          Empire Polo Club · Indio
        </span>
      </header>

      <div className="relative h-[250px] overflow-hidden rounded-2xl border-2 border-gold/40 shadow-sm md:h-[420px]">
        <MapContainer
          ref={mapRef}
          center={VENUE_CENTER}
          zoom={16}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTR} detectRetina />
          {STAGES.map((stage) => {
            const coords = STAGE_COORDS[stage];
            if (!coords) return null;
            const sets = schedule[weekend]?.[day]?.[stage] ?? [];
            const { current, next } = findCurrentOrNext(sets, now);
            const upcoming = current ?? next;
            return (
              <Marker
                key={stage}
                position={coords}
                icon={stageIcons[stage]}
                alt={`${stage} stage`}
                title={stage}
              >
                <Popup>
                  <div className="map-popup">
                    <p className="map-popup-stage">{stage}</p>
                    {upcoming ? (
                      <>
                        <p className="map-popup-label">
                          {current ? "Now playing" : "Up next"}
                        </p>
                        <p className="map-popup-name">{upcoming.name}</p>
                        <p className="map-popup-time">
                          {upcoming.startTime} – {upcoming.endTime}
                        </p>
                      </>
                    ) : (
                      <p className="map-popup-empty">No more sets today.</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {userPos && (
            <Marker
              position={userPos}
              icon={USER_ICON}
              interactive={false}
              alt="Your current location"
            />
          )}
        </MapContainer>

        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          aria-label="Show my location"
          className="absolute right-3 top-3 z-[1000] grid h-11 w-11 place-items-center rounded-full border border-dusty-rose/40 bg-warm-cream text-deep-purple shadow-md transition hover:bg-sand focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locating ? <SpinnerIcon /> : <CrosshairIcon />}
        </button>

        {geoError && (
          <div
            role="status"
            className="absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-deep-purple/90 px-4 py-2 font-sans text-xs text-warm-cream shadow-lg"
          >
            {geoError}
          </div>
        )}
      </div>
    </section>
  );
}

MapView.propTypes = {
  weekend: PropTypes.oneOf([1, 2]).isRequired,
  day: PropTypes.oneOf(["Friday", "Saturday", "Sunday"]).isRequired,
};
