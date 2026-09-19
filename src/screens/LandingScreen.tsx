import { useAppState } from '../store';
import { Camera, Zap, Shield, TrendingUp, ArrowRight, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LandingScreen() {
  const { setScreen } = useAppState();

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-navy-950 text-ink selection:bg-snap/20">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-4xl mx-auto px-6 py-5 flex items-center justify-between border-b border-surface/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-snap rounded-xl flex items-center justify-center text-navy-950 font-bold shadow-lg shadow-snap/20">
            <Camera className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-ink">PriceSnap</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('pitch')}
            className="text-xs font-medium text-ink-dim hover:text-ink px-3 py-1.5 rounded-lg transition-colors"
          >
            Pitch Deck
          </button>
          <button
            onClick={() => setScreen('home')}
            className="px-4 py-2 bg-snap hover:bg-snap/90 text-navy-950 font-display font-semibold text-xs rounded-xl transition-all shadow-md shadow-snap/10 flex items-center gap-1.5"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-snap/10 border border-snap/20 text-snap text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Zealand’s Premier AI Resale & Op Shop Valuation Engine</span>
        </div>

        <h1 className="font-display font-extrabold text-3xl md:text-5xl lg:text-6xl text-ink tracking-tight max-w-3xl leading-[1.1] mb-6">
          Snap any thrift find. Know what it’s worth in <span className="text-snap">seconds</span>.
        </h1>

        <p className="text-base md:text-lg text-ink-dim max-w-2xl mb-8 leading-relaxed">
          Powered by advanced AI vision, PriceSnap analyzes clothing, sneakers, antiques, and electronics, delivering real-time Trade Me, Facebook Marketplace, and eBay resale comparables with condition grading.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center mb-12">
          <button
            onClick={() => setScreen('scanner')}
            className="w-full sm:w-auto px-6 py-3.5 bg-snap hover:bg-snap/90 text-navy-950 font-display font-semibold rounded-xl text-sm transition-all shadow-xl shadow-snap/20 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Open AI Camera Scanner</span>
          </button>
          <button
            onClick={() => setScreen('home')}
            className="w-full sm:w-auto px-6 py-3.5 bg-navy-900 hover:bg-navy-800 text-ink font-display font-medium rounded-xl text-sm border border-surface transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Dashboard</span>
          </button>
        </div>

        {/* Quick Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-8 border-t border-surface/50 text-left">
          <div className="flex items-center gap-3 p-3 bg-navy-900/50 rounded-xl border border-surface/50">
            <Zap className="w-5 h-5 text-snap shrink-0" />
            <div>
              <div className="text-xs font-semibold text-ink">Instant Vision</div>
              <div className="text-[11px] text-ink-faint">Sub-second AI scan</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-navy-900/50 rounded-xl border border-surface/50">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-ink">NZ Comps</div>
              <div className="text-[11px] text-ink-faint">Trade Me & FB Mkt</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-navy-900/50 rounded-xl border border-surface/50">
            <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-ink">Condition Grade</div>
              <div className="text-[11px] text-ink-faint">1-10 defect analysis</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-navy-900/50 rounded-xl border border-surface/50">
            <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-ink">PWA Ready</div>
              <div className="text-[11px] text-ink-faint">Install on mobile</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="w-full max-w-4xl mx-auto px-6 py-12 border-t border-surface/50">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-ink mb-3">Built for Op Shop Staff & Resellers</h2>
          <p className="text-sm text-ink-dim max-w-lg mx-auto">
            Eliminate guesswork when sorting donations, buying thrift items, or listing secondhand stock online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="pw-card flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-snap/10 text-snap rounded-xl flex items-center justify-center mb-4 border border-snap/20">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-ink text-base mb-2">1. Snap & Identify</h3>
              <p className="text-sm text-ink-dim leading-relaxed">
                Take a photo of any item using your phone camera or upload from your gallery. Our AI vision model instantly recognizes brands, models, and categories.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface flex items-center gap-2 text-xs text-snap font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Auto-detects brand & category</span>
            </div>
          </div>

          <div className="pw-card flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-ink text-base mb-2">2. Live Market Comps</h3>
              <p className="text-sm text-ink-dim leading-relaxed">
                Get estimated low, median, and high price ranges specifically tuned for New Zealand marketplaces like Trade Me and Facebook Marketplace.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Trade Me & FB benchmarks</span>
            </div>
          </div>

          <div className="pw-card flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-ink text-base mb-2">3. Condition Grading</h3>
              <p className="text-sm text-ink-dim leading-relaxed">
                Receive an objective condition score from 1 to 10 along with itemized defect notes (scratches, wear, stains) to price with total confidence.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Objective 1-10 scoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-8 border-t border-surface/50 mt-auto flex flex-col sm:flex-row items-center justify-between text-xs text-ink-faint gap-4">
        <div>© 2026 PriceSnap AI. All rights reserved. New Zealand Resale & Valuation.</div>
        <div className="flex items-center gap-4">
          <button onClick={() => setScreen('privacy')} className="hover:text-ink transition-colors">Privacy Policy</button>
          <button onClick={() => setScreen('pitch')} className="hover:text-ink transition-colors">Pitch Deck</button>
          <button onClick={() => setScreen('home')} className="hover:text-ink transition-colors">App Home</button>
        </div>
      </footer>
    </div>
  );
}
