import { NavLink, Link } from "react-router-dom";

const linkBase =
  "inline-flex min-h-[44px] items-center px-1 font-sans text-sm uppercase tracking-[0.2em] transition-colors";
const linkClass = ({ isActive }) =>
  `${linkBase} ${isActive ? "text-terracotta" : "text-deep-purple hover:text-terracotta"}`;

export default function NavBar() {
  return (
    <header className="animate-slide-down border-b border-dusty-rose/30 bg-warm-cream/60 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center font-display text-xl text-deep-purple"
        >
          Planned Coachella
        </Link>
        <div className="flex gap-4 sm:gap-6">
          <NavLink to="/weekend1" className={linkClass}>
            Weekend 1
          </NavLink>
          <NavLink to="/weekend2" className={linkClass}>
            Weekend 2
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
