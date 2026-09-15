import { motion } from 'motion/react';
import { useAppState } from '../store';
import { Calendar, PackageOpen, ChevronRight, Box } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function HistoryScreen() {
  const { history, setScreen } = useAppState();

  return (
    <div className="w-full h-full flex flex-col bg-navy-950 overflow-y-auto pt-20 pb-24 px-4">
      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <PackageOpen className="w-16 h-16 text-ink-faint mb-4" />
          <h2 className="text-lg font-display font-semibold text-ink mb-2">No scans yet</h2>
          <p className="text-sm text-ink-dim max-w-[200px]">Your saved scanning history will appear here.</p>
          <button 
            onClick={() => setScreen('scanner')}
            className="mt-6 pw-btn-soft px-6 py-2.5"
          >
            Start Scanning
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((scan, idx) => {
            const date = new Date(scan.date || scan.meta?.timestamp || new Date().toISOString());
            const isToday = new Date().toDateString() === date.toDateString();
            const product = scan.product || { name: scan.name || 'Unknown', confidence: scan.confidence ? scan.confidence / 100 : 0, confidence_color: 'red' };
            const market = scan.market || { recommended_price: scan.price?.average || 0 };
            
            return (
              <motion.div 
                key={scan.id || scan.meta?.analysis_id || idx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="pw-card flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="w-12 h-12 bg-navy-950 border border-surface rounded-xl flex items-center justify-center text-snap shrink-0">
                  <Box className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm text-ink truncate">{product.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-display font-bold text-snap">
                      {formatCurrency(market.recommended_price)}
                    </span>
                    <span className="text-2xs text-ink-faint flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {isToday ? 'Today' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <div className={`pw-tag mb-1 opacity-90 text-[10px] border ${product.confidence_color === 'green' ? 'text-lime border-lime/30 bg-lime/10' : product.confidence_color === 'orange' ? 'text-amber border-amber/30 bg-amber/10' : 'text-rose-400 border-rose-400/30 bg-rose-400/10'}`}>
                    {Math.round(product.confidence * 100)}% match
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-faint" />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
}
