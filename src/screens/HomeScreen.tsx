import { motion } from 'motion/react';
import { useAppState } from '../store';
import { Camera, Sparkles, ClipboardList, BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function HomeScreen() {
  const { setScreen, history } = useAppState();

  return (
    <div className="w-full h-full flex flex-col pt-20 pb-24 px-4 overflow-y-auto bg-navy-950">
      {/* Welcome Hero / Intro */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8 mt-4"
      >
        <span className="inline-flex items-center gap-1 bg-snap/10 text-snap px-3 py-1 rounded-full text-xs font-semibold border border-snap/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> For Op Shops & Individuals
        </span>
        <h1 className="text-3xl font-display font-bold tracking-tight text-ink mb-2 leading-tight">
          Appraise Anything <br /><span className="pw-gradient-text">In Seconds</span>
        </h1>
        <p className="text-sm text-ink-dim max-w-sm mx-auto leading-relaxed">
          The ultimate price scanner for thrift finds, clothing, collectibles, and secondhand goods.
        </p>
      </motion.div>

      {/* Primary Call to Action */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <button
          onClick={() => setScreen('scanner')}
          className="w-full pw-btn py-4 flex items-center justify-center gap-3 text-lg font-bold shadow-card hover:scale-[1.01] transition-all cursor-pointer"
        >
          <Camera className="w-6 h-6" />
          Scan Item
        </button>
      </motion.div>

      {/* Pitch Deck Entry Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <div 
          onClick={() => setScreen('pitch')}
          className="pw-card relative overflow-hidden p-4 flex items-center gap-4 border border-snap/30 bg-navy-900/60 hover:bg-navy-900 transition-all cursor-pointer group hover:border-snap/50 active:scale-[0.99]"
        >
          {/* Subtle gradient light background */}
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-snap/5 to-transparent pointer-events-none" />
          
          <div className="w-10 h-10 rounded-xl bg-snap/10 text-snap flex items-center justify-center border border-snap/20 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-display font-semibold text-sm text-ink group-hover:text-snap transition-colors">Venture Pitch Deck</h3>
              <span className="text-[8px] uppercase tracking-widest font-mono text-snap bg-snap/10 px-1.5 py-0.2 rounded border border-snap/20">LIVE</span>
            </div>
            <p className="text-xs text-ink-dim leading-snug">See our business model, market opportunity & traction metrics.</p>
          </div>
          
          <ChevronRight className="w-4 h-4 text-ink-faint group-hover:text-snap group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </motion.div>

      {/* Quick Stats or Tips Panel */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mb-8"
      >
        <div className="pw-card p-4 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-snap/10 text-snap flex items-center justify-center mb-3 border border-snap/10">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-ink">
              {history.length}
            </div>
            <div className="text-xs text-ink-faint">Total Scans</div>
          </div>
        </div>

        <div className="pw-card p-4 flex flex-col justify-between cursor-pointer" onClick={() => setScreen('settings')}>
          <div className="w-8 h-8 rounded-lg bg-amber/10 text-amber flex items-center justify-center mb-3 border border-amber/10">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-display font-semibold text-ink">
              AI Appraisals
            </div>
            <div className="text-xs text-ink-faint">Smart estimates</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Scans / How It Works */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1"
      >
        {history.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-display font-semibold uppercase tracking-wider text-ink-faint">Recent Scans</h2>
              <button 
                onClick={() => setScreen('history')}
                className="text-xs font-semibold text-snap hover:underline"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {history.slice(0, 3).map((scan, idx) => {
                const anyScan = scan as any;
                const name = scan.product?.name || anyScan.name || anyScan.item_name || 'Item';
                const date = scan.date || anyScan.meta?.timestamp || 'Recently';
                const emoji = anyScan.emoji || '📦';
                const price = scan.market?.recommended_price ?? anyScan.price?.average ?? anyScan.resale_price_nz ?? 0;

                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      setScreen('history');
                    }}
                    className="pw-card flex items-center gap-3 p-3 cursor-pointer hover:bg-navy-800/50 transition-colors"
                  >
                    <span className="text-2xl">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-sm text-ink truncate">{name}</h3>
                      <p className="text-xs text-ink-faint">{date}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-sm text-snap">
                        {formatCurrency(price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="pw-card p-5">
            <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-snap" /> How PriceSnap Works
            </h2>
            <ol className="space-y-4 text-xs text-ink-dim">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-snap/10 text-snap flex items-center justify-center font-bold border border-snap/20">1</span>
                <span><strong>Snap a clear photo</strong> of any item, label, tag, or hallmark with your camera.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-snap/10 text-snap flex items-center justify-center font-bold border border-snap/20">2</span>
                <span>Our AI parses visual signatures to map it directly against sold comparables and live listings.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-snap/10 text-snap flex items-center justify-center font-bold border border-snap/20">3</span>
                <span>Instantly review dynamic valuation ranges, sold comps, and appraisal confidence.</span>
              </li>
            </ol>
          </div>
        )}
      </motion.div>
    </div>
  );
}
