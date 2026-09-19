import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScanResult, Screen, ThemeMode } from './types';
import { generateMockResult } from './mockData';
import { triggerHaptic } from './utils';

interface AppStateContextType {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  direction: number;
  history: ScanResult[];
  addToHistory: (result: ScanResult) => void;
  currentScan: ScanResult | null;
  startScan: (imageBase64: string) => void;
  toastMessage: string | null;
  showToast: (message: string) => void;
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreenState] = useState<Screen>('landing');
  const [direction, setDirection] = useState(1);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Theme State with LocalStorage Persistence
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('pricesnap_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved as ThemeMode;
      }
    } catch {
      // fallback
    }
    return 'dark'; // Default to sleek modern dark op-shop mode or light
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const updateResolvedTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        // system
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setResolvedTheme(isDark ? 'dark' : 'light');

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };

    updateResolvedTheme();

    try {
      localStorage.setItem('pricesnap_theme', theme);
    } catch {
      // ignore
    }

    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateResolvedTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    triggerHaptic();
    setThemeState(newTheme);
  };

  const setScreen = (newScreen: Screen) => {
    const order: Record<Screen, number> = { landing: 0, home: 1, scanner: 2, history: 3, settings: 4, analyzing: 5, result: 6, pitch: 7, privacy: 8 };
    setDirection(order[newScreen] > order[screen] ? 1 : -1);
    setScreenState(newScreen);
    triggerHaptic();
  };

  const startScan = async (imageBase64: string) => {
    triggerHaptic();
    setScreen('analyzing');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, imageUrl: imageBase64, imageBase64 })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Analysis failed');
      }
      
      const appraisalData = data.appraisal ? { ...data.appraisal, ...data } : data;
      setCurrentScan(appraisalData);
      setScreen('result');

      if (appraisalData.isMock) {
        showToast('Demo Mode: Using local appraisal data.');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'Error analyzing image. Please try again.');
      setScreen('scanner');
    }
  };

  const addToHistory = (result: ScanResult) => {
    if (!history.find(h => h.id === result.id)) {
      setHistory(prev => [result, ...prev]);
      showToast('Result saved to history');
    } else {
      showToast('Already in history');
    }
  };

  const showToast = (message: string) => {
    triggerHaptic();
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <AppStateContext.Provider value={{
      screen, setScreen, direction, history, addToHistory, currentScan, startScan, toastMessage, showToast,
      theme, resolvedTheme, setTheme
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
}
