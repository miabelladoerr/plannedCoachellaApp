export default function SelectionPill({ count, onClick }) {
  if (count <= 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={onClick}
        className="animate-pill-in pointer-events-auto inline-flex items-center gap-3 rounded-full bg-deep-purple px-6 py-3 font-sans text-sm font-semibold text-warm-cream shadow-lg shadow-deep-purple/30 ring-1 ring-gold/50 transition-shadow hover:shadow-xl hover:shadow-deep-purple/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <span className="font-display text-base font-bold text-gold">
          {count}
        </span>
        <span>
          {count === 1 ? "artist" : "artists"} selected — Build My Schedule
        </span>
        <span aria-hidden="true" className="text-gold">
          ↓
        </span>
      </button>
    </div>
  );
}
