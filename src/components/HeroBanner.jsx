import { useEffect, useRef } from "react";

function DesertScene() {
  return (
    <svg
      viewBox="0 0 1200 220"
      preserveAspectRatio="xMidYMax slice"
      className="block h-[200px] w-full sm:h-[220px]"
      aria-hidden="true"
    >
      <circle cx="935" cy="78" r="100" fill="rgba(248,228,178,0.18)" />
      <circle cx="935" cy="78" r="72" fill="rgba(248,228,178,0.35)" />
      <circle cx="935" cy="78" r="46" fill="#F8E4B2" />

      <path
        d="M0 135 Q 200 105, 400 130 T 800 120 Q 1000 110, 1200 135 L 1200 220 L 0 220 Z"
        fill="#D4A5A5"
        opacity="0.7"
      />

      <path
        d="M0 165 Q 250 135, 500 155 T 950 150 Q 1100 145, 1200 160 L 1200 220 L 0 220 Z"
        fill="#C4622D"
        opacity="0.9"
      />

      <path
        d="M0 192 Q 300 172, 600 188 T 1200 182 L 1200 220 L 0 220 Z"
        fill="#3D2B56"
      />

      <g fill="#3D2B56">
        <g transform="translate(130 144)">
          <rect x="12" y="0" width="14" height="50" rx="7" />
          <rect x="0" y="14" width="10" height="26" rx="5" />
          <rect x="0" y="26" width="20" height="6" />
          <rect x="28" y="8" width="10" height="32" rx="5" />
          <rect x="26" y="22" width="16" height="6" />
        </g>
        <g transform="translate(50 180)">
          <ellipse cx="9" cy="11" rx="9" ry="13" />
          <ellipse cx="20" cy="8" rx="7" ry="10" />
        </g>
        <g transform="translate(530 174)">
          <rect x="4" y="0" width="10" height="20" rx="4" />
          <rect x="0" y="6" width="6" height="12" rx="3" />
        </g>
        <g transform="translate(720 162)">
          <rect x="6" y="0" width="12" height="36" rx="5" />
          <rect x="0" y="10" width="8" height="22" rx="4" />
          <rect x="0" y="22" width="12" height="6" />
        </g>
        <g transform="translate(1030 172)">
          <rect x="4" y="0" width="10" height="22" rx="4" />
        </g>
      </g>
    </svg>
  );
}

export default function HeroBanner({ weekend, label, dates }) {
  const bgRef = useRef(null);
  const desertRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    let frame = null;
    const update = () => {
      const y = window.scrollY;
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${y * 0.5}px, 0)`;
      }
      if (desertRef.current) {
        desertRef.current.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;
      }
      frame = null;
    };
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      className="animate-hero-in relative h-[340px] w-full overflow-hidden sm:h-[400px]"
      aria-label={`Coachella ${label}`}
    >
      <div
        ref={bgRef}
        className="absolute inset-x-0 -top-[200px] -bottom-[200px] will-change-transform"
      >
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-shimmer absolute inset-0" />
      </div>

      <div
        ref={desertRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 will-change-transform"
      >
        <DesertScene />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="font-sans text-xs uppercase tracking-[0.4em] text-warm-cream/85 drop-shadow-[0_1px_4px_rgba(61,43,86,0.6)] sm:text-sm">
          Coachella · Weekend {weekend}
        </p>
        <h1 className="mt-3 font-display text-5xl text-warm-cream drop-shadow-[0_4px_18px_rgba(61,43,86,0.55)] sm:text-7xl md:text-8xl">
          {label}
        </h1>
        <div
          className="mt-4 flex w-full max-w-xs items-center gap-3"
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-warm-cream/55 to-transparent" />
          <span className="text-gold drop-shadow-[0_1px_4px_rgba(61,43,86,0.6)]">
            ✦
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-warm-cream/55 to-transparent" />
        </div>
        <p className="mt-3 font-display text-xl italic text-warm-cream/95 drop-shadow-[0_2px_8px_rgba(61,43,86,0.55)] sm:text-2xl">
          {dates}
        </p>
      </div>
    </section>
  );
}
