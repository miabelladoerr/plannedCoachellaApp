import { useEffect, useMemo, useRef } from "react";
import { artistKey } from "./StageAccordion.jsx";
import { DAYS, STAGES, schedule } from "../data/schedule.js";

function buildGroups(weekend, selectedIds) {
  const weekendData = schedule[weekend] ?? {};
  const groups = [];
  for (const stage of STAGES) {
    const rows = [];
    for (const day of DAYS) {
      const sets = weekendData[day]?.[stage] ?? [];
      for (const artist of sets) {
        const id = artistKey(weekend, day, stage, artist);
        if (selectedIds.has(id)) {
          rows.push({ id, day, ...artist });
        }
      }
    }
    if (rows.length) groups.push({ stage, rows });
  }
  return groups;
}

function CloseIcon({ size = 20 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}

export default function SelectedArtistsSidebar({
  open,
  onClose,
  weekend,
  selectedIds,
  onRemove,
  onClear,
  onBuild,
  showSaved = false,
}) {
  const closeBtnRef = useRef(null);
  const groups = useMemo(
    () => buildGroups(weekend, selectedIds),
    [weekend, selectedIds],
  );
  const totalCount = selectedIds.size;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-deep-purple/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Selected artists"
        aria-hidden={!open}
        className={`fixed z-50 flex flex-col bg-deep-purple text-warm-cream shadow-2xl shadow-deep-purple/40 ring-1 ring-gold/20 transition-transform duration-300 ease-out inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl md:inset-y-0 md:left-auto md:right-0 md:bottom-auto md:max-h-none md:w-[380px] md:rounded-t-none md:rounded-l-3xl ${
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full"
        }`}
      >
        <div
          className="mx-auto mt-2 h-1 w-12 shrink-0 rounded-full bg-warm-cream/25 md:hidden"
          aria-hidden="true"
        />

        <header className="flex items-center justify-between gap-3 border-b border-warm-cream/15 px-6 py-4">
          <div>
            <p className="font-sans text-[0.7rem] uppercase tracking-[0.25em] text-gold">
              My picks
            </p>
            <h2 className="font-display text-2xl text-warm-cream">
              {totalCount} {totalCount === 1 ? "Artist" : "Artists"}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close selections"
            className="grid h-11 w-11 place-items-center rounded-full text-warm-cream/80 transition-colors hover:bg-warm-cream/10 hover:text-warm-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {totalCount === 0 ? (
            <p className="font-sans text-warm-cream/70">
              No artists selected yet. Tap a checkbox in the schedule to add
              picks.
            </p>
          ) : (
            <ul className="space-y-6">
              {groups.map(({ stage, rows }) => (
                <li key={stage}>
                  <h3 className="mb-2 font-display text-lg text-gold">
                    {stage}
                  </h3>
                  <ul className="space-y-2">
                    {rows.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-start gap-3 rounded-xl bg-warm-cream/5 px-3 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-sans font-semibold text-warm-cream">
                            {row.name}
                          </p>
                          <p className="font-sans text-sm tabular-nums text-warm-cream/70">
                            {row.day} · {row.startTime} – {row.endTime}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(row.id)}
                          aria-label={`Remove ${row.name}`}
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-warm-cream/60 transition-colors hover:bg-warm-cream/10 hover:text-warm-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          <CloseIcon size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>

        {totalCount > 0 && (
          <footer className="space-y-2 border-t border-warm-cream/15 px-6 py-4">
            <p
              aria-live="polite"
              className={`-mb-0.5 text-center font-sans text-[0.65rem] font-bold uppercase tracking-[0.25em] text-gold transition-opacity duration-300 ${
                showSaved ? "opacity-100" : "opacity-0"
              }`}
            >
              Saved ✓
            </p>
            <button
              type="button"
              onClick={onBuild}
              className="min-h-[44px] w-full rounded-full bg-warm-cream px-4 py-3 font-sans text-sm font-bold uppercase tracking-[0.2em] text-deep-purple shadow-sm transition hover:-translate-y-0.5 hover:bg-warm-cream/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-deep-purple"
            >
              Build My Schedule ↓
            </button>
            <button
              type="button"
              onClick={onClear}
              className="min-h-[44px] w-full rounded-full border border-warm-cream/30 px-4 py-3 font-sans text-sm uppercase tracking-[0.2em] text-warm-cream transition-colors hover:bg-warm-cream/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Clear All
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
