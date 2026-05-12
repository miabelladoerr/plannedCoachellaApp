import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="font-sans text-xs uppercase tracking-[0.3em] text-terracotta">
        Indio, California
      </p>
      <h1 className="mt-4 font-display text-deep-purple">Planned Coachella</h1>
      <p className="mt-2 max-w-2xl text-deep-purple/80">
        Pick a weekend to start planning.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link
          to="/weekend1"
          className="rounded-2xl border border-dusty-rose/40 bg-warm-cream/70 p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="font-display text-deep-purple">Weekend 1</h2>
          <p className="text-deep-purple/70">First weekend itinerary.</p>
        </Link>

        <Link
          to="/weekend2"
          className="rounded-2xl border border-dusty-rose/40 bg-warm-cream/70 p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="font-display text-deep-purple">Weekend 2</h2>
          <p className="text-deep-purple/70">Second weekend itinerary.</p>
        </Link>
      </div>
    </section>
  );
}
