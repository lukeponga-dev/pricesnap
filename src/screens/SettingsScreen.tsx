import { useAppState } from '../store';
import { Smartphone } from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';

export default function SettingsScreen() {
  return (
    <div className="w-full h-full flex flex-col pt-20 pb-24 px-4 overflow-y-auto bg-navy-950">
      
      {/* PWA App Installation Card */}
      <div className="pw-card flex flex-col mb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-snap/10 text-snap rounded-lg border border-snap/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-ink">Install App</h3>
            <p className="text-sm text-ink-dim">Add PriceSnap to your home screen for quick offline-ready scans.</p>
          </div>
        </div>
        <div className="self-end mt-1">
          <PWAInstallButton />
        </div>
      </div>

      <div className="pw-card">
        <h3 className="font-display font-semibold text-ink mb-2">About PriceSnap</h3>
        <p className="text-sm text-ink-dim mb-4 leading-relaxed">
          PriceSnap is an AI-powered price scanner built for op shop staff and individuals to value thrift finds, resale items, clothing, sneakers, collectibles, and secondhand goods. Point your camera at an item to get new and used price ranges, sold-comp signals, and confidence notes in seconds.
        </p>
        <div className="text-xs text-ink-faint font-mono">Version 1.0.0</div>
      </div>
    </div>
  );
}

