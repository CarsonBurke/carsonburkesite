import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
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

const STEP: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * A radio group owes its users one tab stop and working arrow keys. Selection
 * follows focus, as WAI-ARIA specifies for radios.
 */
function useRadioKeys<T extends string>(ids: readonly T[], select: (id: T) => void) {
  return useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const step = STEP[event.key];
      const index = ids.findIndex(
        (id) => id === (event.target as HTMLElement).dataset.radioId,
      );
      if (index === -1) return;

      let next = index;
      if (step !== undefined) next = (index + step + ids.length) % ids.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = ids.length - 1;
      else return;

      event.preventDefault();
      const id = ids[next];
      if (!id) return;
      select(id);
      const group = event.currentTarget;
      group.querySelector<HTMLElement>(`[data-radio-id="${id}"]`)?.focus();
    },
    [ids, select],
  );
}

/**
 * A stand-in for GNOME Settings › Appearance: style choice plus the nine system
 * accent colours. Closes on Escape or a click outside, returning focus to the
 * button that opened it.
 */
export function AppearanceMenu() {
  const { theme, setTheme, accent, setAccent } = useAppearance();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const themeKeys = useRadioKeys(
    THEMES.map(({ id }) => id),
    setTheme,
  );
  const accentKeys = useRadioKeys(
    ACCENTS.map(({ id }) => id),
    setAccent,
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Escape must not strand focus on a node that is about to unmount.
      trigger.current?.focus();
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
        ref={trigger}
        className="adw-button flat circular"
        aria-label="Appearance"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <PaletteIcon />
      </button>

      {open && (
        <div
          role="group"
          aria-label="Appearance"
          className="absolute right-0 z-40 mt-2 w-[16rem] max-w-[calc(100vw-1.5rem)] origin-top-right rounded-[15px] p-3 shadow-xl"
          style={{
            backgroundColor: "var(--popover-bg-color)",
            boxShadow: "0 0 0 1px var(--shade-color), 0 8px 28px rgb(0 0 6 / 28%)",
          }}
        >
          <p className="caption-heading dimmed px-1 pb-2">Style</p>
          <div
            role="radiogroup"
            aria-label="Style"
            onKeyDown={themeKeys}
            className="grid grid-cols-3 gap-1 rounded-[10px] p-1"
            style={{ backgroundColor: "color-mix(in srgb, currentColor 8%, transparent)" }}
          >
            {THEMES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                data-radio-id={id}
                aria-checked={theme === id}
                tabIndex={theme === id ? 0 : -1}
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
          <div
            role="radiogroup"
            aria-label="Accent colour"
            onKeyDown={accentKeys}
            className="grid grid-cols-5 gap-2"
          >
            {ACCENTS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="radio"
                data-radio-id={id}
                aria-checked={accent === id}
                tabIndex={accent === id ? 0 : -1}
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
