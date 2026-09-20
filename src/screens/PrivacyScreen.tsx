import { useAppState } from '../store';

export default function PrivacyScreen() {
  const { setScreen } = useAppState();
  return <main className="min-h-screen bg-navy-950 px-6 py-10 text-ink"><div className="max-w-2xl mx-auto">
    <button onClick={() => setScreen('home')} className="text-snap mb-8">← Back to PriceSnap</button>
    <h1 className="text-3xl font-display font-bold mb-2">Photo and saved-result privacy</h1>
    <p className="text-xs text-ink-faint mb-8">Web valuation MVP · Updated 20 September 2026</p>
    <div className="space-y-6 text-sm text-ink-dim leading-relaxed">
      <section><h2 className="text-lg font-semibold text-ink mb-2">What happens to a photo?</h2><p>Your browser prepares the photo and sends it to PriceSnap’s server for analysis by Google Gemini. The server handles the image in memory for that request. This implementation does not save original images in a database or include images in application logs. A failed scan keeps the photo in browser memory while you retry; leaving the scan screen releases that reference.</p></section>
      <section><h2 className="text-lg font-semibold text-ink mb-2">Search and AI processing</h2><p>The identified item description is used with Google Search grounding to find public comparables. Google’s processing and retention depend on the API service and billing configuration used by the operator. See <a className="text-snap underline" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">Google’s Gemini API terms</a>. Avoid uploading sensitive or identifying photos.</p></section>
      <section><h2 className="text-lg font-semibold text-ink mb-2">Saved results on this device</h2><p>Choosing Save Result stores the item description, estimate, source links, confidence and date in this browser’s local storage, up to 50 results. Original photos are not saved. There are no accounts or cloud-synchronised histories in this web MVP. People with access to this browser may be able to view saved results.</p></section>
      <section><h2 className="text-lg font-semibold text-ink mb-2">Delete saved results</h2><p>Open History and choose Clear saved results. You can also clear this site’s data in your browser settings. This removes the local saved history; it does not delete information held independently by Google or hosting providers.</p></section>
      <section><h2 className="text-lg font-semibold text-ink mb-2">Operational logs</h2><p>Application logs record scan identifiers, completion status, error codes, evidence counts and request duration. Hosting services may keep separate request logs. Browser preferences and cached app files remain until you clear site data.</p></section>
      <section><h2 className="text-lg font-semibold text-ink mb-2">Contact</h2><p>Luke Ponga, trading as PriceSnap · <a className="text-snap" href="mailto:lukeponga9@gmail.com">lukeponga9@gmail.com</a></p><p className="mt-2">These details describe this web MVP. Separate Android storage behaviour is outside this repository.</p></section>
    </div>
  </div></main>;
}
