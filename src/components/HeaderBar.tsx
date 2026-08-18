import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import avatar from "../assets/avatar.webp";
import { AppearanceMenu } from "./AppearanceMenu.tsx";

const SECTIONS = [
  { id: "writing", label: "Writing" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
] as const;

/** Tracks which tracked section owns the viewport so the header can mark it. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const targets = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (targets.length === 0) return;

    const seen = visible.current;
    seen.clear();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        }
        // Nothing tracked is in view, so this is the hero or a section the nav ignores.
        const first = SECTIONS.find(({ id }) => seen.has(id));
        setActive(first?.id ?? null);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    for (const target of targets) observer.observe(target);
    return () => {
      observer.disconnect();
      seen.clear();
    };
  }, [enabled]);

  return active;
}

export function HeaderBar() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const active = useActiveSection(onHome);

  return (
    <header
      className="osd-blur sticky top-0 z-30"
      style={{ boxShadow: "inset 0 -1px var(--headerbar-shade-color)" }}
    >
      <a
        href="#content"
        className="adw-button suggested sr-only no-underline focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-40"
      >
        Skip to content
      </a>

      <div className="mx-auto flex min-h-[47px] max-w-5xl items-center gap-1 px-3 py-[6px] sm:gap-2">
        {/* One brand control on every route: the avatar and the name go home. */}
        <Link
          to="/"
          aria-label="Carson Burke"
          className="heading flex shrink-0 items-center gap-2 no-underline"
        >
          {/* 24px with a 22% radius, the same corner the favicon is masked with. */}
          <img
            src={avatar}
            width={24}
            height={24}
            alt=""
            className="h-[24px] w-[24px] shrink-0 rounded-[5px]"
          />
          {/* Under 360px the avatar carries the link alone so the nav still fits. */}
          <span className="hidden min-[360px]:inline sm:hidden">Carson</span>
          <span className="hidden sm:inline">Carson Burke</span>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1" aria-label="Sections">
          {SECTIONS.map(({ id, label }) =>
            // Off the home route this must go through the router, or an
            // origin-absolute href would drop the /carsonburkesite/ base.
            onHome ? (
              <a
                key={id}
                href={`#${id}`}
                className="adw-button flat !px-1.5 text-[0.9rem] no-underline sm:!px-3 sm:text-[1rem]"
                style={
                  active === id
                    ? {
                        backgroundColor:
                          "color-mix(in srgb, var(--accent-bg-color) 16%, transparent)",
                        color: "var(--accent-color)",
                      }
                    : undefined
                }
                aria-current={active === id ? "true" : undefined}
              >
                {label}
              </a>
            ) : (
              <Link
                key={id}
                to={{ pathname: "/", hash: `#${id}` }}
                className="adw-button flat !px-1.5 text-[0.9rem] no-underline sm:!px-3 sm:text-[1rem]"
              >
                {label}
              </Link>
            ),
          )}
          <AppearanceMenu />
        </nav>
      </div>
    </header>
  );
}
