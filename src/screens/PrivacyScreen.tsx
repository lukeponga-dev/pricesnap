import { useAppState } from '../store';
import { ArrowLeft, Shield, Lock } from 'lucide-react';

export default function PrivacyScreen() {
  const { setScreen } = useAppState();

  return (
    <div className="w-full h-full flex flex-col pt-20 pb-28 px-4 overflow-y-auto bg-navy-950">
      {/* Top Bar with Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setScreen('settings')}
          className="p-2 bg-navy-900 text-ink-dim hover:text-ink hover:bg-navy-800 rounded-xl border border-surface transition-colors"
          aria-label="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-bold text-lg text-ink">Privacy Policy</h1>
          <p className="text-xs text-ink-faint">Last Updated: September 15, 2026</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="pw-card space-y-6 text-sm text-ink-dim leading-relaxed">
        <div className="flex items-center gap-3 p-3 bg-snap/10 border border-snap/20 rounded-xl">
          <div className="p-2 bg-snap/20 text-snap rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-ink text-sm">Your Data Privacy Matters</h2>
            <p className="text-xs text-ink-dim">PriceSnap is engineered with robust security and privacy protections for all thrift appraisals.</p>
          </div>
        </div>

        <div>
          <h3 className="font-display font-semibold text-ink text-base mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-snap" />
            1. Introduction & Scope
          </h3>
          <p>
            Welcome to PriceSnap ("we", "our", or "us"). We are committed to protecting your privacy and ensuring your personal information is handled securely. This Privacy Policy outlines how we collect, use, and protect information when you use our mobile web application and AI valuation services.
          </p>
        </div>

        <div>
          <h3 className="font-display font-semibold text-ink text-base mb-2">2. Information We Collect</h3>
          <p className="space-y-2">
            • <strong className="text-ink">Camera Images:</strong> Photos you capture or upload for item appraisal are transmitted securely to our AI vision analysis pipeline to identify items, estimate condition scores, and query marketplace comparables.<br /><br />
            • <strong className="text-ink">Appraisal History:</strong> Scan results, estimated values, and timestamps are saved locally on your device session so you can review previous valuations.
          </p>
        </div>

        <div>
          <h3 className="font-display font-semibold text-ink text-base mb-2">3. How We Use Information</h3>
          <p>
            We use uploaded images solely to provide real-time price appraisals and item identification. We do not sell, rent, or trade your personal photos or scan history to third parties, nor are your personal appraisal images used to train public machine learning models.
          </p>
        </div>

        <div>
          <h3 className="font-display font-semibold text-ink text-base mb-2">4. Camera & Device Permissions</h3>
          <p>
            PriceSnap requests access to your device camera exclusively to allow you to photograph thrift finds, collectibles, and items for instant valuation. You can grant or revoke camera permissions at any time through your browser or device operating system settings.
          </p>
        </div>

        <div>
          <h3 className="font-display font-semibold text-ink text-base mb-2">5. Data Security</h3>
          <p>
            We implement robust technical and organizational security measures, including HTTPS encryption in transit, secure API proxying, and strict token handling to protect all communications between your device and our valuation servers.
          </p>
        </div>

        <div>
          <h3 className="font-display font-semibold text-ink text-base mb-2">6. Contact Us</h3>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact our support team through the app settings or via our developer contact channels.
          </p>
        </div>
      </div>
    </div>
  );
}
