import { useState } from 'react';
import { motion } from 'motion/react';
import { useAppState } from '../store';
import { Bookmark, RefreshCcw, ExternalLink, Box, Code } from 'lucide-react';
import { formatCurrency, triggerHaptic } from '../utils';

export default function ResultScreen() {
  const { currentScan, setScreen, addToHistory } = useAppState();
  const [showJson, setShowJson] = useState(false);
  if (!currentScan) return null;
  const anyScan=currentScan as any, product=currentScan.product;
  const rawMarket=(currentScan.market as any)||{};
  const rawPrice=rawMarket.recommended_price ?? anyScan.resale_price_nz ?? product?.resale_price_nz ?? null;
  const hasPrice=Number.isFinite(Number(rawPrice))&&Number(rawPrice)>0;
  const recPrice=hasPrice?Number(rawPrice):null;
  const marketConfidence=rawMarket.confidence;
  const confidencePct=product?.confidence == null ? null : Math.round(product.confidence*100);
  const low=Number(rawMarket.price_low ?? rawMarket.trademe?.low ?? rawMarket.facebook?.low ?? rawMarket.ebay?.low ?? 0)||null;
  const high=Number(rawMarket.price_high ?? rawMarket.trademe?.high ?? rawMarket.facebook?.high ?? rawMarket.ebay?.high ?? 0)||null;
  const handleSave=()=>{triggerHaptic();addToHistory(currentScan);};
  return <div className="w-full h-full flex flex-col bg-navy-950 overflow-y-auto pt-20 pb-28 px-4">

    <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="pw-card mb-4 flex items-center gap-4">
      <div className="w-14 h-14 bg-navy-900 border border-surface rounded-xl flex items-center justify-center text-snap"><Box className="w-7 h-7"/></div>
      <div className="flex-1"><h2 className="font-display font-semibold text-ink">{product?.name||anyScan.item_name||'Item not identified'}</h2><p className="text-xs text-ink-faint">{product?.brand||anyScan.brand||'Unknown brand'} • {product?.category||anyScan.item_category||'General'}</p></div>
      <div className="text-right"><div className="text-sm font-bold text-ink">{confidencePct == null ? 'Unknown' : `${confidencePct}%`}</div><div className="text-[10px] text-ink-faint uppercase">Identification</div></div>
    </motion.div>
    <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="pw-card mb-4 bg-gradient-to-br from-snap/10 via-transparent to-transparent border-snap/30">
      <p className="text-[10px] font-mono uppercase tracking-wider text-snap mb-1">Estimated resale asking price</p>
      {recPrice!==null?<><div className="text-4xl font-display font-bold text-snap">{formatCurrency(recPrice)}</div>{low!==null&&high!==null&&<p className="text-xs text-ink-dim mt-2">Market range: {formatCurrency(low)} – {formatCurrency(high)}</p>}<p className="text-xs text-ink-dim mt-1">{marketConfidence?.label?`${Math.round(marketConfidence.score*100)}% price confidence (${marketConfidence.label}) · `:''}{marketConfidence?.evidence_count??rawMarket.sample_listings?.length??0} comparable listings</p></>:<><div className="text-2xl font-display font-bold text-ink">Price unavailable</div><p className="text-xs text-ink-dim mt-2">{currentScan.status === 'unidentified' ? 'Try a clearer photo showing the item and its model label.' : 'No comparable NZD prices with supporting evidence were found. Try a photo of the model label.'}</p></>}
    </motion.div>
    <div className="pw-card mb-4 text-xs text-ink-dim">
      <p>{product.summary}</p>
      {product.condition_grade && <p className="mt-2">Visible condition: {product.condition_grade} ({product.condition_score}/10). Working order is not confirmed by a photo.</p>}
      {product.defects.length > 0 && <p className="mt-2">Visible defects: {product.defects.join('; ')}</p>}
      {(currentScan.meta.warnings || rawMarket.warnings || []).map((warning: string) => <p key={warning} className="mt-2">{warning}</p>)}
    </div>
    {rawMarket.sample_listings?.length > 0 && <div className="pw-card mb-4">
      <h3 className="text-xs font-semibold text-ink mb-2">Price evidence</h3>
      <p className="text-xs text-ink-dim mb-3">Asking prices are not confirmed sale prices. Open a source to check availability and condition.</p>
      {rawMarket.sample_listings.map((listing: any) => <a key={listing.url} href={listing.url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-between gap-2 text-xs text-ink-dim bg-surface px-3 py-2 rounded">
        <span><span className="block text-ink">{listing.title}</span><span>{listing.source} · {formatCurrency(listing.priceNzd)}</span></span><ExternalLink className="w-4 h-4 shrink-0" />
      </a>)}
    </div>}
    {rawMarket.search_entry_point && <iframe title="Google Search suggestions" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" srcDoc={rawMarket.search_entry_point} className="w-full h-40 border-0 mb-4 bg-white rounded-xl" />}
    <div className="pw-card mb-4"><button onClick={()=>setShowJson(!showJson)} className="w-full flex items-center justify-between text-xs font-mono text-ink-faint"><span><Code className="w-3.5 h-3.5 inline mr-2"/>PriceSnap JSON Response</span><span>{showJson?'−':'+'}</span></button>{showJson&&<pre className="mt-3 text-[10px] overflow-auto text-ink-dim">{JSON.stringify(currentScan,null,2)}</pre>}</div>
    <div className="flex gap-3"><button onClick={handleSave} className="pw-button flex-1"><Bookmark className="w-4 h-4"/> Save</button><button onClick={()=>{triggerHaptic();setScreen('scanner');}} className="pw-button flex-1"><RefreshCcw className="w-4 h-4"/> Scan Again</button></div>
  </div>;
}
