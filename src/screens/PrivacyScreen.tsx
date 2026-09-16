import { useState } from 'react';
import { useAppState } from '../store';
import { ArrowLeft, Shield, Lock, Trash2, Mail } from 'lucide-react';

export default function PrivacyScreen() {
  const { setScreen } = useAppState();
  const [activeTab, setActiveTab] = useState<'privacy' | 'deletion'>('privacy');

  return (
    <div className="w-full h-full flex flex-col pt-20 pb-28 px-4 overflow-y-auto bg-navy-950">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('settings')}
            className="p-2 bg-navy-900 text-ink-dim hover:text-ink hover:bg-navy-800 rounded-xl border border-surface transition-colors"
            aria-label="Back to Settings"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg text-ink">Privacy & Legal</h1>
            <p className="text-xs text-ink-faint">Owner: Luke Ponga (Trading as PriceSnap)</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-navy-900 rounded-xl border border-surface mb-4">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'privacy'
              ? 'bg-snap text-navy-950 shadow-md'
              : 'text-ink-dim hover:text-ink hover:bg-navy-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Privacy Policy</span>
        </button>
        <button
          onClick={() => setActiveTab('deletion')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'deletion'
              ? 'bg-snap text-navy-950 shadow-md'
              : 'text-ink-dim hover:text-ink hover:bg-navy-800'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Data Deletion Policy</span>
        </button>
      </div>

      {activeTab === 'privacy' ? (
        <div className="pw-card space-y-6 text-sm text-ink-dim leading-relaxed">
          <div className="flex items-center gap-3 p-3 bg-snap/10 border border-snap/20 rounded-xl">
            <div className="p-2 bg-snap/20 text-snap rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-ink text-sm">PriceSnap – Privacy Policy (Prototype Version)</h2>
              <p className="text-xs text-ink-faint">Last updated: 16 September 2026 • Owner: Luke Ponga</p>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-snap" />
              1. Introduction
            </h3>
            <p>
              PriceSnap is an experimental Android prototype that provides AI-generated resale value estimates from photos submitted by users. This policy explains what information is processed, how it is used, and the rights available to you. Features and data flows may change as the service evolves.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">2. Information We Process</h3>
            <p>
              PriceSnap processes photos you capture or select for appraisal. The Android app also stores appraisal results, timestamps, item details, and local thumbnail file paths in a private Room database on your device. PriceSnap does not currently provide user accounts or cloud-synchronised scan history.<br /><br />
              The app does not operate a separate analytics or advertising system. Google, Vercel, Android, or your device may generate ordinary operational, security, or crash information under their own terms and settings.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">3. How Photos Are Used</h3>
            <p>
              Your photo is encoded and sent over HTTPS to PriceSnap's Vercel API endpoint, which forwards it to Google's free-tier Gemini API for analysis. Under Google's applicable free-tier terms, submitted inputs may be reviewed by humans and used to improve Google products and machine-learning technologies. Do not submit sensitive, confidential, or identifying images.<br /><br />
              PriceSnap uses photos only to return the requested appraisal and to maintain an optional local thumbnail on your device. PriceSnap does not use submitted photos for its own model training, advertising, or profiling.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">4. Local Storage</h3>
            <p>
              Saved appraisal history and thumbnail images remain on your device until you delete scan history, clear PriceSnap's app data, or uninstall the app. PriceSnap disables Android cloud backup for its app data. Local Room data is private to the app but is not separately encrypted by PriceSnap beyond protections supplied by Android and your device.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">5. Overseas Processing</h3>
            <p>
              Google and Vercel may process information outside New Zealand, including in the United States and other countries where they or their service providers operate. Their handling of information is governed by their applicable terms and privacy policies.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">6. Retention and Deletion</h3>
            <p>
              PriceSnap does not intentionally create a permanent server-side image library. The Vercel endpoint processes the image to fulfil the appraisal request. Google may retain submitted content under its free-tier Gemini terms; PriceSnap cannot directly retrieve or delete copies controlled by Google.<br /><br />
              Use <strong className="text-ink">Settings → Delete scan history</strong> to remove saved Room records and their associated cached image files from the device. You can also clear all PriceSnap app data through Android settings or uninstall the app.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">7. Minimum Age</h3>
            <p>
              PriceSnap is not intended for anyone under 18 years of age. By using the prototype, you confirm that you are at least 18.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">8. Sharing</h3>
            <p>
              PriceSnap does not sell personal information or share it with advertisers. Information is disclosed only to service providers required to operate the prototype, including Vercel for the API endpoint and Google Gemini for image analysis, or where disclosure is required by law.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">9. Security</h3>
            <p>
              PriceSnap uses HTTPS for data in transit, avoids logging photo request bodies in the Android app, restricts history to local app storage, and disables Android cloud backup. No system is completely secure, so users should avoid submitting sensitive or confidential images.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">10. Your Rights</h3>
            <p>
              You may ask whether PriceSnap controls personal information about you and request access, correction, or deletion by contacting the email below. PriceSnap may be unable to identify anonymous provider logs or delete copies independently controlled by Google or Vercel.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">11. Changes</h3>
            <p>
              This policy may be updated as PriceSnap moves from prototype to production. Material changes will be communicated through the app, website, or repository where reasonably practicable.
            </p>
          </div>

          <div className="pt-4 border-t border-surface">
            <h3 className="font-display font-semibold text-ink text-base mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-snap" />
              12. Contact
            </h3>
            <p className="text-ink font-medium">Luke Ponga, trading as PriceSnap</p>
            <a href="mailto:lukeponga9@gmail.com" className="text-snap hover:underline">lukeponga9@gmail.com</a>
          </div>
        </div>
      ) : (
        <div className="pw-card space-y-6 text-sm text-ink-dim leading-relaxed">
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-ink text-sm">PriceSnap – Data Deletion Policy (Prototype Version)</h2>
              <p className="text-xs text-ink-faint">Last updated: 16 September 2026 • Owner: Luke Ponga</p>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">1. Introduction</h3>
            <p>
              This policy explains how information can be removed from the PriceSnap Android prototype. PriceSnap currently has no user accounts or cloud-synchronised history.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">2. Delete Scan History in PriceSnap</h3>
            <p>
              Open <strong className="text-ink">Settings</strong> and select <strong className="text-ink">Delete scan history</strong>. After you confirm, PriceSnap permanently deletes all appraisal records from its local Room database and deletes the associated cached thumbnail files from the device. This action cannot be undone.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">3. Delete All Local App Data</h3>
            <p>
              You can delete all remaining PriceSnap data through <strong className="text-ink">Android Settings → Apps → PriceSnap → Storage → Clear storage</strong>. Uninstalling PriceSnap also removes its private local app data. Android cloud backup is disabled for PriceSnap.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">4. Submitted Images</h3>
            <p>
              PriceSnap sends submitted photos through its Vercel API endpoint to Google's free-tier Gemini API. PriceSnap does not intentionally retain a permanent server-side copy after the request is processed. Google may retain, review, or use submitted content under its free-tier terms. PriceSnap cannot retrieve or delete information independently controlled by Google.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">5. Operational Records</h3>
            <p>
              PriceSnap does not operate a separate analytics platform in the Android prototype. Vercel, Google, Android, or your device may retain operational, security, or crash records under their own policies. PriceSnap may be unable to identify or delete anonymous or provider-controlled records.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">6. Deletion Requests</h3>
            <p>
              For questions or requests concerning information controlled by PriceSnap, email <a href="mailto:lukeponga9@gmail.com" className="text-snap hover:underline">lukeponga9@gmail.com</a>. Include the approximate date and time of use and a description of the issue. Do not resend the original image unless requested and you choose to do so.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">7. Legal and Security Retention</h3>
            <p>
              Limited information may be retained where reasonably necessary to investigate abuse or a security incident, comply with law, or establish or defend a legal claim. It will be removed when no longer required.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">8. Minimum Age</h3>
            <p>
              PriceSnap is not intended for anyone under 18. If PriceSnap learns that it controls information submitted by a person under 18, it will take reasonable steps to delete that information.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-2">9. Changes</h3>
            <p>
              This policy may change as PriceSnap introduces accounts, persistent cloud storage, paid AI services, or different infrastructure. The updated policy will show a revised date.
            </p>
          </div>

          <div className="pt-4 border-t border-surface">
            <h3 className="font-display font-semibold text-ink text-base mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-snap" />
              10. Contact
            </h3>
            <p className="text-ink font-medium">Luke Ponga, trading as PriceSnap</p>
            <a href="mailto:lukeponga9@gmail.com" className="text-snap hover:underline">lukeponga9@gmail.com</a>
          </div>
        </div>
      )}
    </div>
  );
}
