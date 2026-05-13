import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LiveStageDisplay from "../components/LiveStageDisplay.jsx";
import StageAccordion, { artistKey } from "../components/StageAccordion.jsx";
import SelectionPill from "../components/SelectionPill.jsx";
import SelectedArtistsSidebar from "../components/SelectedArtistsSidebar.jsx";
import OptimizedSchedule from "../components/OptimizedSchedule.jsx";
import MapView from "../components/MapView.jsx";
import HeroBanner from "../components/HeroBanner.jsx";
import ConflictToast from "../components/ConflictToast.jsx";
import {
  generateTips,
  optimizeSchedule,
} from "../utils/scheduleOptimizer.js";
import { STAGES, schedule } from "../data/schedule.js";

function toMin(t) {
  const [time, mer] = t.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hour = h % 12;
  if (mer === "PM") hour += 12;
  return hour * 60 + m;
}

function artistsOverlap(a, b) {
  if (a.day !== b.day) return false;
  const aStart = toMin(a.startTime);
  let aEnd = toMin(a.endTime);
  if (aEnd <= aStart) aEnd += 1440;
  const bStart = toMin(b.startTime);
  let bEnd = toMin(b.endTime);
  if (bEnd <= bStart) bEnd += 1440;
  return aEnd > bStart && bEnd > aStart;
}

const WEEKEND_META = {
  1: { label: "Weekend One", dates: "April 11–13" },
  2: { label: "Weekend Two", dates: "April 18–20" },
};

const DAYS = ["Friday", "Saturday", "Sunday"];

const storageKey = (weekend) =>
  `plannedCoachella:selectedIds:weekend${weekend}`;

function loadFromUrl(weekend) {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const dayRaw = params.get("day");
    const artistsRaw = params.get("artists");
    if (!dayRaw || !artistsRaw) return null;
    const day =
      dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1).toLowerCase();
    if (!DAYS.includes(day)) return null;
    const names = new Set(
      artistsRaw.split(",").map((n) => decodeURIComponent(n.trim())),
    );
    const ids = new Set();
    const daySchedule = schedule[weekend]?.[day] ?? {};
    for (const stage of STAGES) {
      const sets = daySchedule[stage] ?? [];
      for (const artist of sets) {
        if (names.has(artist.name)) {
          ids.add(artistKey(weekend, day, stage, artist));
        }
      }
    }
    return ids.size > 0 ? { ids, day } : null;
  } catch {
    return null;
  }
}

function loadStoredIds(weekend) {
  try {
    const raw = localStorage.getItem(storageKey(weekend));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr);
  } catch {
    /* fall through */
  }
  return new Set();
}

export default function WeekendPage({ weekend }) {
  const meta = WEEKEND_META[weekend] ?? WEEKEND_META[1];
  const urlBootRef = useRef(null);
  if (urlBootRef.current === null) {
    urlBootRef.current = loadFromUrl(weekend) ?? { ids: null, day: null };
  }
  const urlBoot = urlBootRef.current;
  const [selectedDay, setSelectedDay] = useState(urlBoot.day ?? DAYS[0]);
  const [selectedIds, setSelectedIds] = useState(
    () => urlBoot.ids ?? loadStoredIds(weekend),
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scheduleBuilt, setScheduleBuilt] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const toastIdRef = useRef(0);
  const isFirstSaveRender = useRef(true);

  useEffect(() => {
    if (isFirstSaveRender.current) {
      isFirstSaveRender.current = false;
      return;
    }
    try {
      localStorage.setItem(
        storageKey(weekend),
        JSON.stringify([...selectedIds]),
      );
      setShowSaved(true);
    } catch {
      /* localStorage unavailable — silent fallthrough */
    }
  }, [selectedIds, weekend]);

  useEffect(() => {
    if (!showSaved) return;
    const t = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(t);
  }, [showSaved]);

  useEffect(() => {
    if (urlBoot.ids && urlBoot.ids.size > 0) {
      setScheduleBuilt(true);
      try {
        window.history.replaceState(
          {},
          "",
          window.location.pathname + window.location.hash,
        );
      } catch {
        /* ignore */
      }
    }
    // run once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedArtists = useMemo(() => {
    const out = [];
    const weekendData = schedule[weekend] ?? {};
    for (const day of DAYS) {
      for (const stage of STAGES) {
        const sets = weekendData[day]?.[stage] ?? [];
        for (const artist of sets) {
          const id = artistKey(weekend, day, stage, artist);
          if (selectedIds.has(id)) {
            out.push({ ...artist, day, stage, id });
          }
        }
      }
    }
    return out;
  }, [weekend, selectedIds]);

  const conflictIds = useMemo(() => {
    const result = new Set();
    if (selectedArtists.length === 0) return result;
    const weekendData = schedule[weekend] ?? {};
    for (const day of DAYS) {
      for (const stage of STAGES) {
        const sets = weekendData[day]?.[stage] ?? [];
        for (const artist of sets) {
          const id = artistKey(weekend, day, stage, artist);
          const enriched = { ...artist, day, stage };
          for (const other of selectedArtists) {
            if (other.id === id) continue;
            if (artistsOverlap(enriched, other)) {
              result.add(id);
              break;
            }
          }
        }
      }
    }
    return result;
  }, [weekend, selectedArtists]);

  const toggleArtist = useCallback(
    (id, artist) => {
      const isAdding = !selectedIds.has(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });

      if (isAdding && artist?.day) {
        const conflict = selectedArtists.find((other) =>
          artistsOverlap(artist, other),
        );
        if (conflict) {
          toastIdRef.current += 1;
          setToast({
            a: artist.name,
            b: conflict.name,
            id: toastIdRef.current,
          });
        }
      }
    },
    [selectedIds, selectedArtists],
  );

  const clearAll = useCallback(() => setSelectedIds(new Set()), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const scheduleEvents = useMemo(
    () => optimizeSchedule(selectedArtists),
    [selectedArtists],
  );

  const scheduleTips = useMemo(
    () => generateTips(scheduleEvents),
    [scheduleEvents],
  );

  const buildSchedule = useCallback(() => {
    setScheduleBuilt(true);
    setDrawerOpen(false);
    requestAnimationFrame(() => {
      document
        .getElementById("optimized-schedule")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (selectedIds.size === 0) setScheduleBuilt(false);
  }, [selectedIds]);

  return (
    <>
      <HeroBanner weekend={weekend} label={meta.label} dates={meta.dates} />
      <section className="mx-auto w-full max-w-4xl px-4 pt-10 pb-16 sm:px-6">
      <div
        role="tablist"
        aria-label="Select day"
        className="flex flex-wrap justify-center gap-3"
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedDay(day)}
              className={`min-h-[44px] rounded-full px-5 py-3 font-sans text-sm uppercase tracking-[0.18em] shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-warm-cream sm:px-7 ${
                isSelected
                  ? "bg-gold text-deep-purple shadow-md ring-2 ring-gold/40"
                  : "bg-terracotta text-warm-cream hover:bg-terracotta/90 hover:-translate-y-0.5"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <LiveStageDisplay weekend={weekend} day={selectedDay} />

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => setMapOpen((o) => !o)}
          aria-expanded={mapOpen}
          aria-controls="map-region"
          className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-dusty-rose/60 bg-warm-cream/80 px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-deep-purple shadow-sm transition hover:-translate-y-0.5 hover:border-terracotta hover:bg-sand/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-warm-cream"
        >
          <span aria-hidden="true" className="text-base">
            📍
          </span>
          <span>{mapOpen ? "Hide Map" : "Show Map"}</span>
        </button>
      </div>

      <div id="map-region">
        {mapOpen && <MapView weekend={weekend} day={selectedDay} />}
      </div>

      <div id="schedule-section" className="mt-12 scroll-mt-24">
        <h3 className="mb-4 px-1 font-display text-2xl text-deep-purple">
          Full schedule by stage
        </h3>
        <div className="flex flex-col gap-6">
          {STAGES.map((stage, index) => (
            <div
              key={stage}
              className="animate-slide-in-left"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StageAccordion
                stage={stage}
                weekend={weekend}
                day={selectedDay}
                selectedIds={selectedIds}
                conflictIds={conflictIds}
                onToggleArtist={toggleArtist}
                artists={schedule[weekend]?.[selectedDay]?.[stage] ?? []}
              />
            </div>
          ))}
        </div>
      </div>

      {scheduleBuilt && selectedArtists.length > 0 && (
        <OptimizedSchedule events={scheduleEvents} tips={scheduleTips} />
      )}

      {!drawerOpen && (
        <SelectionPill count={selectedIds.size} onClick={openDrawer} />
      )}

      <SelectedArtistsSidebar
        open={drawerOpen}
        onClose={closeDrawer}
        weekend={weekend}
        selectedIds={selectedIds}
        onRemove={toggleArtist}
        onClear={clearAll}
        onBuild={buildSchedule}
        showSaved={showSaved}
      />

      {toast && (
        <ConflictToast
          key={toast.id}
          a={toast.a}
          b={toast.b}
          onDismiss={dismissToast}
        />
      )}
      </section>
    </>
  );
}
