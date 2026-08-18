import { useCallback, useEffect, useState } from "react";

/**
 * GNOME's Appearance panel offers "Follow system", light, dark, and a fixed set
 * of accent colours. This mirrors it: `system` is the default and stays live,
 * an explicit choice is remembered in localStorage.
 */
export type ThemeChoice = "system" | "light" | "dark";

export const ACCENTS = [
  { id: "blue", label: "Blue" },
  { id: "teal", label: "Teal" },
  { id: "green", label: "Green" },
  { id: "yellow", label: "Yellow" },
  { id: "orange", label: "Orange" },
  { id: "red", label: "Red" },
  { id: "pink", label: "Pink" },
  { id: "purple", label: "Purple" },
  { id: "slate", label: "Slate" },
] as const;

export type Accent = (typeof ACCENTS)[number]["id"];

const DARK_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: unknown): value is ThemeChoice =>
  value === "system" || value === "light" || value === "dark";

const isAccent = (value: unknown): value is Accent =>
  ACCENTS.some((accent) => accent.id === value);

function applyTheme(choice: ThemeChoice) {
  const dark =
    choice === "system" ? window.matchMedia(DARK_QUERY).matches : choice === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function useAppearance() {
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    const stored = localStorage.getItem("theme");
    return isTheme(stored) ? stored : "system";
  });
  const [accent, setAccentState] = useState<Accent>(() => {
    const stored = localStorage.getItem("accent");
    return isAccent(stored) ? stored : "blue";
  });

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    // Only the system option keeps tracking the OS afterwards.
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
  }, []);

  const setAccent = useCallback((next: Accent) => {
    setAccentState(next);
    if (next === "blue") localStorage.removeItem("accent");
    else localStorage.setItem("accent", next);
  }, []);

  return { theme, setTheme, accent, setAccent };
}
