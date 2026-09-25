import React, { useState } from 'react';
import { Sun, Moon, Pause, Play } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const FloatingControlPill = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center bg-white/90 dark:bg-[#18191d]/90 backdrop-blur-md border border-[#e2e5f0] dark:border-[#272a33] rounded-full p-1.5 shadow-lg shadow-black/5 dark:shadow-black/40">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-[#e6e9f6] dark:hover:bg-[#252831] transition-all"
        title={isPlaying ? 'Pause interactive motion' : 'Play interactive motion'}
        aria-label="Toggle motion"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <div className="w-[1px] h-3.5 bg-[#e2e5f0] dark:bg-[#2c303a] mx-0.5" />
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-[#e6e9f6] dark:hover:bg-[#252831] transition-all"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle light/dark theme"
      >
        {isDark ? <Sun className="w-3.5 h-3.5 text-purple-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
      </button>
    </div>
  );
};

export default FloatingControlPill;
