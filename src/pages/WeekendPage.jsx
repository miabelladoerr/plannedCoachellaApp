import { useState } from "react";
import LiveStageDisplay from "../components/LiveStageDisplay.jsx";

const WEEKEND_META = {
  1: { label: "Weekend One", dates: "April 11–13" },
  2: { label: "Weekend Two", dates: "April 18–20" },
};

const DAYS = ["Friday", "Saturday", "Sunday"];

export default function WeekendPage({ weekend }) {
  const meta = WEEKEND_META[weekend] ?? WEEKEND_META[1];
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="text-center">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-terracotta">
          Coachella · Weekend {weekend}
        </p>
        <h1 className="mt-3 font-display text-5xl text-deep-purple sm:text-6xl">
          {meta.label} <span className="text-terracotta">—</span> {meta.dates}
        </h1>

        <div
          className="mx-auto mt-6 flex max-w-xs items-center gap-3"
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-dusty-rose to-transparent" />
          <span className="text-gold">✦</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-dusty-rose to-transparent" />
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Select day"
        className="mt-10 flex flex-wrap justify-center gap-3"
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedDay(day)}
              className={`rounded-full px-7 py-2.5 font-sans text-sm uppercase tracking-[0.18em] shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-warm-cream ${
                isSelected
                  ? "bg-gold text-deep-purple shadow-md ring-2 ring-gold/40"
                  : "bg-terracotta text-warm-cream hover:bg-terracotta/90 hover:-translate-y-0.5"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <LiveStageDisplay weekend={weekend} day={selectedDay} />
    </section>
  );
}
