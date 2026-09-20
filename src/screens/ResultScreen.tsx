import { useState } from 'react';
import { useAppState } from '../store';
import { Bookmark, RefreshCcw, ExternalLink, Box, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function ResultScreen() {
  const { currentScan, setScreen, addToHistory } = useAppState();
  const [showReasons, setShowReasons] = useState(false);
  if (!currentScan) return null;
  const { product, valuation, confidence, evidence, market, grounding } = currentScan;
  const priced = currentScan.status === 'success';
  return <div className="w-full h-full flex flex-col bg-navy-950 overflow-y-auto pt-20 pb-28 px-4">
    <div className="pw-card mb-4 flex items-start gap-3">
      <Box className="w-8 h-8 text-snap shrink-0" />
      <div className="min-w-0"><h2 className="font-display font-semibold text-lg text-ink">{product.name}</h2>
        <p className="text-xs text-ink-dim">{product.brand} · {product.category}</p>
      </div>
    </div>
    <div className="pw-card mb-4">
      <h3 className="font-semibold text-ink mb-2">Visible condition: {product.condition_grade} · {product.condition_score}/10</h3>
      <p className="text-sm text-ink-dim">{product.summary}</p>
      {product.defects.length > 0 && <ul className="list-disc pl-5 mt-2 text-xs text-ink-dim">{product.defects.map((defect, i) => <li key={i}>{defect}</li>)}</ul>}
      <p className="text-xs text-ink-faint mt-3">Photo assessment only. Functionality and hidden specifications are unverified.</p>
    </div>
    {priced ? <div className="pw-card mb-4 border-snap/30 bg-snap/5">
      <p className="text-sm text-snap">Estimated resale value</p>
      <p className="font-display text-4xl font-bold text-snap my-2">{formatCurrency(valuation.estimatedValue)} <span className="text-base">NZD</span></p>
      <p className="text-sm text-ink-dim">Range: {formatCurrency(valuation.lowEstimate)}–{formatCurrency(valuation.highEstimate)} NZD</p>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        {[['Quick sale', valuation.quickSalePrice], ['Balanced', valuation.balancedPrice], ['Higher ask', valuation.maxProfitPrice]].map(([label, price]) => <div key={label} className="rounded-lg bg-surface p-2">
          <p className="text-[10px] text-ink-dim">{label}</p><p className="text-sm font-bold text-ink">{formatCurrency(Number(price))}</p>
        </div>)}
      </div><p className="text-xs text-ink-faint mt-3">Suggested asking strategies, not guaranteed sale prices.</p>
    </div> : <div className="pw-card mb-4 border-amber/30" role="status">
      <h3 className="text-lg font-semibold text-amber mb-2">Not enough pricing evidence</h3>
      <p className="text-sm text-ink-dim">The item was identified, but we couldn’t support an NZD resale estimate with usable comparable listings. Try a clearer model label or another photo.</p>
    </div>}
    <div className="pw-card mb-4">
      <button className="w-full text-left" aria-expanded={showReasons} onClick={() => setShowReasons(!showReasons)}>
        <span className="text-sm text-ink font-semibold">Evidence confidence: {confidence.percentage}% · {confidence.level.toLowerCase()}</span>
        <span className="block text-xs text-snap mt-1">{showReasons ? 'Hide explanation' : 'How was this scored?'}</span>
      </button>
      {showReasons && <ul className="list-disc pl-5 mt-3 text-xs text-ink-dim space-y-2">{confidence.reasons.map((reason, i) => <li key={i}>{reason}</li>)}</ul>}
    </div>
    {priced && market.platforms.length > 0 && <div className="pw-card mb-4">
      <h3 className="text-sm font-semibold text-ink mb-3">Observed marketplace prices</h3>
      <div className="space-y-3">{market.platforms.map(platform => <div key={platform.name} className="flex justify-between gap-3 text-xs border-b border-surface pb-2">
        <span className="text-ink-dim">{platform.name}</span><span className="text-ink text-right">{formatCurrency(platform.median)} median<br />{formatCurrency(platform.low)}–{formatCurrency(platform.high)}</span>
      </div>)}</div>
    </div>}
    {evidence.sources.length > 0 && <div className="pw-card mb-4">
      <h3 className="flex items-center gap-2 text-sm text-ink font-semibold mb-3"><ShieldCheck className="w-4 h-4 text-snap" />Search-supported comparables ({evidence.filteredCount})</h3>
      <p className="text-xs text-ink-dim mb-3">Asking prices can differ from completed sales. Listings may change or expire.</p>
      <div className="space-y-3">{evidence.sources.map(item => <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-surface p-3">
        <span className="text-xs text-ink block">{item.title} <ExternalLink className="inline w-3 h-3" /></span>
        <span className="text-xs text-ink-dim">{item.platform} · {item.priceType === 'sold' ? 'Reported sold' : 'Asking'} · </span><span className="text-sm font-semibold text-snap">{formatCurrency(item.priceNZD)} NZD</span>
      </a>)}</div>
    </div>}
    {grounding?.searchEntryPoint && <div className="pw-card mb-4">
      <h3 className="text-sm text-ink mb-2">Google Search suggestions</h3>
      <iframe title="Google Search suggestions" srcDoc={grounding.searchEntryPoint} sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" className="w-full border-0 min-h-40 bg-white rounded-lg" />
    </div>}
    <p className="text-xs text-ink-faint mb-4">Checked {new Date(currentScan.date).toLocaleString()}. {currentScan.warnings?.[0]}</p>
    <div className="fixed bottom-0 inset-x-0 p-4 bg-navy-950/95 backdrop-blur-md border-t border-surface flex gap-3 z-40">
      <button onClick={() => setScreen('scanner')} className="flex-1 pw-btn-outline py-3 flex items-center justify-center gap-2 text-sm"><RefreshCcw className="w-4 h-4" />Scan Again</button>
      <button onClick={() => addToHistory(currentScan)} className="flex-1 pw-btn py-3 flex items-center justify-center gap-2 text-sm"><Bookmark className="w-4 h-4" />Save Result</button>
    </div>
  </div>;
}
