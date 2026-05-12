export default function WeekendPage({ weekend }) {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="font-sans text-xs uppercase tracking-[0.3em] text-terracotta">
        Coachella · Weekend {weekend}
      </p>
      <h1 className="mt-4 font-display text-deep-purple">
        Weekend {weekend} Itinerary
      </h1>
      <p className="mt-2 max-w-2xl text-deep-purple/80">
        This is a placeholder for the Weekend {weekend} plan. Schedule, map pins,
        outfits, and meetup spots will live here.
      </p>

      <div className="mt-10 rounded-2xl border border-dusty-rose/40 bg-warm-cream/70 p-8 shadow-sm backdrop-blur">
        <h2 className="font-display text-deep-purple">Coming soon</h2>
        <p className="text-deep-purple/70">
          Daily lineup, map of stages and camp, and the group's must-sees.
        </p>
      </div>
    </section>
  );
}
