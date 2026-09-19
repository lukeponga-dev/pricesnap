import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../store';
import { 
  ArrowLeft, ArrowRight, X, TrendingUp, Sparkles, AlertCircle, 
  Target, ShieldCheck, DollarSign, Users, Award, Landmark, 
  Coins, ChevronRight, Zap, RefreshCw, BarChart2
} from 'lucide-react';

export default function PitchDeckScreen() {
  const { setScreen } = useAppState();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  // Interactive slide states
  const [underpriceValue, setUnderpriceValue] = useState(25); // value between 5 and 100
  const [scanVolume, setScanVolume] = useState(500); // scans per month

  const slidesCount = 7;

  // Slide navigation
  const handleNext = () => {
    if (currentSlide < slidesCount - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setScreen('home');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  // Calculations
  const calculatedLoss = Math.round(underpriceValue * 15 * 8); // assumes 8 items/week underpriced by $X
  const calculatedROI = Math.round((scanVolume * 4.5) - 49); // assumes $4.5 saving per scan - $49 software cost

  return (
    <div className="w-full min-h-screen flex flex-col bg-navy-950 text-ink pt-12 pb-20 px-4 overflow-y-auto relative font-body select-none">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between">
      {/* Deck Header Info */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-mono text-snap bg-snap/10 px-2 py-0.5 rounded-full border border-snap/20">
            Venture Pitch
          </span>
          <span className="text-2xs text-ink-faint font-mono">
            Slide {currentSlide + 1} of {slidesCount}
          </span>
        </div>
        <button 
          onClick={() => setScreen('home')}
          className="p-1.5 rounded-full bg-surface text-ink-dim hover:text-ink hover:bg-navy-800 transition-colors cursor-pointer"
          aria-label="Close Pitch Deck"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar Indicators */}
      <div className="grid grid-cols-7 gap-1.5 mb-6 px-1">
        {Array.from({ length: slidesCount }).map((_, i) => (
          <div 
            key={i} 
            onClick={() => {
              setDirection(i > currentSlide ? 1 : -1);
              setCurrentSlide(i);
            }}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
              i === currentSlide 
                ? 'bg-snap shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                : i < currentSlide 
                  ? 'bg-snap/40' 
                  : 'bg-surface'
            }`}
          />
        ))}
      </div>

      {/* Slide Presentation Window */}
      <div className="flex-1 flex flex-col min-h-[380px] relative justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full flex-1 flex flex-col justify-between"
          >
            {/* SLIDE 1: COVER SLIDE */}
            {currentSlide === 0 && (
              <div className="flex flex-col justify-center items-center text-center py-6 h-full flex-1">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-snap/10 blur-2xl rounded-full" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-snap to-lime flex items-center justify-center text-white font-display font-bold text-2xl relative shadow-glow">
                    PS
                  </div>
                </div>
                
                <h1 className="text-4xl font-display font-bold tracking-tight text-ink mb-3">
                  Price<span className="pw-gradient-text">Snap</span>
                </h1>
                
                <p className="text-base font-display text-ink-dim max-w-xs mb-8 leading-relaxed">
                  The AI Appraisal Engine Re-imagining Secondhand Commerce
                </p>

                <div className="space-y-2 max-w-xs w-full bg-white border border-surface rounded-xl p-4 text-left shadow-sm">
                  <div className="text-2xs font-mono text-ink-faint uppercase tracking-wider">Presenting:</div>
                  <div className="text-xs text-ink-dim leading-snug">
                    Instant multi-modal appraisals helping Op Shops and power sellers unlock hidden revenue.
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2: THE PROBLEM */}
            {currentSlide === 1 && (
              <div className="flex flex-col h-full flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber" />
                    <h2 className="text-xl font-display font-semibold text-ink tracking-tight">
                      The Secondhand Friction
                    </h2>
                  </div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-4">
                    Thrift and charity stores lose up to 35% of potentially high-value inventory due to operational complexity.
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="pw-card-sm flex items-start gap-3 border-l-2 border-l-amber">
                    <Users className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-ink font-display">Unskilled Volunteers</h4>
                      <p className="text-2xs text-ink-dim">75% of staff are temporary volunteers unable to spot rare/vintage items.</p>
                    </div>
                  </div>

                  <div className="pw-card-sm flex items-start gap-3 border-l-2 border-l-amber">
                    <DollarSign className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-ink font-display">Severe Underpricing Loss</h4>
                      <p className="text-2xs text-ink-dim">Designer clothes and collectibles are routinely priced at standard baseline rates.</p>
                    </div>
                  </div>
                </div>

                {/* Interactive Loss Calculator */}
                <div className="bg-white border border-surface rounded-xl p-3.5 mt-auto shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xs text-ink-dim">Avg. value underpriced per item:</span>
                    <span className="text-xs font-mono font-bold text-amber">${underpriceValue}</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    value={underpriceValue}
                    onChange={(e) => setUnderpriceValue(Number(e.target.value))}
                    className="w-full accent-amber bg-surface h-1 rounded-full cursor-pointer mb-2"
                  />
                  <div className="flex justify-between items-center text-xs pt-1.5 border-t border-surface">
                    <span className="text-ink-faint text-2xs">Estimated Monthly Store Loss:</span>
                    <span className="font-bold font-mono text-amber text-sm">${calculatedLoss} / mo</span>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 3: THE SOLUTION */}
            {currentSlide === 2 && (
              <div className="flex flex-col h-full flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-snap" />
                    <h2 className="text-xl font-display font-semibold text-ink tracking-tight">
                      The PriceSnap Solution
                    </h2>
                  </div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-4">
                    A multi-modal visual scanner giving anyone expert appraisal insights in just one second.
                  </p>
                </div>

                {/* Visual Demo of the App in action */}
                <div className="pw-card p-4 relative overflow-hidden flex flex-col items-center justify-center my-2 border-dashed border-snap/40 bg-white/40">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-950/10" />
                  
                  {/* Camera scan silhouette */}
                  <div className="relative w-28 h-28 border-2 border-snap/30 rounded-xl flex items-center justify-center mb-2">
                    <span className="text-4xl animate-bounce">👟</span>
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-snap rounded-tl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-snap rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-snap rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-snap rounded-br" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-snap animate-pulse shadow-glow" />
                  </div>

                  <div className="text-center z-10">
                    <div className="text-xs font-display font-semibold text-ink">Gemini Multi-Modal Parsing</div>
                    <p className="text-[10px] text-ink-faint mt-0.5">Scans details, markings & styles instantly</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-auto">
                  <div className="pw-card-sm flex flex-col gap-1">
                    <Zap className="w-3.5 h-3.5 text-snap" />
                    <div className="text-[10px] font-semibold text-ink">Instant Speed</div>
                    <p className="text-[9px] text-ink-faint leading-snug">Bypasses long manual listing search times.</p>
                  </div>
                  <div className="pw-card-sm flex flex-col gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-snap" />
                    <div className="text-[10px] font-semibold text-ink">Confidence Score</div>
                    <p className="text-[9px] text-ink-faint leading-snug">Calculates certainty ratings based on real comps.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: THE MARKET */}
            {currentSlide === 3 && (
              <div className="flex flex-col h-full flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="w-5 h-5 text-lime" />
                    <h2 className="text-xl font-display font-semibold text-ink tracking-tight">
                      Market Opportunity
                    </h2>
                  </div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-3">
                    The resale market is growing 3x faster than traditional retail.
                  </p>
                </div>

                {/* Concentric Funnel Visualization */}
                <div className="space-y-3 my-2">
                  <div className="bg-white border border-surface rounded-xl p-3 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-2xs text-ink-faint font-mono uppercase">TAM (Total Addressable)</div>
                      <div className="text-base font-display font-bold text-ink">$250 Billion</div>
                    </div>
                    <span className="text-[10px] text-ink-faint bg-slate-100 px-2 py-0.5 rounded">Global Resale</span>
                  </div>

                  <div className="bg-white border border-surface rounded-xl p-3 flex justify-between items-center border-l-2 border-l-lime shadow-sm">
                    <div>
                      <div className="text-2xs text-ink-faint font-mono uppercase">SAM (Serviceable Addressable)</div>
                      <div className="text-base font-display font-bold text-lime">$40 Billion</div>
                    </div>
                    <span className="text-[10px] text-lime/80 bg-lime/10 border border-lime/20 px-2 py-0.5 rounded">Op Shop Sector</span>
                  </div>

                  <div className="bg-white border border-surface rounded-xl p-3 flex justify-between items-center border-l-2 border-l-snap shadow-sm">
                    <div>
                      <div className="text-2xs text-ink-faint font-mono uppercase">SOM (Serviceable Obtainable)</div>
                      <div className="text-base font-display font-bold text-snap">$800 Million</div>
                    </div>
                    <span className="text-[10px] text-snap bg-snap/10 border border-snap/20 px-2 py-0.5 rounded">SaaS Target TAM</span>
                  </div>
                </div>

                <div className="text-center mt-auto">
                  <p className="text-[10px] text-ink-faint leading-relaxed">
                    Op shops and independent thrifters are actively looking for digitised, volunteer-friendly software to capture value.
                  </p>
                </div>
              </div>
            )}

            {/* SLIDE 5: BUSINESS MODEL */}
            {currentSlide === 4 && (
              <div className="flex flex-col h-full flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-snap" />
                    <h2 className="text-xl font-display font-semibold text-ink tracking-tight">
                      Dual-Revenue Business Model
                    </h2>
                  </div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-3">
                    Subscription SaaS catering to bulk physical locations and individual high-volume resellers.
                  </p>
                </div>

                {/* Subscriptions */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="pw-card-sm border border-snap/20 bg-white flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="text-[10px] text-snap font-mono uppercase tracking-wider mb-1">Store Pro</div>
                      <div className="text-lg font-display font-bold text-ink">$49<span className="text-xs text-ink-dim font-normal">/mo</span></div>
                    </div>
                    <ul className="text-[8px] text-ink-dim space-y-1 mt-2">
                      <li>• Unlimited Scans</li>
                      <li>• Tablet Optimization</li>
                      <li>• POS Integrations</li>
                    </ul>
                  </div>

                  <div className="pw-card-sm border border-surface bg-white flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="text-[10px] text-ink-faint font-mono uppercase tracking-wider mb-1">Power Seller</div>
                      <div className="text-lg font-display font-bold text-ink">$9<span className="text-xs text-ink-dim font-normal">/mo</span></div>
                    </div>
                    <ul className="text-[8px] text-ink-dim space-y-1 mt-2">
                      <li>• Up to 200 Scans</li>
                      <li>• Cross-listing API</li>
                      <li>• Pricing Analytics</li>
                    </ul>
                  </div>
                </div>

                {/* ROI Estimation Calculator */}
                <div className="bg-white border border-surface rounded-xl p-3 mt-auto shadow-sm">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-2xs text-ink-dim">Monthly Store Scan Volume:</span>
                    <span className="text-xs font-mono font-bold text-snap">{scanVolume} scans</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="2000" 
                    step="100"
                    value={scanVolume}
                    onChange={(e) => setScanVolume(Number(e.target.value))}
                    className="w-full accent-snap bg-surface h-1 rounded-full cursor-pointer mb-2"
                  />
                  <div className="flex justify-between items-center text-xs pt-1.5 border-t border-surface">
                    <span className="text-ink-faint text-2xs">Estimated Monthly Software ROI:</span>
                    <span className="font-bold font-mono text-snap text-sm">+${calculatedROI} / mo</span>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 6: PILOT TRACTION */}
            {currentSlide === 5 && (
              <div className="flex flex-col h-full flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-lime" />
                    <h2 className="text-xl font-display font-semibold text-ink tracking-tight">
                      Pilot Program Traction
                    </h2>
                  </div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-4">
                    PriceSnap is already deployed in pilot programs yielding real bottom-line benefits.
                  </p>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-3 gap-2.5 my-3">
                  <div className="bg-white border border-surface rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xl font-display font-bold text-snap">12</div>
                    <div className="text-[9px] text-ink-faint uppercase tracking-wider mt-1">Active Stores</div>
                  </div>

                  <div className="bg-white border border-surface rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xl font-display font-bold text-snap">34%</div>
                    <div className="text-[9px] text-ink-faint uppercase tracking-wider mt-1">Margin Lift</div>
                  </div>

                  <div className="bg-white border border-surface rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xl font-display font-bold text-snap">1.2k+</div>
                    <div className="text-[9px] text-ink-faint uppercase tracking-wider mt-1">Hours Saved</div>
                  </div>
                </div>

                <div className="pw-card-sm bg-white/40 border border-surface p-3 rounded-xl mt-auto shadow-sm">
                  <div className="text-2xs italic text-ink-dim leading-relaxed text-center">
                    "Volunteers who used to spend hours searching eBay listing tabs now price vintage gems in seconds with flawless confidence. It's transformed our store revenue!"
                  </div>
                  <div className="text-[9px] text-ink-faint text-center mt-2 uppercase font-mono tracking-widest">— Red Cross Shop Pilot Lead</div>
                </div>
              </div>
            )}

            {/* SLIDE 7: THE ASK */}
            {currentSlide === 6 && (
              <div className="flex flex-col h-full flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Landmark className="w-5 h-5 text-snap" />
                    <h2 className="text-xl font-display font-semibold text-ink tracking-tight">
                      The Seed Round
                    </h2>
                  </div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-4">
                    We are raising our Seed round to accelerate scaling and build next-gen vintage listing automation.
                  </p>
                </div>

                <div className="bg-white border border-surface rounded-xl p-4 text-center my-3 shadow-md">
                  <div className="text-2xs text-ink-faint font-mono uppercase tracking-widest mb-1">Target Raise</div>
                  <div className="text-3xl font-display font-bold text-snap animate-pulse">$1,500,000</div>
                  <div className="text-2xs text-ink-dim mt-1.5">Equity Seed Financing</div>
                </div>

                {/* Fund Allocation bar */}
                <div className="space-y-1.5 mt-auto">
                  <div className="flex justify-between text-2xs text-ink-faint font-mono">
                    <span>50% Tech & AI</span>
                    <span>30% Growth & Sales</span>
                    <span>20% API Integrations</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full flex overflow-hidden">
                    <div className="bg-snap w-[50%] h-full" />
                    <div className="bg-lime w-[30%] h-full" />
                    <div className="bg-amber w-[20%] h-full" />
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button 
                    onClick={() => setScreen('home')}
                    className="pw-btn text-xs py-2 px-4 inline-flex items-center gap-1 hover:scale-105 transition-transform"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Return to Scanner App
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Controls */}
      <div className="mt-8 flex items-center justify-between px-1">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-btn font-display text-xs font-semibold border border-surface transition-all ${
            currentSlide === 0 
              ? 'text-ink-faint opacity-40 cursor-not-allowed' 
              : 'text-ink hover:bg-surface active:scale-95 cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={handleNext}
          disabled={currentSlide === slidesCount - 1}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-btn font-display text-xs font-semibold transition-all ${
            currentSlide === slidesCount - 1 
              ? 'text-ink-faint opacity-40 cursor-not-allowed border border-surface' 
              : 'bg-snap text-white hover:bg-snap-dark active:scale-95 cursor-pointer shadow-sm'
          }`}
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      </div>
    </div>
  );
}
