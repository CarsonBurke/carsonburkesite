import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { AppearanceMenu } from "./AppearanceMenu.tsx";
import { ArrowLeftIcon } from "./Icon.tsx";

const SECTIONS = [
  { id: "writing", label: "Writing" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
] as const;

/** Tracks which section owns the viewport so the header can mark it, GNOME-sidebar style. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const targets = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
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
      <div className="mx-auto flex min-h-[47px] max-w-5xl items-center gap-2 px-3 py-[6px]">
        {onHome ? (
          <Link to="/" className="heading shrink-0 whitespace-nowrap no-underline">
            Carson Burke
          </Link>
        ) : (
          <Link to="/" className="adw-button flat no-underline">
            <ArrowLeftIcon />
            <span className="hidden sm:inline">Home</span>
          </Link>
        )}

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1" aria-label="Sections">
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={onHome ? `#${id}` : `/#${id}`}
              className="adw-button flat !px-2 no-underline sm:!px-3"
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
          ))}
          <AppearanceMenu />
        </nav>
      </div>
    </header>
  );
}
