import { useId, useState } from "react";

function Chevron({ open }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-300 ease-out ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="M5.5 9 L12 15.25 L18.5 9" />
      <circle cx="12" cy="4.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function StageAccordion({
  stage,
  artists = [],
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const headingId = useId();
  const count = artists.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-dusty-rose/40 border-l-4 border-l-sage bg-warm-cream shadow-sm">
      <h3 id={headingId} className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-sand/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/70"
        >
          <span className="flex items-baseline gap-3">
            <span className="font-display text-2xl leading-tight text-deep-purple">
              {stage}
            </span>
            <span className="font-sans text-xs uppercase tracking-[0.18em] text-deep-purple/50">
              {count} {count === 1 ? "set" : "sets"}
            </span>
          </span>
          <span className="text-sage">
            <Chevron open={open} />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        className={`overflow-hidden transition-all duration-500 ease-out ${
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {count > 0 ? (
          <ul className="divide-y divide-dusty-rose/30 border-t border-dusty-rose/30">
            {artists.map((a) => (
              <li
                key={`${a.name}-${a.startTime}`}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-3"
              >
                <span className="font-sans font-semibold text-deep-purple">
                  {a.name}
                </span>
                <span className="font-sans text-sm tabular-nums text-deep-purple/60">
                  {a.startTime} – {a.endTime}
                </span>
                <span className="ml-auto rounded-full border border-dusty-rose/50 bg-dusty-rose/25 px-3 py-0.5 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-deep-purple">
                  {a.genre}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-dusty-rose/30 px-6 py-4 font-sans text-sm text-deep-purple/60">
            No sets scheduled.
          </p>
        )}
      </div>
    </div>
  );
}
