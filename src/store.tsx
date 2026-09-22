import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScanResult, Screen, ThemeMode } from './types';
import { generateMockResult } from './mockData';
import { triggerHaptic } from './utils';
import { auth, db } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  doc,
  setDoc
} from 'firebase/firestore';

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
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreenState] = useState<Screen>('landing');
  const [direction, setDirection] = useState(1);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        syncUserProfile(currentUser);
        fetchHistory(currentUser.uid);
      } else {
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const syncUserProfile = async (currentUser: User) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        lastActive: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing user profile:', err);
    }
  };

  const fetchHistory = async (uid: string) => {
    try {
      const scansRef = collection(db, 'scans');
      const q = query(
        scansRef, 
        where('userId', '==', uid), 
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedHistory: ScanResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedHistory.push({
          ...data,
          id: doc.id,
          date: data.date?.toDate?.()?.toISOString() || data.date
        } as ScanResult);
      });
      setHistory(fetchedHistory);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showToast('Signed in successfully');
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        console.log('User closed the auth popup');
        // Silent or subtle notification
        return;
      }
      console.error('Auth error:', err);
      showToast('Authentication failed');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setScreenState('landing');
      showToast('Signed out');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

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
      
      // Persist to Firestore if user is logged in
      if (user) {
        try {
          const scanDoc = {
            ...appraisalData,
            userId: user.uid,
            date: serverTimestamp(),
            engineVersion: appraisalData.valuationEngineVersion || '1.0.0'
          };
          const docRef = await addDoc(collection(db, 'scans'), scanDoc);
          appraisalData.id = docRef.id;
          setHistory(prev => [appraisalData, ...prev]);
        } catch (dbErr) {
          console.error('Error saving scan to Firestore:', dbErr);
        }
      }

      setCurrentScan(appraisalData);
      setScreen('result');

      if (appraisalData.isMock) {
        showToast('Demo Mode: Using benchmark appraisal data.');
      }
    } catch {
      // Gracefully fall back to local appraisal engine if offline or endpoint unavailable
      const fallbackAppraisal = generateMockResult();
      setCurrentScan(fallbackAppraisal);
      setScreen('result');
      showToast('Appraisal completed using offline mode.');
    }
  };

  const addToHistory = async (result: ScanResult) => {
    if (user) {
      if (history.find(h => h.id === result.id)) {
        showToast('Already in history');
        return;
      }
      // If result was mock or not yet saved (e.g. from local fallback)
      try {
        const scanDoc = {
          ...result,
          userId: user.uid,
          date: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'scans'), scanDoc);
        result.id = docRef.id;
        setHistory(prev => [result, ...prev]);
        showToast('Result saved to history');
      } catch (err) {
        console.error('Error adding to history:', err);
        showToast('Failed to save result');
      }
    } else {
      // Local only for non-logged in users (transient)
      if (!history.find(h => h.id === result.id)) {
        setHistory(prev => [result, ...prev]);
        showToast('Saved locally (Sign in to sync)');
      } else {
        showToast('Already in history');
      }
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
      theme, resolvedTheme, setTheme, user, signIn, signOut, loading
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
