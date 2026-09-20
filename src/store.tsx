import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ScanResult, Screen, ThemeMode } from './types';
import { analyzeImage } from './services/analyze';
import type { ValuationStage } from './types';
import { triggerHaptic } from './utils';

interface AppStateContextType {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  direction: number;
  history: ScanResult[];
  addToHistory: (result: ScanResult) => void;
  currentScan: ScanResult | null;
  startScan: (imageBase64: string) => void;
  scanStage: ValuationStage | 'uploading';
  scanError: string | null;
  cancelScan: () => void;
  retryScan: () => void;
  openSavedScan: (result: ScanResult) => void;
  clearHistory: () => void;
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
  const [history, setHistory] = useState<ScanResult[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem('pricesnap_history_v1') || '[]');
      return Array.isArray(saved) ? saved.filter((r: any) => r?.id && r?.product?.name && r?.valuation && r?.confidence && r?.evidence && ['success', 'insufficient_evidence'].includes(r.status) && !r.isMock).slice(0, 50) : [];
    } catch { return []; }
  });
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [scanStage, setScanStage] = useState<ValuationStage | 'uploading'>('uploading');
  const [scanError, setScanError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const lastImage = useRef<string | null>(null);
  useEffect(() => () => activeRequest.current?.abort(), []);

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
    if (newScreen !== 'analyzing') { activeRequest.current?.abort(); activeRequest.current = null; lastImage.current = null; }
    const order: Record<Screen, number> = { landing: 0, home: 1, scanner: 2, history: 3, settings: 4, analyzing: 5, result: 6, pitch: 7, privacy: 8 };
    setDirection(order[newScreen] > order[screen] ? 1 : -1);
    setScreenState(newScreen);
    triggerHaptic();
  };

  const startScan = async (imageBase64: string) => {
    activeRequest.current?.abort();
    const controller = new AbortController(); activeRequest.current = controller;
    lastImage.current = imageBase64;
    setCurrentScan(null); setScanError(null); setScanStage('uploading'); setScreen('analyzing');
    const timeout = setTimeout(() => controller.abort('timeout'), 100000);
    try {
      const result = await analyzeImage(imageBase64, controller.signal, stage => {
        if (activeRequest.current === controller) setScanStage(stage);
      });
      if (activeRequest.current !== controller) return;
      activeRequest.current = null; lastImage.current = null;
      setCurrentScan(result); setScreen('result');
    } catch (error) {
      if (activeRequest.current !== controller) return;
      setScanError(controller.signal.aborted ? 'The scan timed out. Please retry.' : (error instanceof Error ? error.message : 'Unable to analyze this photo. Check your connection and retry.'));
    } finally { clearTimeout(timeout); }
  };
  const cancelScan = () => { setScreen('scanner'); setScanError(null); };
  const retryScan = () => { if (lastImage.current) void startScan(lastImage.current); };
  const openSavedScan = (result: ScanResult) => { setCurrentScan(result); setScreen('result'); };
  const clearHistory = () => { setHistory([]); try { localStorage.removeItem('pricesnap_history_v1'); } catch { /* storage unavailable */ } showToast('Saved results deleted'); };

  const addToHistory = (result: ScanResult) => {
    if (!history.find(h => h.id === result.id)) {
      const updated = [result, ...history].slice(0, 50);
      setHistory(updated);
      try { localStorage.setItem('pricesnap_history_v1', JSON.stringify(updated)); showToast('Result saved on this device'); }
      catch { showToast('Saved for this session only; device storage is unavailable'); }
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
      theme, resolvedTheme, setTheme, scanStage, scanError, cancelScan, retryScan, openSavedScan, clearHistory
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
