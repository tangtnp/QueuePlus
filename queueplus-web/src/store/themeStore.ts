import { create } from "zustand";

type Theme = "light" | "dark";

const STORAGE_KEY = "queueplus-theme";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  localStorage.setItem(STORAGE_KEY, theme);
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },

  initTheme: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme: Theme = saved === "dark" ? "dark" : "light";
    applyTheme(theme);
    set({ theme });
  },
}));