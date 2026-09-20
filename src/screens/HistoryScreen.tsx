import { useAppState } from '../store';
import { PackageOpen, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function HistoryScreen() {
  const { history, setScreen, openSavedScan, clearHistory } = useAppState();
  return <div className="w-full h-full flex flex-col bg-navy-950 overflow-y-auto pt-20 pb-24 px-4">
    <h2 className="text-xl font-display text-ink mb-2">Saved valuations</h2>
    <p className="text-xs text-ink-dim mb-4">Stored on this device. Original photos are not saved.</p>
    {!history.length ? <div className="flex-1 flex flex-col items-center justify-center text-center">
      <PackageOpen className="w-14 h-14 text-ink-faint mb-4" />
      <p className="text-ink mb-4">No scans saved yet</p>
      <button onClick={() => setScreen('scanner')} className="pw-btn px-6 py-3">Start Scanning</button>
    </div> : <>
      <button className="pw-btn-outline py-2 mb-4" onClick={clearHistory}>Clear saved results</button>
      <div className="space-y-3">{history.map(scan => <button key={scan.id} onClick={() => openSavedScan(scan)} className="pw-card w-full text-left flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink truncate">{scan.product.name}</h3>
          <p className="text-snap">{scan.status === 'success' ? formatCurrency(scan.valuation.estimatedValue) + ' NZD' : 'Not enough evidence'}</p>
          <p className="text-xs text-ink-dim">{new Date(scan.date).toLocaleDateString()} · {scan.confidence.percentage}% evidence confidence</p>
        </div><ChevronRight className="w-4 h-4 text-ink-faint" />
      </button>)}</div>
    </>}
  </div>;
}
