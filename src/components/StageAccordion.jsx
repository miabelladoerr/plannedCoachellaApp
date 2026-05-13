import { useId, useState } from "react";

export function artistKey(weekend, day, stage, artist) {
  return `w${weekend}|${day}|${stage}|${artist.name}|${artist.startTime}`;
}

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

function CheckMark() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10.5 L8.5 14.5 L16 6.5" />
    </svg>
  );
}

export default function StageAccordion({
  stage,
  artists = [],
  weekend,
  day,
  selectedIds,
  onToggleArtist,
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
            {artists.map((a) => {
              const id = artistKey(weekend, day, stage, a);
              const isSelected = selectedIds?.has(id) ?? false;
              return (
                <li key={id}>
                  <label
                    className={`flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3 transition-colors ${
                      isSelected ? "bg-gold/15" : "hover:bg-sand/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={isSelected}
                      onChange={() => onToggleArtist?.(id, a)}
                      aria-label={`Select ${a.name}, ${a.startTime} to ${a.endTime}`}
                    />
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-gold/70 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-warm-cream ${
                        isSelected
                          ? "border-gold bg-gold/10"
                          : "border-deep-purple/25 bg-warm-cream"
                      }`}
                    >
                      {isSelected && <CheckMark />}
                    </span>
                    <span className="font-sans font-semibold text-deep-purple">
                      {a.name}
                    </span>
                    <span className="font-sans text-sm tabular-nums text-deep-purple/60">
                      {a.startTime} – {a.endTime}
                    </span>
                    <span className="ml-auto rounded-full border border-dusty-rose/50 bg-dusty-rose/25 px-3 py-0.5 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-deep-purple">
                      {a.genre}
                    </span>
                  </label>
                </li>
              );
            })}
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
