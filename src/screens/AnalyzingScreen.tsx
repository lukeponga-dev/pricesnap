import { motion } from 'motion/react';
import { Loader2, Sparkles, Camera, TrendingUp, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

const ANALYSIS_STEPS = [
  "Extracting visual tensor features & brand markers...",
  "Inspecting fabric wear, tags & condition defects...",
  "Querying Trade Me & Facebook Marketplace comparables...",
  "Calculating optimal resale price range in NZD..."
];

export default function AnalyzingScreen() {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const duration = 2800;
    const interval = 40;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(p => {
        const next = p + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        if (next > 75) setStepIndex(3);
        else if (next > 50) setStepIndex(2);
        else if (next > 25) setStepIndex(1);
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-navy-950 p-6">
      <div className="relative w-44 h-44 flex items-center justify-center mb-8">
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-surface"
        />
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-t-snap border-r-snap border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <div className="bg-navy-900 w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-inner border border-surface text-center p-4">
          <Sparkles className="w-8 h-8 text-snap animate-pulse mb-1" />
          <span className="font-mono text-xs text-snap font-bold">{Math.round(progress)}%</span>
        </div>
      </div>

      <h2 className="text-xl font-display font-bold text-ink mb-2">PriceSnap AI Vision</h2>
      <p className="text-ink-dim text-center mb-6 max-w-xs text-xs leading-relaxed min-h-[36px] transition-all">
        {ANALYSIS_STEPS[stepIndex]}
      </p>

      <div className="w-full max-w-xs bg-surface rounded-full h-2 overflow-hidden mb-3">
        <motion.div 
          className="h-full bg-snap rounded-full shadow-[0_0_12px_rgba(217,249,157,0.4)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-4 text-[11px] text-ink-faint">
        <div className="flex items-center gap-1">
          <Camera className="w-3.5 h-3.5 text-snap" />
          <span>Gemini 3.6 Flash</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>NZ Market Comps</span>
        </div>
      </div>
    </div>
  );
}
