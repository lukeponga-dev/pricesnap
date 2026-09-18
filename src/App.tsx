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

  const isFullWidthScreen = screen === 'landing' || screen === 'pitch' || screen === 'privacy';

  if (isFullWidthScreen) {
    return (
      <div className="w-full min-h-screen bg-navy-950 flex flex-col relative overflow-x-hidden font-body text-ink transition-colors selection:bg-snap/20">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={screen}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
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
    <div className="w-full max-w-md mx-auto h-[100dvh] bg-navy-950 flex flex-col relative overflow-hidden font-body text-ink transition-colors selection:bg-snap/20 sm:h-screen sm:border-x border-surface/50 shadow-[0_0_100px_rgba(0,0,0,0.1)]">
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
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-navy-950 sm:py-0 flex items-center justify-center">
      <AppStateProvider>
        <MainFlow />
      </AppStateProvider>
    </div>
  );
}
