import { useEffect } from "react";
import PropTypes from "prop-types";

export default function ConflictToast({ a, b, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="animate-toast-in fixed bottom-6 left-6 right-6 z-50 max-w-sm rounded-2xl border-2 border-warm-cream bg-deep-purple px-5 py-4 font-sans text-sm text-warm-cream shadow-2xl shadow-deep-purple/50 sm:right-auto"
    >
      <p className="leading-snug">
        <span aria-hidden="true" className="mr-1">
          ⚠️
        </span>
        <span className="font-bold uppercase tracking-[0.15em] text-gold">
          Conflict:
        </span>{" "}
        <strong className="font-semibold">{a}</strong> and{" "}
        <strong className="font-semibold">{b}</strong> overlap — you may need to
        choose!
      </p>
    </div>
  );
}

ConflictToast.propTypes = {
  a: PropTypes.string.isRequired,
  b: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
