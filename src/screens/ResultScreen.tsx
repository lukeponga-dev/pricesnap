import { useState } from 'react';
import { motion } from 'motion/react';
import { useAppState } from '../store';
import { Bookmark, RefreshCcw, TrendingUp, TrendingDown, Minus, Sparkles, ExternalLink, Box, Code } from 'lucide-react';
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
  const confidencePct=Math.round(Number(marketConfidence?.score ?? product?.confidence ?? anyScan.confidence ?? 0)*100);
  const low=Number(rawMarket.price_low ?? rawMarket.trademe?.low ?? rawMarket.facebook?.low ?? rawMarket.ebay?.low ?? 0)||null;
  const high=Number(rawMarket.price_high ?? rawMarket.trademe?.high ?? rawMarket.facebook?.high ?? rawMarket.ebay?.high ?? 0)||null;
  const platforms=[['Trade Me',rawMarket.trademe],['Facebook Marketplace',rawMarket.facebook],['eBay',rawMarket.ebay]].filter(([,d])=>d);
  const handleSave=()=>{triggerHaptic();addToHistory(currentScan);};
  return <div className="w-full h-full flex flex-col bg-navy-950 overflow-y-auto pt-20 pb-28 px-4">
    {anyScan.isMock&&<div className="mb-4 bg-amber/10 border border-amber/20 rounded-xl px-4 py-2 text-xs text-amber text-center"><Sparkles className="w-4 h-4 inline mr-2"/>Demo Mode</div>}
    <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="pw-card mb-4 flex items-center gap-4">
      <div className="w-14 h-14 bg-navy-900 border border-surface rounded-xl flex items-center justify-center text-snap"><Box className="w-7 h-7"/></div>
      <div className="flex-1"><h2 className="font-display font-semibold text-ink">{product?.name||anyScan.item_name||'Identified Item'}</h2><p className="text-xs text-ink-faint">{product?.brand||anyScan.brand||'Unknown brand'} • {product?.category||anyScan.item_category||'General'}</p></div>
      <div className="text-right"><div className="text-sm font-bold text-ink">{confidencePct}%</div><div className="text-[10px] text-ink-faint uppercase">Confidence</div></div>
    </motion.div>
    <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="pw-card mb-4 bg-gradient-to-br from-snap/10 via-transparent to-transparent border-snap/30">
      <p className="text-[10px] font-mono uppercase tracking-wider text-snap mb-1">Estimated resale value</p>
      {recPrice!==null?<><div className="text-4xl font-display font-bold text-snap">{formatCurrency(recPrice)}</div>{low!==null&&high!==null&&<p className="text-xs text-ink-dim mt-2">Market range: {formatCurrency(low)} – {formatCurrency(high)}</p>}<p className="text-xs text-ink-dim mt-1">{marketConfidence?.label?`${marketConfidence.label} confidence · `:''}{marketConfidence?.evidence_count??rawMarket.sample_listings?.length??0} comparable listings</p></>:<><div className="text-2xl font-display font-bold text-ink">Price unavailable</div><p className="text-xs text-ink-dim mt-2">Not enough exact, verified NZD marketplace evidence. PriceSnap will not invent a fallback price.</p></>}
    </motion.div>
    {platforms.length>0&&<div className="mb-4 space-y-3"><h3 className="text-[11px] uppercase tracking-wider text-ink-faint">Marketplace comparisons</h3>{platforms.map(([name,data]:any)=><div key={name} className="pw-card"><div className="flex justify-between"><span className="font-semibold text-ink text-sm">{name}</span><span className="text-xs text-snap">{data?.median!=null?formatCurrency(data.median):'No price'}</span></div>{data?.low!=null&&data?.high!=null&&<div className="text-xs text-ink-dim mt-2">{formatCurrency(data.low)} – {formatCurrency(data.high)} · {data.evidence_count} matches</div>}{Array.isArray(data?.sample_listings)&&data.sample_listings.slice(0,4).map((l:any,i:number)=><a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-between text-[11px] text-ink-dim bg-surface px-2.5 py-1.5 rounded"><span className="truncate mr-2">{l.title} · {formatCurrency(l.priceNzd)}</span><ExternalLink className="w-3 h-3"/></a>)}</div>)}</div>}
    <div className="pw-card mb-4"><button onClick={()=>setShowJson(!showJson)} className="w-full flex items-center justify-between text-xs font-mono text-ink-faint"><span><Code className="w-3.5 h-3.5 inline mr-2"/>PriceSnap JSON Response</span><span>{showJson?'−':'+'}</span></button>{showJson&&<pre className="mt-3 text-[10px] overflow-auto text-ink-dim">{JSON.stringify(currentScan,null,2)}</pre>}</div>
    <div className="flex gap-3"><button onClick={handleSave} className="pw-button flex-1"><Bookmark className="w-4 h-4"/> Save</button><button onClick={()=>{triggerHaptic();setScreen('scanner');}} className="pw-button flex-1"><RefreshCcw className="w-4 h-4"/> Scan Again</button></div>
  </div>;
}
