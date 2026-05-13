import { useEffect, useState } from "react";

function ShareIcon({ size = 16 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  );
}

function buildShareUrl(events) {
  const firstDay = events.find((e) => e.type === "set")?.day;
  if (!firstDay) return null;
  const names = events
    .filter((e) => e.type === "set" && e.day === firstDay)
    .map((e) => e.name);
  if (names.length === 0) return null;
  const dayParam = encodeURIComponent(firstDay.toLowerCase());
  const artistsParam = names.map(encodeURIComponent).join(",");
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?day=${dayParam}&artists=${artistsParam}`;
}

const STAGE_ACCENT = {
  "Coachella Stage": { color: "#C4622D", tint: "rgba(196,98,45,0.12)" },
  "Outdoor Theatre": { color: "#7D9B76", tint: "rgba(125,155,118,0.12)" },
  Sahara: { color: "#D4A843", tint: "rgba(212,168,67,0.16)" },
  Mojave: { color: "#3D2B56", tint: "rgba(61,43,86,0.10)" },
  Gobi: { color: "#D4A5A5", tint: "rgba(212,165,165,0.20)" },
  Sonora: { color: "#8B3F1F", tint: "rgba(139,63,31,0.12)" },
  Yuma: { color: "#5B6B8C", tint: "rgba(91,107,140,0.12)" },
};
const FALLBACK_ACCENT = { color: "#3D2B56", tint: "rgba(61,43,86,0.08)" };
const stageAccent = (stage) => STAGE_ACCENT[stage] ?? FALLBACK_ACCENT;

function WalkIcon({ size = 14 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="13" cy="4.5" r="1.75" fill="currentColor" stroke="none" />
      <path d="M9 21 L11.5 14 L9 11 L11 7 L14 9 L17 11" />
      <path d="M11.5 14 L13.5 18 L14 22" />
      <path d="M11.5 14 L9 16" />
    </svg>
  );
}

function ForkKnifeIcon({ size = 14 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3 L6 10 M4 3 L4 8 L8 8 L8 3 M6 10 L6 21" />
      <path d="M18 3 C 14.5 5 14.5 11 18 12 L18 21" />
    </svg>
  );
}

function MugIcon({ size = 14 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 10 L16 10 L16 17 C 16 19 14 20 12 20 L9 20 C 7 20 5 19 5 17 Z" />
      <path d="M16 12 C 19 12 20 13.25 20 14.5 C 20 16 19 17 16 17" />
      <path d="M8 4 C 8 5.5 10 5.5 10 7" />
      <path d="M12 4 C 12 5.5 14 5.5 14 7" />
    </svg>
  );
}

function BulbIcon({ size = 14 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.5 19 L14.5 19 M10.5 22 L13.5 22" />
      <path d="M12 3 C 7.5 3 5.5 7 6.5 10.5 C 7.5 12.5 8.5 13.5 9.5 16 L14.5 16 C 15.5 13.5 16.5 12.5 17.5 10.5 C 18.5 7 16.5 3 12 3 Z" />
    </svg>
  );
}

function MusicIcon({ size = 14 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="7" cy="17" r="2.4" />
      <circle cx="17" cy="14" r="2.4" />
      <path
        d="M9.4 17 L9.4 7 L19.4 5 L19.4 14"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Marker({ children, color, textColor = "#FDF6EC" }) {
  return (
    <span
      aria-hidden="true"
      className="absolute left-[12px] top-3.5 z-10 grid h-6 w-6 place-items-center rounded-full shadow-sm"
      style={{
        backgroundColor: color,
        color: textColor,
        boxShadow: "0 0 0 3px var(--color-warm-cream, #FDF6EC)",
      }}
    >
      {children}
    </span>
  );
}

function SetRow({ event, index = 0 }) {
  const accent = stageAccent(event.stage);
  return (
    <li
      className="animate-fade-up relative pl-14"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Marker color={accent.color}>
        <MusicIcon size={12} />
      </Marker>
      <article
        className="rounded-2xl border border-dusty-rose/30 border-l-4 p-4 shadow-sm backdrop-blur-sm"
        style={{
          borderLeftColor: accent.color,
          background: `linear-gradient(90deg, ${accent.tint}, rgba(253,246,236,0.85) 60%)`,
        }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span
            className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.22em]"
            style={{ color: accent.color }}
          >
            {event.stage}
          </span>
          <span className="font-sans text-xs tabular-nums text-deep-purple/55">
            {event.startTime} – {event.endTime}
          </span>
        </div>
        <h4 className="mt-1 font-display text-2xl leading-tight text-deep-purple">
          {event.name}
        </h4>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {event.genre && (
            <span className="rounded-full border border-dusty-rose/50 bg-dusty-rose/20 px-2.5 py-0.5 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-deep-purple">
              {event.genre}
            </span>
          )}
          {event.conflict && (
            <span className="rounded-full bg-terracotta/20 px-2.5 py-0.5 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-terracotta">
              ⚠ Overlaps {event.conflictsWith.join(", ")}
            </span>
          )}
        </div>
      </article>
    </li>
  );
}

function WalkRow({ event, index = 0 }) {
  return (
    <li
      className="animate-fade-up relative pl-14"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Marker color="rgba(125,155,118,0.85)" textColor="#FDF6EC">
        <WalkIcon size={12} />
      </Marker>
      <div className="flex items-center gap-2 rounded-full bg-sand/45 px-4 py-2 font-sans text-xs text-deep-purple/70">
        <span>
          Walk to{" "}
          <span className="font-semibold text-deep-purple">
            {event.toStage}
          </span>{" "}
          · ~{event.walkMinutes} min
          {event.tight && (
            <span className="ml-2 font-semibold text-terracotta">(tight)</span>
          )}
        </span>
      </div>
    </li>
  );
}

function BreakRow({ event, index = 0 }) {
  const isFood = event.kind === "food";
  return (
    <li
      className="animate-fade-up relative pl-14"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Marker color="#C4622D">
        {isFood ? <ForkKnifeIcon size={12} /> : <MugIcon size={12} />}
      </Marker>
      <div className="rounded-xl border-l-4 border-l-terracotta bg-terracotta/15 px-4 py-3 font-sans text-sm text-deep-purple/85">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.2em] text-terracotta">
            {isFood ? "Food + reset" : "Quick break"}
          </span>
          <span className="tabular-nums text-deep-purple/60">
            {event.startTime} – {event.endTime} · {event.durationMinutes} min
          </span>
        </p>
        <p className="mt-1 text-deep-purple/75">{event.message}</p>
      </div>
    </li>
  );
}

function SuggestionRow({ event, index = 0 }) {
  return (
    <li
      className="animate-fade-up relative pl-14"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Marker color="#D4A843" textColor="#3D2B56">
        <BulbIcon size={12} />
      </Marker>
      <div className="rounded-xl border border-gold/50 bg-gold/15 px-4 py-3 font-sans text-sm shadow-sm">
        <p className="flex items-start gap-2 text-deep-purple">
          <span className="mt-0.5 text-gold">
            <BulbIcon size={16} />
          </span>
          <span>{event.message}</span>
        </p>
      </div>
    </li>
  );
}

function EventRow({ event, index }) {
  switch (event.type) {
    case "set":
      return <SetRow event={event} index={index} />;
    case "walk":
      return <WalkRow event={event} index={index} />;
    case "break":
      return <BreakRow event={event} index={index} />;
    case "suggestion":
      return <SuggestionRow event={event} index={index} />;
    default:
      return null;
  }
}

function groupByDay(events) {
  const days = [];
  let cursor = 0;
  for (const ev of events) {
    const d = ev.day ?? "Schedule";
    if (!days.length || days.at(-1).day !== d) {
      days.push({ day: d, events: [] });
    }
    days.at(-1).events.push({ event: ev, index: cursor++ });
  }
  return days;
}

export default function OptimizedSchedule({ events, tips = [] }) {
  const [shareToast, setShareToast] = useState(null);

  useEffect(() => {
    if (!shareToast) return;
    const t = setTimeout(() => setShareToast(null), 2500);
    return () => clearTimeout(t);
  }, [shareToast]);

  if (!events || events.length === 0) return null;

  const handleShare = async () => {
    const url = buildShareUrl(events);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast({ kind: "success", message: "Link copied! 🔗" });
    } catch {
      setShareToast({
        kind: "error",
        message: "Couldn't copy — select the URL in the address bar to share.",
      });
    }
  };

  const setCount = events.filter((e) => e.type === "set").length;
  const conflictCount = events.filter(
    (e) => e.type === "set" && e.conflict,
  ).length;
  const stageCount = new Set(
    events.filter((e) => e.type === "set").map((e) => e.stage),
  ).size;
  const days = groupByDay(events);

  return (
    <section
      id="optimized-schedule"
      className="mt-14 scroll-mt-24"
      aria-label="Optimized schedule"
    >
      <header className="mb-6 text-center">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-terracotta">
          Your build
        </p>
        <h2 className="mt-2 font-display text-4xl text-deep-purple">
          My Coachella
        </h2>
        <p className="mt-2 font-sans text-sm text-deep-purple/70">
          {setCount} {setCount === 1 ? "set" : "sets"} · {stageCount}{" "}
          {stageCount === 1 ? "stage" : "stages"}
          {conflictCount > 0 && (
            <>
              {" · "}
              <span className="font-semibold text-terracotta">
                {conflictCount} overlap{conflictCount === 1 ? "" : "s"}
              </span>
            </>
          )}
        </p>
        <div
          className="mx-auto mt-4 flex max-w-xs items-center gap-3"
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-dusty-rose to-transparent" />
          <span className="text-gold">✦</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-dusty-rose to-transparent" />
        </div>
      </header>

      {tips.length > 0 && (
        <section className="mb-8" aria-label="Pro tips">
          <h3 className="mb-3 px-1 font-sans text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
            Pro Tips
          </h3>
          <ul className="space-y-2.5">
            {tips.map((tip) => (
              <li
                key={tip.id}
                className="flex items-start gap-3 rounded-xl border border-gold/40 border-l-4 border-l-gold bg-warm-cream/85 px-4 py-3 shadow-sm"
              >
                <span className="mt-0.5 shrink-0 text-gold" aria-hidden="true">
                  <BulbIcon size={16} />
                </span>
                <p className="font-sans text-sm text-deep-purple">
                  {tip.message}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-8">
        {days.map(({ day, events: dayEvents }) => (
          <div key={day}>
            <h3 className="mb-3 font-display text-2xl text-deep-purple">
              {day}
            </h3>
            <ol className="relative space-y-3">
              <div
                aria-hidden="true"
                className="absolute left-6 top-2 bottom-2 w-px bg-sage/35"
              />
              {dayEvents.map(({ event, index }) => (
                <EventRow
                  key={`${event.type}-${index}`}
                  event={event}
                  index={index}
                />
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-deep-purple px-6 py-3 font-sans text-sm font-bold uppercase tracking-[0.2em] text-warm-cream shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-deep-purple/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-warm-cream"
        >
          <ShareIcon />
          <span>Share My Schedule</span>
        </button>
      </div>

      {shareToast && (
        <div
          role="status"
          aria-live="polite"
          className="animate-toast-in fixed bottom-6 left-6 right-6 z-50 max-w-sm rounded-2xl border-2 border-warm-cream bg-deep-purple px-5 py-4 font-sans text-sm text-warm-cream shadow-2xl shadow-deep-purple/50 sm:right-auto"
        >
          {shareToast.message}
        </div>
      )}
    </section>
  );
}
