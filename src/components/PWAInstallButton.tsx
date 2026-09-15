import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as standalone or neither is installable, render nothing
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="pw-btn px-4 py-2 text-sm shadow-card"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="pw-btn-outline px-4 py-2 text-sm shadow-card"
        >
          <Share className="w-4 h-4 text-snap" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-card bg-navy-900 p-6 shadow-card-lg border border-surface text-ink relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-ink-faint hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber font-display font-bold text-base border border-amber/20">
                  PS
                </div>
                <div>
                  <h3 className="text-base font-display font-semibold text-ink">PriceSnap for iOS</h3>
                  <p className="text-xs text-ink-dim">Install directly on your home screen</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm text-ink-dim bg-navy-950 p-4 rounded-xl border border-surface">
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 bg-snap text-navy-950 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <p>
                    Tap the <strong>Share</strong> button in the Safari toolbar (at the bottom or top of the screen).
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 bg-snap text-navy-950 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <p>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full pw-btn py-2.5"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
