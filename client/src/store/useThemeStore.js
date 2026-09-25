import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('unisphere_theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeClass = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('unisphere_theme', theme);
};

export const useThemeStore = create((set, get) => {
  const initial = getInitialTheme();
  applyThemeClass(initial);

  return {
    theme: initial,
    isDark: initial === 'dark',
    toggleTheme: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark';
      applyThemeClass(next);
      set({ theme: next, isDark: next === 'dark' });
    },
    setTheme: (theme) => {
      applyThemeClass(theme);
      set({ theme, isDark: theme === 'dark' });
    },
  };
});

export default useThemeStore;
