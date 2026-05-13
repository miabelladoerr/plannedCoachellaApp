import { useEffect, useMemo, useState } from "react";
import { STAGES, schedule } from "../data/schedule.js";

function parseTimeToMinutes(timeStr) {
  const [time, mer] = timeStr.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hour = h % 12;
  if (mer === "PM") hour += 12;
  return hour * 60 + m;
}

function getSetWindow(set) {
  const start = parseTimeToMinutes(set.startTime);
  let end = parseTimeToMinutes(set.endTime);
  // Sets that cross midnight (e.g. 10:30 PM – 1:00 AM): bump end into day+1.
  if (end <= start) end += 24 * 60;
  return { start, end };
}

// Real wall-clock mapped onto the festival day. Real-now between 0–5 AM is
// treated as the late-night tail of the previous festival day so headliners
// ending at "1:00 AM" still resolve as live.
function getFestivalNow() {
  const d = new Date();
  let minutes = d.getHours() * 60 + d.getMinutes();
  if (minutes < 5 * 60) minutes += 24 * 60;
  return minutes;
}

function findCurrentOrNext(sets, now) {
  let current = null;
  let next = null;
  let earliestFuture = Infinity;
  for (const set of sets) {
    const { start, end } = getSetWindow(set);
    if (start <= now && now < end) {
      current = set;
    } else if (start > now && start < earliestFuture) {
      earliestFuture = start;
      next = set;
    }
  }
  return { current, next };
}

export default function LiveStageDisplay({ weekend, day }) {
  const [now, setNow] = useState(getFestivalNow);

  useEffect(() => {
    const id = setInterval(() => setNow(getFestivalNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  const cards = useMemo(() => {
    const daySchedule = schedule[weekend]?.[day] ?? {};
    return STAGES.map((stage) => {
      const sets = daySchedule[stage] ?? [];
      const { current, next } = findCurrentOrNext(sets, now);
      return { stage, artist: current ?? next, isLive: !!current };
    });
  }, [weekend, day, now]);

  return (
    <section className="mt-10" aria-label={`Live stages for ${day}`}>
      <div className="mb-4 flex items-baseline justify-between px-1">
        <h3 className="font-display text-2xl text-deep-purple">
          Live by stage
        </h3>
        <span className="font-sans text-xs uppercase tracking-[0.2em] text-deep-purple/50">
          {day}
        </span>
      </div>

      <div
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4"
        role="list"
      >
        {cards.map(({ stage, artist, isLive }) => (
          <StageCard
            key={stage}
            stage={stage}
            artist={artist}
            isLive={isLive}
          />
        ))}
      </div>
    </section>
  );
}

function StageCard({ stage, artist, isLive }) {
  return (
    <article
      role="listitem"
      className="w-72 shrink-0 snap-start rounded-2xl border-2 border-gold bg-sand p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <h4 className="font-display text-2xl leading-tight text-deep-purple">
        {stage}
      </h4>

      {artist ? (
        <>
          <div className="mt-3 flex items-center gap-2">
            {isLive ? (
              <>
                <span
                  className="relative flex h-2.5 w-2.5"
                  aria-hidden="true"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-terracotta" />
                </span>
                <span className="animate-pulse font-sans text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
                  Now playing
                </span>
              </>
            ) : (
              <span className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-sage">
                Up next
              </span>
            )}
          </div>

          <p className="mt-2 font-sans text-lg font-semibold text-deep-purple">
            {artist.name}
          </p>
          <p className="font-sans text-sm text-deep-purple/70">
            {artist.startTime} – {artist.endTime}
          </p>
          <p className="mt-1 font-sans text-[0.7rem] uppercase tracking-[0.15em] text-deep-purple/55">
            {artist.genre}
          </p>
        </>
      ) : (
        <p className="mt-3 font-sans text-sm text-deep-purple/60">
          No more sets today.
        </p>
      )}
    </article>
  );
}
