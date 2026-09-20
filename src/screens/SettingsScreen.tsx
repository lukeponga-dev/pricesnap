import { useAppState } from '../store';
import { Smartphone, Shield, FileText, ExternalLink, Home, Sun, Moon, Laptop, Palette, Check } from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { ThemeMode } from '../types';

export default function SettingsScreen() {
  const { setScreen, theme, resolvedTheme, setTheme } = useAppState();

  const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      desc: 'High contrast daylight palette'
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      desc: 'Deep midnight navy palette'
    },
    {
      id: 'system',
      label: 'System',
      icon: Laptop,
      desc: 'Syncs with device preference'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col pt-20 pb-28 px-4 overflow-y-auto bg-navy-950 space-y-4">
      
      {/* Theme & Appearance Controller Card */}
      <div className="pw-card flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-snap/10 text-snap rounded-lg border border-snap/25">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-ink text-sm">Theme & Appearance</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-navy-800 text-ink-dim border border-surface">
                  {resolvedTheme === 'dark' ? 'Dark Active' : 'Light Active'}
                </span>
              </div>
              <p className="text-xs text-ink-dim mt-0.5">Customise the visual palette for day or night scanning.</p>
            </div>
          </div>
        </div>

        {/* 3-Way Segmented Theme Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-navy-800 rounded-xl border border-surface mb-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`py-2 px-2 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-xs font-semibold cursor-pointer ${
                  isSelected
                    ? 'bg-navy-900 text-snap shadow-sm border border-snap/30'
                    : 'text-ink-dim hover:text-ink hover:bg-navy-900/50'
                }`}
                aria-pressed={isSelected}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-snap' : 'text-ink-faint'}`} />
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3 h-3 text-snap hidden sm:inline" />}
              </button>
            );
          })}
        </div>

        {/* Theme Palette Swatch Visualizer */}
        <div className="pt-3 border-t border-surface flex items-center justify-between">
          <span className="text-[11px] text-ink-faint">Palette Swatches:</span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-navy-950 border border-surface text-[10px] text-ink-dim" title="Canvas background">
              <span className="w-2.5 h-2.5 rounded-full bg-navy-950 border border-surface" />
              <span>Canvas</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-navy-900 border border-surface text-[10px] text-ink-dim" title="Card background">
              <span className="w-2.5 h-2.5 rounded-full bg-navy-900 border border-surface" />
              <span>Cards</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-snap/10 border border-snap/20 text-[10px] text-snap" title="Accent emerald">
              <span className="w-2.5 h-2.5 rounded-full bg-snap" />
              <span>Accent</span>
            </div>
          </div>
        </div>
      </div>

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
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-navy-900 hover:bg-navy-800 text-ink border border-surface flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
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
              <p className="text-xs text-ink-dim mt-0.5">Add to home screen. Scanning requires internet.</p>
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
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-navy-900 hover:bg-navy-800 text-ink border border-surface flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
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
        <div className="text-[11px] text-ink-faint font-mono">Valuation MVP • NZD comparables</div>
      </div>
    </div>
  );
}
