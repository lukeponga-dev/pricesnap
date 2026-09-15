import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AnalyzingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 2.5s to 100%
    const duration = 2500;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-navy-950 p-6">
      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-surface"
        />
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-t-snap border-r-snap border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="bg-navy-900 w-32 h-32 rounded-full flex items-center justify-center shadow-inner border border-surface">
          <Loader2 className="w-10 h-10 text-snap animate-spin" />
        </div>
      </div>

      <h2 className="text-2xl font-display font-semibold text-ink mb-2">Analyzing Item...</h2>
      <p className="text-ink-dim text-center mb-8 max-w-xs text-sm leading-relaxed">
        Identifying product, verifying SKU, and scanning global marketplaces for pricing.
      </p>

      <div className="w-full max-w-xs bg-surface rounded-full h-2 overflow-hidden">
        <motion.div 
          className="h-full bg-snap rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-mono text-ink-faint">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
