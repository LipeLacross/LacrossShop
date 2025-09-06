import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ColorMode = "light" | "dark";
interface ThemeContextValue {
  mode: ColorMode;
  isDark: boolean;
  toggle: () => void;
  setMode: (m: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** 'light' | 'dark' | 'system' */
  defaultMode?: ColorMode | "system";
  storageKey?: string;
}

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;

export function ThemeProvider({
  children,
  defaultMode = "system",
  storageKey = "app-theme",
}: ThemeProviderProps) {
  const initial = useMemo<ColorMode>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem(storageKey) as ColorMode | null;
    if (saved === "light" || saved === "dark") return saved;
    if (defaultMode === "system") return prefersDark() ? "dark" : "light";
    return defaultMode;
  }, [defaultMode, storageKey]);

  const [mode, setModeState] = useState<ColorMode>(initial);

  const setMode = useCallback(
    (m: ColorMode) => {
      setModeState(m);
      try {
        window.localStorage.setItem(storageKey, m);
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  const toggle = useCallback(
    () => setMode(mode === "light" ? "dark" : "light"),
    [mode, setMode],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
  }, [mode]);

  // Sync system changes only if user never manually switched (no storage value yet)
  useEffect(() => {
    if (defaultMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) setMode(prefersDark() ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [defaultMode, setMode, storageKey]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark: mode === "dark", toggle, setMode }),
    [mode, toggle, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

export const ThemeToggleButton: React.FC<{
  labelLight?: string;
  labelDark?: string;
  className?: string;
}> = ({ labelLight = "Modo claro", labelDark = "Modo escuro", className }) => {
  const { mode, toggle } = useTheme();
  const next = mode === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Alternar para modo ${next}`}
      title={`Alternar para modo ${next}`}
      className={className}
      style={{ alignSelf: "flex-start" }}
      data-testid="theme-toggle"
    >
      {mode === "light" ? labelDark : labelLight}
    </button>
  );
};
