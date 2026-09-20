import { Loader2, AlertCircle } from 'lucide-react';
import { useAppState } from '../store';

const labels = { uploading: 'Uploading your photo…', identifying: 'Identifying the item and visible condition…', searching: 'Searching for comparable NZ listings…', calculating: 'Checking evidence and calculating your estimate…' };
export default function AnalyzingScreen() {
  const { scanStage, scanError, cancelScan, retryScan } = useAppState();
  return <div className="w-full h-full flex flex-col items-center justify-center bg-navy-950 p-6 text-center">
    {scanError ? <>
      <AlertCircle className="w-12 h-12 text-amber mb-5" />
      <h2 className="text-xl font-display font-bold text-ink mb-3">We couldn’t complete this scan</h2>
      <p role="alert" className="text-sm text-ink-dim max-w-sm mb-6">{scanError}</p>
      <button className="pw-btn px-6 py-3 mb-3" onClick={retryScan}>Retry scan</button>
    </> : <>
      <Loader2 className="w-16 h-16 text-snap animate-spin mb-6" />
      <h2 className="text-xl font-display font-bold text-ink mb-3">Valuing your item</h2>
      <p role="status" aria-live="polite" className="text-sm text-ink-dim max-w-sm mb-4">{labels[scanStage]}</p>
      <p className="text-xs text-ink-faint mb-6">This may take up to 90 seconds.</p>
    </>}
    <button className="pw-btn-outline px-6 py-3" onClick={cancelScan}>{scanError ? 'Choose another photo' : 'Cancel scan'}</button>
  </div>;
}
