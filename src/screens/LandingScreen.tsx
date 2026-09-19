import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../store';
import {
  Camera,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  DollarSign,
  Layers,
  Search,
  Sliders,
  Store,
  Tag,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  BarChart3,
  Smartphone,
  Check
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { formatCurrency, triggerHaptic } from '../utils';

// Interactive Sample Items for the Live Demo Simulator
const SAMPLE_ITEMS = [
  {
    id: 'jersey',
    title: 'Vintage 1995 Canterbury All Blacks Jersey',
    brand: 'Canterbury of NZ',
    category: 'Vintage Apparel',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    conditionScore: 8.8,
    conditionGrade: 'A',
    defects: ['Minor collar fade consistent with 90s era', 'Embroidered silver fern intact'],
    recommendedPrice: 165,
    trademe: { low: 130, median: 165, high: 195 },
    facebook: { low: 110, median: 145, high: 170 },
    ebay: { low: 150, median: 185, high: 230 },
    bestPlatform: 'Trade Me',
    trend: 'Rising (+18% YoY)',
    confidence: 96,
    insight: 'High demand from collectors ahead of international rugby tests.'
  },
  {
    id: 'headphones',
    title: 'Sony WH-1000XM4 Noise Canceling',
    brand: 'Sony',
    category: 'Electronics & Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    conditionScore: 9.1,
    conditionGrade: 'A+',
    defects: ['Original travel case included', 'Pristine ear cushions, minimal headband wear'],
    recommendedPrice: 245,
    trademe: { low: 210, median: 245, high: 280 },
    facebook: { low: 190, median: 230, high: 260 },
    ebay: { low: 220, median: 255, high: 295 },
    bestPlatform: 'Trade Me',
    trend: 'Stable',
    confidence: 98,
    insight: 'Consistently sells within 48 hours on Trade Me with Buy Now enabled.'
  },
  {
    id: 'boots',
    title: 'R.M. Williams Comfort Craftsman Boots',
    brand: 'R.M. Williams',
    category: 'Footwear & Leather',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    conditionScore: 7.9,
    conditionGrade: 'B+',
    defects: ['Minor leather creasing at vamp', 'Elastic side gussets tight, original soles'],
    recommendedPrice: 290,
    trademe: { low: 240, median: 290, high: 340 },
    facebook: { low: 220, median: 275, high: 310 },
    ebay: { low: 260, median: 315, high: 380 },
    bestPlatform: 'Trade Me / FB Mkt',
    trend: 'High Velocity',
    confidence: 94,
    insight: 'Premium Aussie leather retains ~65% of retail price in NZ resale.'
  },
  {
    id: 'dish',
    title: 'Crown Lynn / Retro Pyrex Daisy Casserole',
    brand: 'Pyrex / Crown Lynn',
    category: 'Antiques & Kiwi Collectibles',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
    conditionScore: 8.5,
    conditionGrade: 'A',
    defects: ['No flea bites or chips on rim', 'Vibrant screenprint floral pattern'],
    recommendedPrice: 95,
    trademe: { low: 75, median: 95, high: 125 },
    facebook: { low: 60, median: 85, high: 105 },
    ebay: { low: 85, median: 110, high: 145 },
    bestPlatform: 'Trade Me',
    trend: 'Rising (+22%)',
    confidence: 92,
    insight: 'Vintage Australasian kitchenware has surging collector interest in 2026.'
  }
];

const FAQ_ITEMS = [
  {
    q: 'How does PriceSnap know accurate New Zealand market values?',
    a: 'PriceSnap is specifically tuned for the New Zealand secondhand economy. It benchmarks prices against recent listings, historical sales data, and auction clearances across Trade Me, Facebook Marketplace NZ, and eBay, converting values into realistic NZD ranges.'
  },
  {
    q: 'Can volunteers at charity op shops use it without training?',
    a: 'Yes! Simply open the camera scanner on any phone, point it at clothing tags, vintage glass, electronics, or shoes, and tap Snap. In under 2 seconds, it outputs an objective condition grade (1-10) and a recommended price sticker.'
  },
  {
    q: 'What happens if there is no internet connection in a thrift store basement?',
    a: 'PriceSnap includes a built-in offline catalog engine. If mobile reception drops, the local deterministic appraisal engine immediately steps in with verified benchmark valuations so sorting never stops.'
  },
  {
    q: 'How does the condition and defect analysis work?',
    a: 'Our Gemini 3.6 Flash vision pipeline examines high-resolution photo details — detecting surface scuffs, fabric pilling, yellowing, missing accessories, or brand authenticity hallmarks — and calculates an objective condition grade from A+ to D.'
  },
  {
    q: 'Do I need to install an app from the App Store or Google Play?',
    a: 'No store download is required. PriceSnap is a high-performance Progressive Web App (PWA). You can tap "Install App" or "Add to Home Screen" on Safari or Chrome to launch it as a full-screen standalone app.'
  }
];

export default function LandingScreen() {
  const { setScreen } = useAppState();
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Interactive ROI Calculator State
  const [weeklyItems, setWeeklyItems] = useState(120);
  const [undervaluePerItem, setUndervaluePerItem] = useState(30);

  const activeDemo = SAMPLE_ITEMS[selectedDemoIndex];

  // Calculations for ROI Widget
  const monthlyRevenueUnlocked = Math.round(weeklyItems * undervaluePerItem * 4.33);
  const annualRevenueUnlocked = Math.round(monthlyRevenueUnlocked * 12);
  const hoursSavedWeekly = Math.round((weeklyItems * 3) / 60);

  const handleLaunchScanner = () => {
    triggerHaptic();
    setScreen('scanner');
  };

  const handleLaunchHome = () => {
    triggerHaptic();
    setScreen('home');
  };

  const handleLaunchPitch = () => {
    triggerHaptic();
    setScreen('pitch');
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-navy-950 text-ink selection:bg-snap/20 overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. TOP RESPONSIVE HEADER */}
      {/* ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-navy-950/90 backdrop-blur-md border-b border-surface/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo & NZ Flag Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleLaunchHome}>
              <Logo className="w-9 h-9 sm:w-10 sm:h-10 hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-ink">PriceSnap</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-snap/10 text-snap border border-snap/20">
                    NZ 🇳🇿
                  </span>
                </div>
                <span className="text-[10px] text-ink-faint hidden sm:inline-block">AI Resale & Op Shop Appraisals</span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-medium text-ink-dim">
            <a href="#demo" className="hover:text-snap transition-colors">Live Demo</a>
            <a href="#how-it-works" className="hover:text-snap transition-colors">How It Works</a>
            <a href="#personas" className="hover:text-snap transition-colors">Op Shops & Resellers</a>
            <a href="#calculator" className="hover:text-snap transition-colors">ROI Calculator</a>
            <a href="#faq" className="hover:text-snap transition-colors">FAQ</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleLaunchPitch}
              className="px-3 py-2 text-xs font-semibold text-ink-dim hover:text-ink hover:bg-navy-900 rounded-xl border border-transparent hover:border-surface transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-snap" />
              <span className="hidden sm:inline">Venture</span>
              <span>Pitch</span>
            </button>

            <button
              onClick={handleLaunchScanner}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-snap hover:bg-snap-dark active:scale-95 text-white font-display font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-snap/20 flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Open Scanner</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. HERO SECTION WITH RESPONSIVE MULTI-COLUMN BENTO */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 overflow-hidden border-b border-surface/50">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-snap/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-lime/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col text-center lg:text-left items-center lg:items-start">
              
              {/* Top Announcement Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-snap/10 border border-snap/25 text-snap text-xs font-semibold mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-snap animate-pulse" />
                <span>New Zealand’s First Dedicated AI Thrift Valuation Engine</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-ink leading-[1.12] mb-6 max-w-2xl">
                Snap any thrift find. <br className="hidden sm:block" />
                Know what it’s worth in <span className="pw-gradient-text">seconds</span>.
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-ink-dim max-w-xl mb-8 leading-relaxed">
                Empowering Kiwi op shop volunteers, secondhand flippers, and vintage collectors. Instantly benchmark resale values across <strong>Trade Me</strong>, <strong>Facebook Marketplace</strong>, and <strong>eBay</strong> with automated 1–10 condition grading.
              </p>

              {/* Responsive CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-10">
                <button
                  onClick={handleLaunchScanner}
                  className="w-full sm:w-auto px-7 py-4 bg-snap hover:bg-snap-dark active:scale-95 text-white font-display font-bold text-base rounded-2xl shadow-xl shadow-snap/25 transition-all flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Launch Camera Scanner</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleLaunchHome}
                  className="w-full sm:w-auto px-6 py-4 bg-navy-900 hover:bg-navy-800 text-ink font-display font-semibold text-base rounded-2xl border border-surface shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore App Dashboard</span>
                </button>
              </div>

              {/* Trust & Metric Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-6 border-t border-surface/60 text-left">
                <div className="p-3 bg-navy-900/70 rounded-xl border border-surface/60">
                  <div className="text-lg font-bold font-display text-snap">45,000+</div>
                  <div className="text-[11px] text-ink-dim font-medium">NZ Benchmarks</div>
                </div>
                <div className="p-3 bg-navy-900/70 rounded-xl border border-surface/60">
                  <div className="text-lg font-bold font-display text-ink">&lt; 1.2s</div>
                  <div className="text-[11px] text-ink-dim font-medium">Gemini Latency</div>
                </div>
                <div className="p-3 bg-navy-900/70 rounded-xl border border-surface/60">
                  <div className="text-lg font-bold font-display text-lime">3 Markets</div>
                  <div className="text-[11px] text-ink-dim font-medium">Trade Me / FB / eBay</div>
                </div>
                <div className="p-3 bg-navy-900/70 rounded-xl border border-surface/60">
                  <div className="text-lg font-bold font-display text-amber">100%</div>
                  <div className="text-[11px] text-ink-dim font-medium">Offline Resilient</div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Live Simulator Card */}
            <div id="demo" className="lg:col-span-6 xl:col-span-5 w-full">
              <div className="w-full bg-navy-900 rounded-3xl border border-surface shadow-2xl overflow-hidden p-5 sm:p-6 transition-all">
                
                {/* Simulator Header */}
                <div className="flex items-center justify-between pb-4 border-b border-surface mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-snap animate-ping" />
                    <span className="font-display font-bold text-sm text-ink tracking-tight">Interactive Live Valuation</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-bold text-snap bg-snap/10 px-2 py-0.5 rounded-full border border-snap/20">
                    Live Demo
                  </span>
                </div>

                {/* Sample Item Selector Pills */}
                <div className="mb-4">
                  <div className="text-[11px] font-semibold text-ink-dim uppercase tracking-wider mb-2">
                    Choose a thrift sample to test:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {SAMPLE_ITEMS.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          triggerHaptic();
                          setSelectedDemoIndex(idx);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-center transition-all truncate ${
                          selectedDemoIndex === idx
                            ? 'bg-snap text-white shadow-sm font-bold'
                            : 'bg-navy-800 text-ink-dim hover:text-ink hover:bg-navy-750'
                        }`}
                        title={item.title}
                      >
                        {item.brand.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Item Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDemo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Item Image with Bounding Box Scanner Overlay */}
                    <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-surface bg-navy-950">
                      <img
                        src={activeDemo.image}
                        alt={activeDemo.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                      
                      {/* Scanning overlay tag */}
                      <div className="absolute top-3 left-3 bg-navy-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-surface flex items-center gap-1.5 text-xs font-semibold text-ink">
                        <CheckCircle2 className="w-3.5 h-3.5 text-snap" />
                        <span>{activeDemo.category}</span>
                      </div>

                      {/* Condition Badge in image */}
                      <div className="absolute bottom-3 left-3 bg-navy-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-snap/30 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-snap/20 text-snap flex items-center justify-center font-display font-bold text-xs">
                          {activeDemo.conditionGrade}
                        </div>
                        <div>
                          <div className="text-[10px] text-ink-faint">Condition Score</div>
                          <div className="text-xs font-bold text-ink">{activeDemo.conditionScore} / 10</div>
                        </div>
                      </div>

                      {/* AI Confidence */}
                      <div className="absolute bottom-3 right-3 bg-navy-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-surface text-[11px] font-mono text-snap font-semibold">
                        {activeDemo.confidence}% Confidence
                      </div>
                    </div>

                    {/* Item Title & Defect List */}
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-ink line-clamp-1">
                        {activeDemo.title}
                      </h3>
                      <p className="text-xs text-ink-dim mt-0.5 line-clamp-1">{activeDemo.insight}</p>
                      
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {activeDemo.defects.map((defect, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-navy-800 text-ink-dim border border-surface">
                            <Tag className="w-3 h-3 text-snap shrink-0" />
                            <span className="truncate max-w-[280px]">{defect}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Multi-Platform Valuation Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-surface">
                      <div className="p-2.5 rounded-xl bg-navy-800/80 border border-snap/30 text-center relative overflow-hidden">
                        <div className="text-[10px] font-bold text-snap uppercase tracking-wider">Trade Me (NZ)</div>
                        <div className="text-base font-display font-extrabold text-ink mt-0.5">
                          {formatCurrency(activeDemo.trademe.median)}
                        </div>
                        <div className="text-[10px] text-ink-faint">
                          {formatCurrency(activeDemo.trademe.low)} - {formatCurrency(activeDemo.trademe.high)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-navy-800/80 border border-surface text-center">
                        <div className="text-[10px] font-semibold text-ink-dim uppercase tracking-wider">Facebook Mkt</div>
                        <div className="text-base font-display font-bold text-ink mt-0.5">
                          {formatCurrency(activeDemo.facebook.median)}
                        </div>
                        <div className="text-[10px] text-ink-faint">
                          {formatCurrency(activeDemo.facebook.low)} - {formatCurrency(activeDemo.facebook.high)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-navy-800/80 border border-surface text-center">
                        <div className="text-[10px] font-semibold text-ink-dim uppercase tracking-wider">eBay Global</div>
                        <div className="text-base font-display font-bold text-ink mt-0.5">
                          {formatCurrency(activeDemo.ebay.median)}
                        </div>
                        <div className="text-[10px] text-ink-faint">
                          {formatCurrency(activeDemo.ebay.low)} - {formatCurrency(activeDemo.ebay.high)}
                        </div>
                      </div>
                    </div>

                    {/* Scan Your Own Item CTA */}
                    <button
                      onClick={handleLaunchScanner}
                      className="w-full py-3 bg-snap/15 hover:bg-snap text-snap hover:text-white font-display font-semibold rounded-xl text-xs sm:text-sm border border-snap/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan Your Own Item for Real Values →</span>
                    </button>
                  </motion.div>
                </AnimatePresence>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. HOW IT WORKS (3-STEP VISUAL BENTO GRID) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="w-full py-16 sm:py-24 border-b border-surface/50 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold font-mono text-snap uppercase tracking-widest bg-snap/10 px-3 py-1 rounded-full border border-snap/20">
              Frictionless 3-Step Process
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-ink tracking-tight mt-3 mb-3">
              How PriceSnap Works
            </h2>
            <p className="text-sm sm:text-base text-ink-dim leading-relaxed">
              Designed for rapid, one-handed operation in charity sorting bins or crowded garage sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Step 1 */}
            <div className="pw-card flex flex-col justify-between bg-navy-900 border border-surface hover:border-snap/40 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-snap/10 text-snap flex items-center justify-center border border-snap/20 group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-ink-faint/40 group-hover:text-snap/40 transition-colors">01</span>
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-2">1. Point & Capture</h3>
                <p className="text-sm text-ink-dim leading-relaxed">
                  Snap a photo using your smartphone camera or upload from your device gallery. Frame tags, labels, or maker’s marks for maximum appraisal accuracy.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface flex items-center gap-2 text-xs font-semibold text-snap">
                <Check className="w-4 h-4" />
                <span>Auto-frames clothing, shoes & antiques</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="pw-card flex flex-col justify-between bg-navy-900 border border-surface hover:border-snap/40 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-lime/10 text-lime flex items-center justify-center border border-lime/20 group-hover:scale-105 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-ink-faint/40 group-hover:text-lime/40 transition-colors">02</span>
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-2">2. AI Vision & Condition</h3>
                <p className="text-sm text-ink-dim leading-relaxed">
                  Gemini 3.6 Flash analyzes material composition, vintage era, stitches, and defects to generate an objective 1–10 condition score and letter grade.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface flex items-center gap-2 text-xs font-semibold text-lime">
                <Check className="w-4 h-4" />
                <span>Identifies flaws, stains & scratches</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="pw-card flex flex-col justify-between bg-navy-900 border border-surface hover:border-snap/40 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber/10 text-amber flex items-center justify-center border border-amber/20 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-ink-faint/40 group-hover:text-amber/40 transition-colors">03</span>
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-2">3. Tri-Marketplace NZ Pricing</h3>
                <p className="text-sm text-ink-dim leading-relaxed">
                  Receive immediate low, median, and high price estimates in NZD for Trade Me, Facebook Marketplace, and eBay with optimal platform recommendations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface flex items-center gap-2 text-xs font-semibold text-amber">
                <Check className="w-4 h-4" />
                <span>Calibrated for New Zealand dollars</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. DUAL PERSONA HIGHLIGHT: OP SHOPS VS RESELLERS */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section id="personas" className="w-full py-16 sm:py-24 border-b border-surface/50 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-ink tracking-tight mb-3">
              Built for Both Sides of the Secondhand Economy
            </h2>
            <p className="text-sm sm:text-base text-ink-dim leading-relaxed">
              Whether you’re managing charity op-shop donations or scouting flea markets for profitable flips.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Persona 1: Op Shops & Charity Retail */}
            <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-surface shadow-lg flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-snap/10 text-snap text-xs font-bold mb-4 border border-snap/20">
                  <Store className="w-3.5 h-3.5" />
                  <span>For Op Shops, Hospices & Charities</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-3">
                  Never Underprice Rare Donations Again
                </h3>
                <p className="text-sm text-ink-dim leading-relaxed mb-6">
                  Charity stores lose thousands of dollars each month when valuable vintage clothing, designer bags, or rare collectibles get stickered for $5. PriceSnap empowers volunteers of any experience level to price with confidence.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-snap/20 text-snap flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-ink">
                      <strong>Volunteer-Ready:</strong> Zero training needed — volunteers just point the phone camera.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-snap/20 text-snap flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-ink">
                      <strong>Catch High-Value Gems:</strong> Flag items worth listing on Trade Me instead of the $2 rack.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-snap/20 text-snap flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-ink">
                      <strong>Boost Fundraising Revenue:</strong> Op shops report 25%–40% uplift in monthly intake.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface flex items-center justify-between">
                <span className="text-xs text-ink-faint">Standardized charity sorting</span>
                <button
                  onClick={handleLaunchPitch}
                  className="text-xs font-bold text-snap hover:underline flex items-center gap-1"
                >
                  <span>See Charity Case Study</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Persona 2: Resellers & Thrifters */}
            <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-surface shadow-lg flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 text-lime text-xs font-bold mb-4 border border-lime/20">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>For Resellers, Flippers & Thrifters</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-3">
                  Scan Racks in Seconds & Maximize Margins
                </h3>
                <p className="text-sm text-ink-dim leading-relaxed mb-6">
                  Save time typing manual search queries into Trade Me or eBay while standing in an aisle. Instantly evaluate profit margins, listing fees, and velocity before buying.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-lime/20 text-lime flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-ink">
                      <strong>Instant Flips:</strong> Know median clearance prices and historical sales velocity.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-lime/20 text-lime flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-ink">
                      <strong>Platform Arbitrage:</strong> Know whether to list locally on FB Marketplace or auction on Trade Me.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-lime/20 text-lime flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-ink">
                      <strong>Persistent History:</strong> Save appraisals for quick drafting of Trade Me listings.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface flex items-center justify-between">
                <span className="text-xs text-ink-faint">Rapid in-store scanning</span>
                <button
                  onClick={handleLaunchScanner}
                  className="text-xs font-bold text-lime hover:underline flex items-center gap-1"
                >
                  <span>Start Scanning Free</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 5. INTERACTIVE ROI & REVENUE CALCULATOR WIDGET */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section id="calculator" className="w-full py-16 sm:py-24 border-b border-surface/50 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="w-full bg-navy-900 rounded-3xl border border-surface p-6 sm:p-10 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Sliders */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-snap/10 text-snap text-xs font-bold mb-3 border border-snap/20">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Interactive Impact Calculator</span>
                </div>
                
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight mb-3">
                  Calculate Your Unlocked Resale Value
                </h2>
                <p className="text-sm text-ink-dim mb-8">
                  Adjust the sliders to see how much underpriced revenue PriceSnap can recapture for your store or thrift business each month.
                </p>

                {/* Slider 1: Items Scanned Per Week */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">
                      Donations / Items Scanned Per Week
                    </label>
                    <span className="font-display font-bold text-base text-snap bg-snap/10 px-2.5 py-0.5 rounded-lg border border-snap/20">
                      {weeklyItems} items
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={weeklyItems}
                    onChange={(e) => setWeeklyItems(Number(e.target.value))}
                    className="w-full accent-snap cursor-pointer h-2 bg-navy-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-ink-faint mt-1">
                    <span>10 items/wk</span>
                    <span>250 items/wk</span>
                    <span>500 items/wk</span>
                  </div>
                </div>

                {/* Slider 2: Average Undervaluation Per Item */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">
                      Average Price Difference Discovered
                    </label>
                    <span className="font-display font-bold text-base text-lime bg-lime/10 px-2.5 py-0.5 rounded-lg border border-lime/20">
                      ${undervaluePerItem} NZD
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={undervaluePerItem}
                    onChange={(e) => setUndervaluePerItem(Number(e.target.value))}
                    className="w-full accent-lime cursor-pointer h-2 bg-navy-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-ink-faint mt-1">
                    <span>$10 NZD</span>
                    <span>$60 NZD</span>
                    <span>$120 NZD</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Computed Real-Time Metrics */}
              <div className="lg:col-span-5 bg-navy-950 p-6 sm:p-8 rounded-2xl border border-surface flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-1">
                    Estimated Monthly Revenue Recaptured
                  </div>
                  <div className="font-display font-extrabold text-3xl sm:text-4xl text-snap mb-4">
                    +{formatCurrency(monthlyRevenueUnlocked)} <span className="text-sm font-body text-ink-dim">NZD / mo</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-surface mb-6">
                    <div>
                      <div className="text-[11px] text-ink-faint">Annual Impact</div>
                      <div className="text-base sm:text-lg font-bold font-display text-ink mt-0.5">
                        +{formatCurrency(annualRevenueUnlocked)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-ink-faint">Time Saved</div>
                      <div className="text-base sm:text-lg font-bold font-display text-ink mt-0.5">
                        ~{hoursSavedWeekly} hrs / wk
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLaunchScanner}
                  className="w-full py-3.5 bg-snap hover:bg-snap-dark active:scale-95 text-white font-display font-bold text-sm rounded-xl transition-all shadow-md shadow-snap/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Unlocking Value Now</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 6. MARKETPLACE BENCHMARK MATRIX */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 border-b border-surface/50 bg-navy-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-ink tracking-tight mb-3">
              Where to List in New Zealand
            </h2>
            <p className="text-sm sm:text-base text-ink-dim">
              PriceSnap intelligently recommends the best marketplace for your specific item.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Trade Me */}
            <div className="pw-card bg-navy-900 border border-surface p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-bold text-lg text-ink">Trade Me</span>
                  <span className="text-[10px] font-bold text-snap bg-snap/10 px-2 py-0.5 rounded border border-snap/20">NZ PRIMARY</span>
                </div>
                <p className="text-xs text-ink-dim leading-relaxed mb-4">
                  Best for high-value designer clothing, vintage All Blacks jerseys, retro electronics, and collectibles where auction bids drive premium prices.
                </p>
                <div className="space-y-1.5 text-xs text-ink mb-4">
                  <div className="flex justify-between py-1 border-b border-surface/50">
                    <span className="text-ink-faint">Audience</span>
                    <span className="font-medium">Nationwide NZ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface/50">
                    <span className="text-ink-faint">Ideal For</span>
                    <span className="font-medium">Collectibles & Tech</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-faint">Payment</span>
                    <span className="font-medium">Ping / Bank Transfer</span>
                  </div>
                </div>
              </div>
              <div className="text-xs font-semibold text-snap">✓ Highest average sale prices</div>
            </div>

            {/* Facebook Marketplace */}
            <div className="pw-card bg-navy-900 border border-surface p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-bold text-lg text-ink">FB Marketplace</span>
                  <span className="text-[10px] font-bold text-lime bg-lime/10 px-2 py-0.5 rounded border border-lime/20">FAST CASH</span>
                </div>
                <p className="text-xs text-ink-dim leading-relaxed mb-4">
                  Best for bulky goods, furniture, tools, everyday clothing, and quick same-day local cash pickups without shipping hassle.
                </p>
                <div className="space-y-1.5 text-xs text-ink mb-4">
                  <div className="flex justify-between py-1 border-b border-surface/50">
                    <span className="text-ink-faint">Audience</span>
                    <span className="font-medium">Local Suburb / City</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface/50">
                    <span className="text-ink-faint">Ideal For</span>
                    <span className="font-medium">Furniture & Quick Flips</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-faint">Fees</span>
                    <span className="font-medium">0% Listing Fees</span>
                  </div>
                </div>
              </div>
              <div className="text-xs font-semibold text-lime">✓ Zero seller commission fees</div>
            </div>

            {/* eBay Global */}
            <div className="pw-card bg-navy-900 border border-surface p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-bold text-lg text-ink">eBay Global</span>
                  <span className="text-[10px] font-bold text-amber bg-amber/10 px-2 py-0.5 rounded border border-amber/20">COLLECTORS</span>
                </div>
                <p className="text-xs text-ink-dim leading-relaxed mb-4">
                  Best for ultra-rare Crown Lynn pottery, vintage band tees, retro gaming items, and rare coins that command overseas buyer premiums.
                </p>
                <div className="space-y-1.5 text-xs text-ink mb-4">
                  <div className="flex justify-between py-1 border-b border-surface/50">
                    <span className="text-ink-faint">Audience</span>
                    <span className="font-medium">Global (US, UK, AU)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface/50">
                    <span className="text-ink-faint">Ideal For</span>
                    <span className="font-medium">Rare Antiques & Cards</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-faint">Currency</span>
                    <span className="font-medium">USD / AUD / NZD</span>
                  </div>
                </div>
              </div>
              <div className="text-xs font-semibold text-amber">✓ Access to international collector base</div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 7. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="w-full py-16 sm:py-24 border-b border-surface/50 bg-navy-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-ink tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-ink-dim">
              Everything you need to know about scanning and pricing thrift finds in New Zealand.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQ_ITEMS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-navy-900 border border-surface overflow-hidden transition-all"
              >
                <button
                  onClick={() => {
                    triggerHaptic();
                    setOpenFaq(openFaq === idx ? null : idx);
                  }}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display font-bold text-sm sm:text-base text-ink">{faq.q}</span>
                  <div className={`w-7 h-7 rounded-lg bg-navy-800 flex items-center justify-center shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-snap' : 'text-ink-dim'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-ink-dim leading-relaxed border-t border-surface/50 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 8. BOTTOM CALL TO ACTION BANNER */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-navy-950 to-navy-900 border-b border-surface/50 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="w-16 h-16 rounded-3xl bg-snap/10 text-snap flex items-center justify-center mx-auto mb-6 border border-snap/20 shadow-lg shadow-snap/10">
            <Camera className="w-8 h-8" />
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-ink tracking-tight mb-4 max-w-2xl mx-auto">
            Ready to Price Any Thrift Find in New Zealand?
          </h2>

          <p className="text-base sm:text-lg text-ink-dim max-w-xl mx-auto mb-8">
            No downloads or registration required. Launch the camera scanner now and appraise your first item in under two seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={handleLaunchScanner}
              className="w-full sm:w-auto px-8 py-4 bg-snap hover:bg-snap-dark active:scale-95 text-white font-display font-bold text-base rounded-2xl shadow-xl shadow-snap/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Launch Camera Scanner</span>
            </button>

            <button
              onClick={handleLaunchPitch}
              className="w-full sm:w-auto px-6 py-4 bg-navy-900 hover:bg-navy-800 text-ink font-display font-semibold text-base rounded-2xl border border-surface shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-snap" />
              <span>View Pitch Deck</span>
            </button>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 9. RESPONSIVE FOOTER */}
      {/* ─────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-navy-950 py-10 sm:py-12 border-t border-surface/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-ink-dim">
          
          <div className="flex items-center gap-3">
            <Logo className="w-7 h-7" />
            <div>
              <div className="font-display font-bold text-ink">PriceSnap AI</div>
              <div className="text-[11px] text-ink-faint">© 2026 PriceSnap. Dedicated New Zealand Resale & Valuation.</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 font-medium">
            <button onClick={() => setScreen('privacy')} className="hover:text-snap transition-colors cursor-pointer">
              Privacy Policy & Terms
            </button>
            <button onClick={() => setScreen('pitch')} className="hover:text-snap transition-colors cursor-pointer">
              Investor Pitch Deck
            </button>
            <button onClick={() => setScreen('home')} className="hover:text-snap transition-colors cursor-pointer">
              App Dashboard
            </button>
            <button onClick={() => setScreen('scanner')} className="text-snap font-bold hover:underline cursor-pointer">
              Live Camera Scanner
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
}
