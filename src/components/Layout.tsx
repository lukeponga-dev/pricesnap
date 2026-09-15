import { motion } from 'motion/react';
import { useAppState } from '../store';
import { Camera, Search, FileText, Moon, Sun, ArrowLeft, History, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../utils';
import { Logo } from './Logo';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function Header() {
  const { screen, setScreen } = useAppState();
  const isOnline = useOnlineStatus();

  const steps = [
    { id: 'scanner', icon: Camera, label: 'Scan' },
    { id: 'analyzing', icon: Search, label: 'Analyze' },
    { id: 'result', icon: FileText, label: 'Result' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === screen);
  const showSteps = currentStepIndex >= 0;

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 px-4 flex items-center justify-between bg-navy-950/80 backdrop-blur-md border-b border-surface transition-colors">
      <div className="flex-1 flex items-center gap-1">
        {(screen === 'result') && (
          <button 
            onClick={() => setScreen('scanner')}
            className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors text-ink-dim hover:text-ink"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {(screen === 'home' || screen === 'scanner' || screen === 'history' || screen === 'settings') && (
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-display font-semibold text-ink hidden sm:block tracking-tight text-sm">PriceSnap</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex justify-center">
        {showSteps && screen !== 'scanner' && (
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                  currentStepIndex === idx 
                    ? "bg-snap text-navy-950" 
                    : currentStepIndex > idx 
                      ? "bg-snap/20 text-snap"
                      : "bg-surface text-ink-faint"
                )}>
                  <step.icon className="w-4 h-4" />
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "w-4 h-0.5 mx-1 transition-colors duration-300",
                    currentStepIndex > idx ? "bg-snap" : "bg-surface"
                  )} />
                )}
              </div>
            ))}
          </div>
        )}
        {screen === 'home' && (
          <h1 className="text-base font-display font-semibold text-ink tracking-tight">Home</h1>
        )}
        {screen === 'history' && (
          <h1 className="text-base font-display font-semibold text-ink tracking-tight">History</h1>
        )}
        {screen === 'settings' && (
          <h1 className="text-base font-display font-semibold text-ink tracking-tight">Settings</h1>
        )}
      </div>

      <div className="flex-1 flex items-center justify-end gap-2">
        {isOnline ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-snap bg-snap/10 rounded-full border border-snap/20">
            <span className="h-1.5 w-1.5 rounded-full bg-snap animate-pulse" />
            Online
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-amber bg-amber/10 rounded-full border border-amber/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            Offline
          </span>
        )}
      </div>
    </header>
  );
}

export function Toast() {
  const { toastMessage } = useAppState();

  return (
    <div className="fixed bottom-20 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: toastMessage ? 1 : 0, y: toastMessage ? 0 : 20, scale: toastMessage ? 1 : 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-navy-900 border border-surface text-ink px-6 py-3 rounded-full shadow-lg font-medium text-sm"
      >
        {toastMessage}
      </motion.div>
    </div>
  );
}
