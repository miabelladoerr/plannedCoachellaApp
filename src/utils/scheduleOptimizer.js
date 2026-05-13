import { STAGES } from "../data/schedule.js";

// Inter-stage walk times in minutes. Symmetric; each pair listed once and
// mirrored into a lookup table at module init.
const RAW_DISTANCES = [
  ["Coachella Stage", "Outdoor Theatre", 2],
  ["Coachella Stage", "Sahara", 8],
  ["Coachella Stage", "Mojave", 7],
  ["Coachella Stage", "Gobi", 8],
  ["Coachella Stage", "Sonora", 12],
  ["Coachella Stage", "Yuma", 10],
  ["Outdoor Theatre", "Sahara", 7],
  ["Outdoor Theatre", "Mojave", 6],
  ["Outdoor Theatre", "Gobi", 7],
  ["Outdoor Theatre", "Sonora", 11],
  ["Outdoor Theatre", "Yuma", 9],
  ["Sahara", "Mojave", 3],
  ["Sahara", "Gobi", 5],
  ["Sahara", "Sonora", 10],
  ["Sahara", "Yuma", 7],
  ["Mojave", "Gobi", 3],
  ["Mojave", "Sonora", 8],
  ["Mojave", "Yuma", 6],
  ["Gobi", "Sonora", 9],
  ["Gobi", "Yuma", 8],
  ["Sonora", "Yuma", 6],
];

export const WALK_MINUTES = (() => {
  const m = {};
  for (const stage of STAGES) m[stage] = { [stage]: 0 };
  for (const [a, b, mins] of RAW_DISTANCES) {
    m[a][b] = mins;
    m[b][a] = mins;
  }
  return m;
})();

export function walkTime(from, to) {
  if (from === to) return 0;
  return WALK_MINUTES[from]?.[to] ?? 5;
}

function parseTimeToMinutes(timeStr) {
  const [time, mer] = timeStr.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hour = h % 12;
  if (mer === "PM") hour += 12;
  return hour * 60 + m;
}

function getSetWindow(set) {
  const startMinutes = parseTimeToMinutes(set.startTime);
  let endMinutes = parseTimeToMinutes(set.endTime);
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  return { startMinutes, endMinutes };
}

export function formatTime(mins) {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const min = wrapped % 60;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(min).padStart(2, "0")} ${period}`;
}

const DAY_ORDER = { Friday: 0, Saturday: 1, Sunday: 2 };
function dayRank(day) {
  return DAY_ORDER[day] ?? 99;
}

function setEvent(s) {
  return {
    type: "set",
    day: s.day,
    stage: s.stage,
    name: s.name,
    genre: s.genre,
    id: s.id,
    startTime: s.startTime,
    endTime: s.endTime,
    startMinutes: s.startMinutes,
    endMinutes: s.endMinutes,
    conflict: !!s.conflict,
    conflictsWith: s.conflictsWith ?? [],
  };
}

function buildDayEvents(sets, day) {
  if (sets.length === 0) return [];

  // Full pairwise pass so non-consecutive overlaps (A engulfs B and C, but B
  // and C don't overlap each other) get flagged on every party.
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const a = sets[i];
      const b = sets[j];
      if (a.endMinutes > b.startMinutes && b.endMinutes > a.startMinutes) {
        a.conflict = true;
        b.conflict = true;
        a.conflictsWith = a.conflictsWith ?? [];
        b.conflictsWith = b.conflictsWith ?? [];
        if (!a.conflictsWith.includes(b.name)) a.conflictsWith.push(b.name);
        if (!b.conflictsWith.includes(a.name)) b.conflictsWith.push(a.name);
      }
    }
  }

  const events = [];
  let current = null;
  let setsSinceBreak = 0;

  for (const set of sets) {
    const isOverlap = current && set.startMinutes < current.endMinutes;

    if (isOverlap) {
      events.push(setEvent(set));
      setsSinceBreak += 1;
      if (set.endMinutes > current.endMinutes) current = set;
      continue;
    }

    if (current) {
      const gap = set.startMinutes - current.endMinutes;
      const walkMin = walkTime(current.stage, set.stage);
      const sameStage = current.stage === set.stage;
      const isTight = walkMin > 0 && gap <= walkMin + 5;
      const remainingAfterWalk = gap - walkMin;

      if (isTight) {
        const message =
          gap < walkMin
            ? `Leave ${current.name} ${walkMin - gap} min early — ${walkMin}-min walk to ${set.stage}, only ${gap} min between sets.`
            : `Tight transition — head out the moment ${current.name} ends. ${walkMin}-min walk, ${gap}-min gap.`;
        events.push({
          type: "suggestion",
          kind: "leave-early",
          day,
          fromArtist: current.name,
          toArtist: set.name,
          fromStage: current.stage,
          toStage: set.stage,
          walkMinutes: walkMin,
          gapMinutes: gap,
          message,
        });
      }

      if (!sameStage) {
        const walkStart = current.endMinutes;
        const walkEnd = walkStart + walkMin;
        events.push({
          type: "walk",
          day,
          fromStage: current.stage,
          toStage: set.stage,
          fromArtist: current.name,
          toArtist: set.name,
          startMinutes: walkStart,
          endMinutes: walkEnd,
          startTime: formatTime(walkStart),
          endTime: formatTime(walkEnd),
          walkMinutes: walkMin,
          gapMinutes: gap,
          tight: isTight,
        });
      }

      if (remainingAfterWalk > 30) {
        const breakStart = current.endMinutes + walkMin;
        events.push({
          type: "break",
          day,
          kind: "food",
          startMinutes: breakStart,
          endMinutes: set.startMinutes,
          startTime: formatTime(breakStart),
          endTime: formatTime(set.startMinutes),
          durationMinutes: remainingAfterWalk,
          message: `Long gap (${remainingAfterWalk} min) — grab food, hydrate, restroom.`,
        });
        setsSinceBreak = 0;
      } else if (setsSinceBreak >= 3 && remainingAfterWalk >= 15) {
        const breakStart = current.endMinutes + walkMin;
        events.push({
          type: "break",
          day,
          kind: "rest",
          startMinutes: breakStart,
          endMinutes: set.startMinutes,
          startTime: formatTime(breakStart),
          endTime: formatTime(set.startMinutes),
          durationMinutes: remainingAfterWalk,
          message: `Quick reset (${remainingAfterWalk} min) — restroom, water, snack.`,
        });
        setsSinceBreak = 0;
      }
    }

    events.push(setEvent(set));
    setsSinceBreak += 1;
    current = set;
  }

  return events;
}

export function optimizeSchedule(artists) {
  if (!Array.isArray(artists) || artists.length === 0) return [];

  const buckets = new Map();
  for (const a of artists) {
    if (!a.startTime || !a.endTime || !a.stage || !a.name) continue;
    const win = getSetWindow(a);
    const enriched = {
      ...a,
      startMinutes: win.startMinutes,
      endMinutes: win.endMinutes,
    };
    const day = a.day ?? "__none__";
    if (!buckets.has(day)) buckets.set(day, []);
    buckets.get(day).push(enriched);
  }

  const orderedDays = Array.from(buckets.keys()).sort(
    (a, b) => dayRank(a) - dayRank(b),
  );
  const events = [];
  for (const day of orderedDays) {
    const sets = buckets
      .get(day)
      .sort((a, b) => a.startMinutes - b.startMinutes);
    events.push(...buildDayEvents(sets, day === "__none__" ? undefined : day));
  }
  return events;
}

export default optimizeSchedule;
