import type { ListingComparable } from './schema';
import { calculateResellerValuation, robustMarketStats } from './valuation';

const USER_AGENT = 'Mozilla/5.0 (compatible; PriceSnap/1.0; +https://github.com/lukeponga-dev/pricesnap)';
const TIMEOUT_MS = 4500;

function decodeHtml(value: string) { return value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim(); }
function stripTags(value: string) { return decodeHtml(value.replace(/<[^>]*>/g, ' ')); }
function sensiblePrice(price: number) { return Number.isFinite(price) && price >= 1 && price <= 100000; }

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'en-NZ,en;q=0.9' } });
    if (!response.ok || !(response.headers.get('content-type') || '').includes('text/html')) return null;
    return await response.text();
  } catch { return null; } finally { clearTimeout(timeout); }
}

function parseEbay(html: string): ListingComparable[] {
  const results: ListingComparable[] = [];
  const cards = html.match(/<li[^>]*class="[^"]*s-item[^"]*"[\s\S]*?<\/li>/gi) || [];
  for (const card of cards.slice(0, 30)) {
    const title = card.match(/class="[^"]*s-item__title[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i);
    const price = card.match(/class="[^"]*s-item__price[^"]*"[^>]*>[\s\S]*?(?:NZ\s*\$|NZD\s*|\$)\s*([\d,]+(?:\.\d{1,2})?)/i);
    const url = card.match(/class="[^"]*s-item__link[^"]*"[^>]*href="([^"]+)"/i);
    if (!price || !url) continue; const p = Number(price[1].replace(/,/g,'')); if (!sensiblePrice(p)) continue;
    results.push({ source:'ebay_public_web', title:title?stripTags(title[1]):'eBay listing', url:decodeHtml(url[1]), priceNzd:p, condition:null, retrievedAt:new Date().toISOString() });
  }
  return results;
}

function parseTradeMe(html: string): ListingComparable[] {
  const results: ListingComparable[]=[]; const re=/href="(\/a\/marketplace\/[^"?#]+(?:\/listing\/\d+|[^"?#]*))"/gi; let m:RegExpExecArray|null; const seen=new Set<string>();
  while ((m=re.exec(html)) && results.length<20) {
    const path=decodeHtml(m[1]); if(seen.has(path))continue; seen.add(path); const chunk=html.slice(Math.max(0,m.index-900),Math.min(html.length,m.index+1800));
    const pm=chunk.match(/(?:NZ\s*\$|\$)\s*([\d,]+(?:\.\d{1,2})?)/i); if(!pm)continue; const p=Number(pm[1].replace(/,/g,'')); if(!sensiblePrice(p))continue;
    const tm=chunk.match(/(?:aria-label|title)="([^"]{3,160})"/i); results.push({source:'trademe_public_web',title:tm?decodeHtml(tm[1]):'Trade Me listing',url:`https://www.trademe.co.nz${path}`,priceNzd:p,condition:null,retrievedAt:new Date().toISOString()});
  } return results;
}

async function getPublicListings(query:string) {
  const [tm,eb]=await Promise.all([fetchHtml(`https://www.trademe.co.nz/a/marketplace/search?search_string=${encodeURIComponent(query)}`),fetchHtml(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=12&LH_ItemCondition=3000`)]);
  return { trademe:tm?parseTradeMe(tm):[], ebay:eb?parseEbay(eb):[] };
}

async function getGeminiGroundedListings(query:string, conditionScore:number|null, defects:string[], warnings:string[]):Promise<ListingComparable[]> {
  const apiKey=process.env.GOOGLE_AI_STUDIO_API_KEY||process.env.GEMINI_API_KEY; if(!apiKey)return [];
  try {
    const { GoogleGenAI }=await import('@google/genai'); const ai=new GoogleGenAI({apiKey});
    const prompt=`Find current second-hand/resale listings for "${query}" relevant to a New Zealand buyer.

IMPORTANT: explicitly search for similar Facebook Marketplace listings using queries equivalent to site:facebook.com/marketplace "${query}" New Zealand, and include Facebook Marketplace evidence whenever Google Search can see a public/indexed listing. Do not attempt to bypass login, privacy controls, robots restrictions, or other access controls.

Also search multiple other public sources, including Trade Me, eBay, Cash Converters NZ, retailer used/refurbished pages, auction/classified sites and other reputable resale sources.

Condition score: ${conditionScore ?? 'unknown'}/10. Defects: ${defects.join(', ')||'none known'}.
Return ONLY a JSON array with up to 16 evidence records: [{"title":"...","url":"https://...","priceNzd":123,"source":"domain"}]. Prefer New Zealand listings and NZD. Only include a price when supported by the search result/page. Convert clearly stated foreign prices to approximate NZD when necessary. Never invent URLs or prices. For Facebook evidence, the URL must point to facebook.com and the result must expose a usable asking price.`;
    const res:any=await ai.models.generateContent({model:'gemini-3.6-flash',contents:prompt,config:{tools:[{googleSearch:{}}]}});
    const raw=(res.text||'').replace(/```(?:json)?/gi,'').replace(/```/g,'').trim(); const a=raw.indexOf('['),b=raw.lastIndexOf(']'); if(a<0||b<a)return [];
    const data=JSON.parse(raw.slice(a,b+1)); if(!Array.isArray(data))return [];
    return data.slice(0,16).map((x:any)=>({source:`gemini_search:${String(x.source||'web').slice(0,80)}`,title:String(x.title||'Grounded listing').slice(0,200),url:String(x.url||''),priceNzd:Number(x.priceNzd),condition:null,retrievedAt:new Date().toISOString()})).filter((x:ListingComparable)=>/^https?:\/\//.test(x.url)&&sensiblePrice(x.priceNzd));
  } catch(e:any) { warnings.push(`Gemini Google Search grounding unavailable: ${e?.message||String(e)}`); return []; }
}

function hostOf(url:string){try{return new URL(url).hostname.replace(/^www\./,'');}catch{return 'unknown';}}
function isFacebook(url:string){const h=hostOf(url).toLowerCase();return h==='facebook.com'||h.endsWith('.facebook.com');}
function dedupe(listings:ListingComparable[]){const seen=new Set<string>();return listings.filter(x=>{const k=`${x.url}|${Math.round(x.priceNzd)}`;if(seen.has(k))return false;seen.add(k);return true;});}
function confidence(listings:ListingComparable[]){
  if(!listings.length)return {score:0,label:'none',evidence_count:0,source_count:0,price_spread:null};
  const prices=listings.map(x=>x.priceNzd).sort((a,b)=>a-b); const median=prices[Math.floor(prices.length/2)]; const low=prices[Math.floor((prices.length-1)*.25)], high=prices[Math.floor((prices.length-1)*.75)]; const spread=median>0?(high-low)/median:1;
  const sources=new Set(listings.map(x=>hostOf(x.url))).size; const quantity=Math.min(1,listings.length/8); const diversity=Math.min(1,sources/3); const consistency=Math.max(0,1-Math.min(1,spread)); const score=Math.round((quantity*.45+diversity*.25+consistency*.30)*100)/100;
  return {score,label:score>=.8?'high':score>=.55?'medium':'low',evidence_count:listings.length,source_count:sources,price_spread:Math.round(spread*100)/100};
}

export async function groundMarket(itemName:string,conditionScore:number|null=null,defects:string[]=[]){
  const started=Date.now(); const warnings:string[]=[]; const query=itemName.trim().slice(0,120);
  const [publicResult,grounded]=await Promise.all([getPublicListings(query),getGeminiGroundedListings(query,conditionScore,defects,warnings)]);
  if(!publicResult.trademe.length)warnings.push('Trade Me public search returned no directly parsed pricing evidence.'); if(!publicResult.ebay.length)warnings.push('eBay public search returned no directly parsed pricing evidence.');

  const facebookListings=grounded.filter(x=>isFacebook(x.url));
  if(!facebookListings.length)warnings.push('No publicly indexed Facebook Marketplace pricing evidence was visible to Google Search grounding.');

  const all=dedupe([...publicResult.trademe,...publicResult.ebay,...grounded]); const combined=robustMarketStats(all); const valuation=calculateResellerValuation([combined]); let recommendedPrice=valuation.recommendedPrice;
  if(recommendedPrice!==null&&conditionScore!==null){const conditionFactor=.75+(Math.max(1,Math.min(10,conditionScore))/10)*.25;const defectFactor=Math.max(.7,1-Math.min(defects.length,3)*.05);recommendedPrice=Math.round(recommendedPrice*conditionFactor*defectFactor*100)/100;}
  const conf=confidence(combined?.sample_listings||all); const sourceCounts=all.reduce<Record<string,number>>((acc,x)=>{const h=hostOf(x.url);acc[h]=(acc[h]||0)+1;return acc;},{});
  return {market:{trademe:robustMarketStats(publicResult.trademe),facebook:robustMarketStats(facebookListings),ebay:robustMarketStats(publicResult.ebay),trend:null,recommended_price:recommendedPrice,best_platform:Object.entries(sourceCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]||null,grounded:valuation.evidenceCount>0,confidence:conf,evidence_sources:sourceCounts,sample_listings:combined?.sample_listings||[]},durationMs:Date.now()-started,warnings};
}
