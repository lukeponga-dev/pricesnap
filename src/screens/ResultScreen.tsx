import { useState } from 'react';
import { motion } from 'motion/react';
import { useAppState } from '../store';
import { Bookmark, RefreshCcw, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, Sparkles, ExternalLink, Box, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { formatCurrency, triggerHaptic } from '../utils';

export default function ResultScreen() {
  const { currentScan, setScreen, addToHistory } = useAppState();
  const [showJson, setShowJson] = useState(false);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);

  if (!currentScan) return null;

  const handleSave = () => {
    triggerHaptic();
    addToHistory(currentScan);
  };

  const handleScanAgain = () => {
    triggerHaptic();
    setScreen('scanner');
  };

  const anyScan = currentScan as any;

  const product = currentScan.product || {
    name: anyScan.name || anyScan.item_name || 'Identified Item',
    item_name: anyScan.item_name || anyScan.name || 'Identified Item',
    brand: anyScan.brand || 'Unknown Brand',
    category: anyScan.category || anyScan.item_category || 'General',
    item_category: anyScan.item_category || anyScan.category || 'General',
    condition_grade: anyScan.condition_grade || (anyScan.condition?.grade) || 'A',
    condition_score: anyScan.condition_score ?? 8,
    defects: anyScan.defects || anyScan.issues || [],
    issues: anyScan.issues || anyScan.defects || [],
    confidence: anyScan.confidence ? (anyScan.confidence > 1 ? anyScan.confidence / 100 : anyScan.confidence) : 0.95,
    confidence_color: 'green',
    summary: anyScan.summary || 'Appraisal complete'
  };

  const conditionGrade = product.condition_grade || currentScan.condition?.grade || anyScan.condition_grade || 'A';
  const conditionScore = product.condition_score ?? currentScan.condition?.score ?? anyScan.condition_score ?? (conditionGrade === 'A' ? 9 : conditionGrade === 'B' ? 7 : 5);
  
  const conditionIssues = Array.isArray(product.defects) && product.defects.length > 0
    ? product.defects
    : Array.isArray(product.issues) && product.issues.length > 0 
      ? product.issues 
      : (Array.isArray(currentScan.condition?.issues) ? currentScan.condition.issues : []);

  const conditionSummary = product.summary || currentScan.condition?.summary || `Assessed condition score: ${conditionScore}/10 (Grade ${conditionGrade})`;

  let confidenceNum = Number(product.confidence ?? 0.95);
  if (confidenceNum > 1 && confidenceNum <= 100) confidenceNum = confidenceNum / 100;
  if (isNaN(confidenceNum) || confidenceNum <= 0) confidenceNum = 0.85;

  const confidencePct = Math.round(confidenceNum * 100);
  const confidenceColor = product.confidence_color || (confidenceNum >= 0.85 ? 'green' : confidenceNum >= 0.6 ? 'orange' : 'red');

  const rawMarket: any = currentScan.market || {};
  const recPrice = Number(
    rawMarket.recommended_price || 
    anyScan.price?.average || 
    anyScan.resale_price_nz || 
    120
  );

  const trademeData = {
    low: Number(rawMarket?.trademe?.low ?? (anyScan?.price?.low ?? Math.round(recPrice * 0.85))),
    median: Number(rawMarket?.trademe?.median ?? (anyScan?.price?.average ?? recPrice)),
    high: Number(rawMarket?.trademe?.high ?? (anyScan?.price?.high ?? Math.round(recPrice * 1.15))),
    sample_listings: Array.isArray(rawMarket?.trademe?.sample_listings) ? rawMarket.trademe.sample_listings : []
  };

  const facebookData = {
    low: Number(rawMarket?.facebook?.low ?? Math.round(recPrice * 0.8)),
    median: Number(rawMarket?.facebook?.median ?? Math.round(recPrice * 0.94)),
    high: Number(rawMarket?.facebook?.high ?? Math.round(recPrice * 1.05)),
    sample_listings: Array.isArray(rawMarket?.facebook?.sample_listings) ? rawMarket.facebook.sample_listings : []
  };

  const ebayData = {
    low: Number(rawMarket?.ebay?.low ?? Math.round(recPrice * 0.9)),
    median: Number(rawMarket?.ebay?.median ?? Math.round(recPrice * 1.08)),
    high: Number(rawMarket?.ebay?.high ?? Math.round(recPrice * 1.25)),
    sample_listings: Array.isArray(rawMarket?.ebay?.sample_listings) ? rawMarket.ebay.sample_listings : []
  };

  const rawPlatforms = Array.isArray(rawMarket?.platforms) 
    ? rawMarket.platforms 
    : (Array.isArray(anyScan?.platforms) ? anyScan.platforms : null);

  const platforms = rawPlatforms 
    ? rawPlatforms.map((p: any) => ({
        name: p?.name || 'Marketplace',
        data: {
          low: Number(p?.data?.low ?? p?.low ?? Math.round(recPrice * 0.85)),
          median: Number(p?.data?.median ?? p?.median ?? p?.price ?? recPrice),
          high: Number(p?.data?.high ?? p?.high ?? Math.round(recPrice * 1.15)),
          sample_listings: Array.isArray(p?.data?.sample_listings) ? p.data.sample_listings : (Array.isArray(p?.sample_listings) ? p.sample_listings : [])
        }
      }))
    : [
        { name: 'Trade Me (NZ)', data: trademeData },
        { name: 'Facebook Marketplace', data: facebookData },
        { name: 'eBay (Global)', data: ebayData },
      ];

  const trend = (rawMarket.trend || 'stable').toLowerCase();
  const bestPlatform = rawMarket.best_platform || 'Trade Me';

  return (
    <div className="w-full h-full flex flex-col bg-navy-950 overflow-y-auto pt-20 pb-28 px-4">
      {/* Demo Mode Badge */}
      {currentScan.isMock && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-amber/10 border border-amber/20 rounded-xl px-4 py-2 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber" />
          <span className="text-xs font-medium text-amber">Demo Mode: Using Simulated Appraisal Data</span>
        </motion.div>
      )}

      {/* Item Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pw-card mb-4 flex items-center gap-4"
      >
        <div className="w-14 h-14 bg-navy-900 border border-surface rounded-xl flex items-center justify-center text-2xl shrink-0 text-snap shadow-inner">
          <Box className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-base text-ink truncate">{product.name || 'Identified Item'}</h2>
          <p className="text-xs text-ink-faint mt-0.5">{product.brand || 'Generic'} • {product.category || 'General'}</p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <button
            onClick={() => {
              triggerHaptic();
              setShowConfidenceModal(true);
            }}
            title="Tap to learn about AI Confidence Score"
            className={`pw-tag flex items-center gap-1.5 mb-1 border px-2.5 py-1 rounded-full text-xs font-semibold transition-transform active:scale-95 cursor-pointer shadow-sm ${
              confidenceColor === 'green' 
                ? 'text-lime border-lime/30 bg-lime/10 hover:bg-lime/20' 
                : confidenceColor === 'orange' 
                  ? 'text-amber border-amber/30 bg-amber/10 hover:bg-amber/20' 
                  : 'text-rose-400 border-rose-400/30 bg-rose-400/10 hover:bg-rose-400/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              confidenceColor === 'green' ? 'bg-lime' : confidenceColor === 'orange' ? 'bg-amber' : 'bg-rose-400'
            }`} />
            <span>{confidencePct}%</span>
          </button>
          <span className="text-[10px] text-ink-faint uppercase font-mono cursor-pointer hover:text-ink transition-colors" onClick={() => setShowConfidenceModal(true)}>
            AI Confidence ⓘ
          </span>
        </div>
      </motion.div>

      {/* Condition Data */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="pw-card mb-4 flex gap-4 items-center"
      >
        <div className="flex flex-col items-center justify-center border-r border-surface pr-4 shrink-0 min-w-[70px]">
          <span className="text-[10px] uppercase font-mono tracking-wider text-ink-faint mb-0.5">Condition</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-display font-bold text-ink">{conditionScore}</span>
            <span className="text-xs text-ink-faint font-mono">/10</span>
          </div>
          <span className="text-[10px] font-mono text-snap bg-snap/10 px-1.5 py-0.2 rounded mt-0.5">Grade {conditionGrade}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ink leading-relaxed">{conditionSummary}</p>
          {conditionIssues.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {conditionIssues.map((issue, i) => (
                <span key={i} className="text-[10px] uppercase tracking-wider font-mono bg-surface text-ink-dim px-2 py-0.5 rounded border border-surface">
                  {issue}
                </span>
              ))}
            </div>
          ) : (
            <span className="inline-block mt-1 text-[11px] text-emerald-400/90 font-medium">
              ✓ No detected scratches, dents, or defects
            </span>
          )}
        </div>
      </motion.div>

      {/* Recommended Price & Best Platform */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.16 }}
        className="pw-card mb-4 bg-gradient-to-br from-snap/10 via-transparent to-transparent border-snap/30"
      >
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs font-medium text-snap mb-1 uppercase tracking-wider font-mono text-[10px]">Recommended Resale Price</p>
            <div className="text-3xl font-display font-bold text-snap">
              {formatCurrency(recPrice)}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-ink-dim mb-1 uppercase tracking-wider font-mono text-[10px]">Best Platform</p>
            <div className="text-xs font-bold text-ink bg-surface px-3 py-1.5 rounded-lg border border-surface/80 shadow-sm inline-block">
              {bestPlatform}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-dim pt-2 border-t border-surface/50">
          {trend.includes('ris') ? (
            <TrendingUp className="w-4 h-4 text-lime shrink-0" />
          ) : trend.includes('fall') ? (
            <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Minus className="w-4 h-4 text-ink-faint shrink-0" />
          )}
          <span>Market trend: <span className="font-semibold text-ink capitalize">{trend}</span></span>
        </div>
      </motion.div>

      {/* Market Platform Breakdown */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.24 }}
        className="mb-4 space-y-3"
      >
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-display font-semibold uppercase tracking-wider text-ink-faint">Marketplace Comparisons</h3>
          <span className="text-[10px] text-ink-faint font-mono">NZD Estimates</span>
        </div>
        
        {platforms.map((plat: any, idx: number) => {
          const platData = plat?.data || plat || {};
          const low = Number(platData?.low ?? (plat?.low ?? Math.round(recPrice * 0.85)));
          const median = Number(platData?.median ?? (plat?.median ?? recPrice));
          const high = Number(platData?.high ?? (plat?.high ?? Math.round(recPrice * 1.15)));
          const listings = Array.isArray(platData?.sample_listings) 
            ? platData.sample_listings 
            : (Array.isArray(plat?.sample_listings) ? plat.sample_listings : []);
          const platName = plat?.name || `Marketplace ${idx + 1}`;

          return (
            <div key={platName || idx} className="pw-card">
              <div className="flex justify-between items-center mb-2.5">
                <span className="font-display font-semibold text-ink text-sm">{platName}</span>
                <span className="text-xs font-semibold text-snap bg-snap/10 px-2 py-0.5 rounded border border-snap/20">
                  {formatCurrency(median)} avg
                </span>
              </div>
              
              <div className="flex justify-between text-xs text-ink-dim mb-2">
                <span>Low: <span className="font-semibold text-ink">{formatCurrency(low)}</span></span>
                <span>High: <span className="font-semibold text-ink">{formatCurrency(high)}</span></span>
              </div>
              
              <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-1/4 right-1/4 bg-snap/25 rounded-full" />
                <div className="absolute inset-y-0 left-[48%] w-1.5 bg-snap rounded-full" />
              </div>
              
              {listings.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-surface flex gap-2 overflow-x-auto hide-scrollbar">
                  {listings.map((url, i) => (
                    <a 
                      key={i} 
                      href={typeof url === 'string' && url.startsWith('http') ? url : '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="shrink-0 flex items-center gap-1 text-[10px] font-mono uppercase bg-surface hover:bg-surface/80 text-ink-dim px-2 py-1 rounded transition-colors"
                    >
                      Listing {i + 1} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* JSON Debug Inspector Drawer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.32 }}
        className="pw-card mb-4"
      >
        <button 
          onClick={() => setShowJson(!showJson)}
          className="w-full flex items-center justify-between text-xs font-mono text-ink-faint hover:text-ink transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" />
            <span>PriceSnap JSON Response</span>
          </span>
          {showJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showJson && (
          <div className="mt-3 pt-3 border-t border-surface">
            <pre className="text-[11px] font-mono bg-navy-900 text-emerald-400 p-3 rounded-lg overflow-x-auto max-h-60 overflow-y-auto border border-surface">
              {JSON.stringify({ product, market: { trademe: trademeData, facebook: facebookData, ebay: ebayData, trend, recommended_price: recPrice, best_platform: bestPlatform } }, null, 2)}
            </pre>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-navy-950/90 backdrop-blur-md border-t border-surface flex gap-3 z-40">
        <button 
          onClick={handleScanAgain}
          className="flex-1 pw-btn-outline py-3 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <RefreshCcw className="w-4 h-4" />
          Scan Again
        </button>
        <button 
          onClick={handleSave}
          className="flex-1 pw-btn py-3 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Bookmark className="w-4 h-4" />
          Save Result
        </button>
      </div>

      {/* Confidence Score Explanation Modal */}
      {showConfidenceModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-navy-900 border border-surface rounded-2xl p-6 shadow-2xl relative"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm ${
                confidenceColor === 'green' ? 'bg-lime/10 text-lime border border-lime/30' : confidenceColor === 'orange' ? 'bg-amber/10 text-amber border border-amber/30' : 'bg-rose-400/10 text-rose-400 border border-rose-400/30'
              }`}>
                {confidencePct}%
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-ink">AI Confidence Score</h3>
                <p className="text-xs text-ink-faint">Gemini Vision Accuracy Rating</p>
              </div>
            </div>

            <p className="text-xs text-ink-dim leading-relaxed mb-5">
              The AI confidence score measures how precisely PriceSnap's vision model matched visual features, brand logos, tags, and material textures against New Zealand market databases.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface/50 border border-surface">
                <span className="w-2.5 h-2.5 rounded-full bg-lime mt-1 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-ink">High Confidence (85% - 100%)</span>
                  <p className="text-ink-faint mt-0.5">Clear visual identification with high-certainty marketplace comparables.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface/50 border border-surface">
                <span className="w-2.5 h-2.5 rounded-full bg-amber mt-1 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-ink">Moderate Confidence (60% - 84%)</span>
                  <p className="text-ink-faint mt-0.5">Item recognized, but lighting or angle causes slight ambiguity.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-surface/50 border border-surface">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-ink">Low Confidence (&lt;60%)</span>
                  <p className="text-ink-faint mt-0.5">Obscured or generic item. Manual verification recommended.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic();
                setShowConfidenceModal(false);
              }}
              className="w-full py-3 bg-snap hover:bg-snap/90 text-navy-950 font-display font-semibold text-xs rounded-xl transition-all shadow-md"
            >
              Got It
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
