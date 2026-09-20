import { Camera, Search, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAppState } from '../store';

export default function LandingScreen() {
  const { setScreen } = useAppState();
  return <main className="min-h-screen bg-navy-950 text-ink px-6 py-8">
    <nav className="max-w-5xl mx-auto flex justify-between items-center"><span className="font-display font-bold text-xl">Price<span className="text-snap">Snap</span></span>
      <button className="text-sm text-ink-dim" onClick={() => setScreen('privacy')}>Privacy</button>
    </nav>
    <section className="max-w-3xl mx-auto text-center py-20 sm:py-28">
      <span className="pw-tag text-snap border border-snap/30">NEW ZEALAND · VALUATION MVP</span>
      <h1 className="font-display font-bold text-4xl sm:text-6xl leading-tight mt-6 mb-6">A clearer picture of<br /><span className="pw-gradient-text">what it could sell for.</span></h1>
      <p className="text-ink-dim text-base sm:text-lg max-w-xl mx-auto mb-8">Photograph your item. PriceSnap identifies it and searches public listings to estimate its resale value in NZ dollars.</p>
      <button onClick={() => setScreen('scanner')} className="pw-btn inline-flex items-center gap-3 px-7 py-4 text-lg"><Camera className="w-5 h-5" />Scan an item<ArrowRight className="w-5 h-5" /></button>
      <button onClick={() => setScreen('home')} className="block mx-auto mt-5 text-sm text-ink-dim underline">Open dashboard</button>
      <p className="text-xs text-ink-faint mt-5">No price is shown when there isn’t enough usable evidence.</p>
    </section>
    <section className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4">
      {[{ icon: Camera, title: 'Start with a photo', text: 'Use one clear photo of the item. A visible model label helps avoid mismatches.' }, { icon: Search, title: 'See the comparisons', text: 'Review publicly indexed second-hand listings and their source links.' }, { icon: ShieldCheck, title: 'Understand the uncertainty', text: 'See a price range, evidence confidence and the limits of a photo-based assessment.' }].map(({icon: Icon,title,text}) => <div key={title} className="pw-card p-6"><Icon className="w-6 h-6 text-snap mb-4" /><h2 className="font-semibold mb-2">{title}</h2><p className="text-sm text-ink-dim">{text}</p></div>)}
    </section>
    <p className="text-center text-xs text-ink-faint max-w-lg mx-auto mt-10">Online analysis uses Google Gemini. Original photos are not saved to your scan history. Estimates are guidance, not guaranteed sale prices.</p>
  </main>;
}
