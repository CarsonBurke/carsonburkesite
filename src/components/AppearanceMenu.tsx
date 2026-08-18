import { useEffect, useRef, useState } from "react";
import {
  ACCENTS,
  useAppearance,
  type Accent,
  type ThemeChoice,
} from "../lib/appearance.ts";
import { CheckIcon, DisplayIcon, MoonIcon, PaletteIcon, SunIcon } from "./Icon.tsx";

const THEMES: { id: ThemeChoice; label: string; Icon: typeof SunIcon }[] = [
  { id: "light", label: "Light", Icon: SunIcon },
  { id: "dark", label: "Dark", Icon: MoonIcon },
  { id: "system", label: "System", Icon: DisplayIcon },
];

const SWATCH: Record<Accent, string> = {
  blue: "#3584e4",
  teal: "#2190a4",
  green: "#3a944a",
  yellow: "#c88800",
  orange: "#ed5b00",
  red: "#e62d42",
  pink: "#d56199",
  purple: "#9141ac",
  slate: "#6f8396",
};

/**
 * A stand-in for GNOME Settings › Appearance: style choice plus the nine
 * system accent colours. Closes on Escape or a click outside, like a popover.
 */
export function AppearanceMenu() {
  const { theme, setTheme, accent, setAccent } = useAppearance();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        className="adw-button flat circular"
        aria-label="Appearance"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <PaletteIcon />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Appearance"
          className="absolute right-0 z-40 mt-2 w-64 origin-top-right rounded-[15px] p-3 shadow-xl"
          style={{
            backgroundColor: "var(--popover-bg-color)",
            boxShadow: "0 0 0 1px var(--shade-color), 0 8px 28px rgb(0 0 6 / 28%)",
          }}
        >
          <p className="caption-heading dimmed px-1 pb-2">Style</p>
          <div
            role="radiogroup"
            aria-label="Style"
            className="grid grid-cols-3 gap-1 rounded-[10px] p-1"
            style={{ backgroundColor: "color-mix(in srgb, currentColor 8%, transparent)" }}
          >
            {THEMES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={theme === id}
                onClick={() => setTheme(id)}
                className="flex flex-col items-center gap-1 rounded-[7px] px-1 py-2 text-[0.8rem] font-bold transition-colors"
                style={
                  theme === id
                    ? {
                        backgroundColor: "var(--card-bg-color)",
                        boxShadow: "0 1px 2px rgb(0 0 6 / 12%)",
                      }
                    : undefined
                }
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>

          <p className="caption-heading dimmed px-1 pt-4 pb-2">Accent colour</p>
          <div role="radiogroup" aria-label="Accent colour" className="grid grid-cols-5 gap-2">
            {ACCENTS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={accent === id}
                aria-label={label}
                title={label}
                onClick={() => setAccent(id)}
                className="flex aspect-square items-center justify-center rounded-full text-white transition-transform hover:scale-105"
                style={{
                  backgroundColor: SWATCH[id],
                  boxShadow:
                    accent === id
                      ? "0 0 0 2px var(--popover-bg-color), 0 0 0 4px var(--accent-bg-color)"
                      : "inset 0 0 0 1px rgb(0 0 6 / 20%)",
                }}
              >
                {accent === id && <CheckIcon size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
