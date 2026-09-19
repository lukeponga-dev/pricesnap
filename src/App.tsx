import { AnimatePresence, motion } from 'motion/react';
import { AppStateProvider, useAppState } from './store';
import { Header, Toast } from './components/Layout';
import { BottomNav } from './components/BottomNav';
import ScannerScreen from './screens/ScannerScreen';
import AnalyzingScreen from './screens/AnalyzingScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import HomeScreen from './screens/HomeScreen';
import PitchDeckScreen from './screens/PitchDeckScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import LandingScreen from './screens/LandingScreen';

const variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

function MainFlow() {
  const { screen, direction } = useAppState();

  const isFullWidthPage = screen === 'landing' || screen === 'pitch' || screen === 'privacy';

  if (isFullWidthPage) {
    return (
      <div className="w-full min-h-screen bg-navy-950 flex flex-col font-body text-ink selection:bg-snap/20">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={screen}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full flex-1 flex flex-col"
          >
            {screen === 'landing' && <LandingScreen />}
            {screen === 'pitch' && <PitchDeckScreen />}
            {screen === 'privacy' && <PrivacyScreen />}
          </motion.div>
        </AnimatePresence>
        <Toast />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-200/60 dark:bg-slate-950/90 flex items-center justify-center transition-colors duration-200">
      <div className="w-full max-w-md mx-auto h-[100dvh] bg-navy-950 flex flex-col relative overflow-hidden font-body text-ink transition-colors duration-200 selection:bg-snap/20 sm:h-screen sm:border-x border-surface sm:shadow-2xl">
        <Header />
        
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={screen}
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="absolute inset-0"
            >
              {screen === 'home' && <HomeScreen />}
              {screen === 'scanner' && <ScannerScreen />}
              {screen === 'analyzing' && <AnalyzingScreen />}
              {screen === 'result' && <ResultScreen />}
              {screen === 'history' && <HistoryScreen />}
              {screen === 'settings' && <SettingsScreen />}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <BottomNav />
        <Toast />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen w-full bg-navy-950">
      <AppStateProvider>
        <MainFlow />
      </AppStateProvider>
    </div>
  );
}
