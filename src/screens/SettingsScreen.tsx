import { useAppState } from '../store';
import { Smartphone, Shield, FileText, ExternalLink, Home } from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';

export default function SettingsScreen() {
  const { setScreen } = useAppState();

  return (
    <div className="w-full h-full flex flex-col pt-20 pb-28 px-4 overflow-y-auto bg-navy-950 space-y-4">
      
      {/* Welcome Landing Page Card */}
      <div className="pw-card flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-snap/10 text-snap rounded-lg border border-snap/25">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink text-sm">Welcome & Overview</h3>
              <p className="text-xs text-ink-dim mt-0.5">Return to the PriceSnap product landing page.</p>
            </div>
          </div>
          <button
            onClick={() => setScreen('landing')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-navy-900 hover:bg-navy-800 text-ink border border-surface flex items-center gap-1.5 transition-all shrink-0"
          >
            <Home className="w-3.5 h-3.5 text-snap" />
            <span>Landing</span>
            <ExternalLink className="w-3 h-3 text-ink-faint ml-0.5" />
          </button>
        </div>
      </div>
      
      {/* PWA App Installation Card */}
      <div className="pw-card flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-snap/10 text-snap rounded-lg border border-snap/25">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink text-sm">Install App</h3>
              <p className="text-xs text-ink-dim mt-0.5">Add to home screen for offline scans.</p>
            </div>
          </div>
          <div className="shrink-0">
            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* Privacy & Legal Card */}
      <div className="pw-card flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink text-sm">Privacy & Legal</h3>
              <p className="text-xs text-ink-dim mt-0.5">Review privacy & data deletion policies.</p>
            </div>
          </div>
          <button
            onClick={() => setScreen('privacy')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-navy-900 hover:bg-navy-800 text-ink border border-surface flex items-center gap-1.5 transition-all shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-snap" />
            <span>Privacy</span>
            <ExternalLink className="w-3 h-3 text-ink-faint ml-0.5" />
          </button>
        </div>
      </div>

      {/* About App Card */}
      <div className="pw-card">
        <h3 className="font-display font-semibold text-ink mb-1.5 text-sm">About PriceSnap</h3>
        <p className="text-xs text-ink-dim mb-3 leading-relaxed">
          PriceSnap is an AI-powered price scanner built for op shop staff and individuals to value thrift finds, resale items, clothing, sneakers, collectibles, and secondhand goods in seconds.
        </p>
        <div className="text-[11px] text-ink-faint font-mono">Version 1.0.0 • Secure AI Valuation</div>
      </div>
    </div>
  );
}
