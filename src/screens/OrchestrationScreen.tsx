import { useState } from 'react';
import { useAppState } from '../store';
import { ArrowLeft, Play, Pause, RefreshCw, Cpu, Layers, CheckCircle2, TrendingUp, Zap, Server, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../utils';

interface BatchItem {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'processing' | 'completed';
  confidence?: number;
  valueNz?: number;
}

export default function OrchestrationScreen() {
  const { setScreen, showToast } = useAppState();
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [items, setItems] = useState<BatchItem[]>([
    { id: '1', name: 'Vintage Levi 501 Denim Jeans', category: 'Clothing', status: 'completed', confidence: 95, valueNz: 85 },
    { id: '2', name: 'Sony Walkman WM-F205', category: 'Electronics', status: 'completed', confidence: 91, valueNz: 140 },
    { id: '3', name: 'NZ Pottery Lava Glaze Vase', category: 'Collectibles', status: 'processing' },
    { id: '4', name: 'Macpac Down Vest Navy L', category: 'Clothing', status: 'pending' },
    { id: '5', name: 'Dymo Vintage Label Maker', category: 'Collectibles', status: 'pending' }
  ]);

  const toggleOrchestration = () => {
    triggerHaptic();
    setIsRunning(!isRunning);
    if (!isRunning) {
      showToast('AI Batch Orchestration Pipeline Started');
      setActiveStep(1);
    } else {
      showToast('Pipeline Paused');
    }
  };

  const runBatchStep = () => {
    triggerHaptic();
    setActiveStep(prev => (prev < 4 ? prev + 1 : 1));
    showToast(`Executing pipeline phase ${activeStep + 1}/4...`);
  };

  const totalValuation = items.reduce((acc, item) => acc + (item.valueNz || 0), 0);

  return (
    <div className="w-full h-full flex flex-col pt-20 pb-28 px-4 overflow-y-auto bg-navy-950 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('home')}
            className="p-2 bg-navy-900 text-ink-dim hover:text-ink hover:bg-navy-800 rounded-xl border border-surface transition-colors"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg text-ink">AI Orchestration Hub</h1>
            <p className="text-xs text-ink-faint">Multi-Item Batch Valuation Pipeline</p>
          </div>
        </div>
        <button
          onClick={toggleOrchestration}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isRunning ? 'bg-amber/10 text-amber border border-amber/30' : 'bg-snap text-navy-950 shadow-md'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause Pipeline' : 'Start Pipeline'}</span>
        </button>
      </div>

      {/* Pipeline Status Banner */}
      <div className="pw-card bg-gradient-to-br from-navy-900 to-navy-950 border-surface">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-snap animate-pulse" />
            <span className="font-display font-semibold text-xs text-ink">Gemini 3.6 Flash Orchestrator</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-snap/10 text-snap border border-snap/20">
            {isRunning ? 'ACTIVE PIPELINE' : 'IDLE'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-surface/50 border border-surface">
            <span className="text-[10px] text-ink-faint uppercase font-mono">Queue</span>
            <p className="text-sm font-bold font-display text-ink">{items.length} Items</p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface/50 border border-surface">
            <span className="text-[10px] text-ink-faint uppercase font-mono">Est. Value</span>
            <p className="text-sm font-bold font-display text-lime">${totalValuation} NZD</p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface/50 border border-surface">
            <span className="text-[10px] text-ink-faint uppercase font-mono">Accuracy</span>
            <p className="text-sm font-bold font-display text-snap">94.8%</p>
          </div>
        </div>

        <button
          onClick={runBatchStep}
          className="w-full py-2 bg-navy-900 hover:bg-navy-800 border border-surface rounded-xl text-xs font-medium text-ink flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-snap animate-spin" />
          <span>Advance Pipeline Phase ({activeStep}/4)</span>
        </button>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-3 rounded-xl border transition-all ${activeStep >= 1 ? 'bg-snap/10 border-snap/30 text-ink' : 'bg-navy-900 border-surface text-ink-dim'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-snap" />
            <span className="text-xs font-semibold">1. Tensor Vision</span>
          </div>
          <p className="text-[11px] text-ink-faint">Feature extraction & brand detection</p>
        </div>

        <div className={`p-3 rounded-xl border transition-all ${activeStep >= 2 ? 'bg-snap/10 border-snap/30 text-ink' : 'bg-navy-900 border-surface text-ink-dim'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-snap" />
            <span className="text-xs font-semibold">2. Condition Grading</span>
          </div>
          <p className="text-[11px] text-ink-faint">Wear inspection & defect checks</p>
        </div>

        <div className={`p-3 rounded-xl border transition-all ${activeStep >= 3 ? 'bg-snap/10 border-snap/30 text-ink' : 'bg-navy-900 border-surface text-ink-dim'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-snap" />
            <span className="text-xs font-semibold">3. NZ Market Comps</span>
          </div>
          <p className="text-[11px] text-ink-faint">Trade Me & FB Marketplace sync</p>
        </div>

        <div className={`p-3 rounded-xl border transition-all ${activeStep >= 4 ? 'bg-snap/10 border-snap/30 text-ink' : 'bg-navy-900 border-surface text-ink-dim'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-snap" />
            <span className="text-xs font-semibold">4. Pricing Arbitration</span>
          </div>
          <p className="text-[11px] text-ink-faint">Final NZD valuation & velocity</p>
        </div>
      </div>

      {/* Batch Queue List */}
      <div className="pw-card space-y-3">
        <h3 className="font-display font-semibold text-ink text-sm flex items-center justify-between">
          <span>Batch Queue Items</span>
          <span className="text-xs font-mono text-ink-faint">{items.length} items</span>
        </h3>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.id} className="p-3 bg-navy-900 rounded-xl border border-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-ink-faint">{idx + 1}</span>
                <div>
                  <h4 className="text-xs font-medium text-ink">{item.name}</h4>
                  <span className="text-[10px] text-ink-faint">{item.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.valueNz && <span className="text-xs font-semibold font-mono text-lime">${item.valueNz} NZD</span>}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  item.status === 'completed' ? 'bg-lime/10 text-lime border border-lime/30' :
                  item.status === 'processing' ? 'bg-amber/10 text-amber border border-amber/30' :
                  'bg-surface text-ink-faint'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
