import type { ListingComparable } from './schema';

type SearchSource = 'trademe' | 'facebook';

const SOURCE_CONFIG: Record<SearchSource, { domain: string; querySite: string }> = {
  trademe: { domain: 'trademe.co.nz', querySite: 'trademe.co.nz' },
  facebook: { domain: 'facebook.com', querySite: 'facebook.com/marketplace' },
};

function extractNzdPrice(text: string): number | null {
  const patterns = [
    /NZ\$\s*([0-9][0-9,.]*)/i,
    /NZD\s*\$?\s*([0-9][0-9,.]*)/i,
    /\$\s*([0-9][0-9,.]*)\s*NZD/i,
    /\$\s*([0-9][0-9,.]*)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = Number(match[1].replace(/,/g, ''));
    if (Number.isFinite(value) && value > 0) return Math.round(value * 100) / 100;
  }
  return null;
}

function normalizedTokens(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(x => x.length > 1);
}

function relevant(query: string, title: string): boolean {
  const wanted = normalizedTokens(query);
  const got = new Set(normalizedTokens(title));
  if (!wanted.length) return false;
  const matched = wanted.filter(token => got.has(token)).length;
  return matched / wanted.length >= 0.55;
}

function excludedAccessory(title: string): boolean {
  return /\b(case|cover|charger|cable|screen protector|parts only|for parts|manual|box only|replacement)\b/i.test(title);
}

export async function retrieveGoogleComparables(query: string, source: SearchSource): Promise<ListingComparable[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!apiKey || !cx) return [];

  const config = SOURCE_CONFIG[source];
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', `site:${config.querySite} "${query}"`);
  url.searchParams.set('gl', 'nz');
  url.searchParams.set('cr', 'countryNZ');
  url.searchParams.set('num', '10');
  url.searchParams.set('safe', 'active');

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Google search for ${source} failed (${response.status})`);
  const body: any = await response.json();
  const now = new Date().toISOString();

  return (Array.isArray(body.items) ? body.items : []).flatMap((item: any) => {
    const title = typeof item?.title === 'string' ? item.title : '';
    const link = typeof item?.link === 'string' ? item.link : '';
    const snippet = typeof item?.snippet === 'string' ? item.snippet : '';
    if (!title || !link || !relevant(query, title) || excludedAccessory(title)) return [];
    try {
      const host = new URL(link).hostname.toLowerCase();
      if (!(host === config.domain || host.endsWith(`.${config.domain}`))) return [];
    } catch { return []; }

    const structured = item?.pagemap?.offer?.[0]?.price ?? item?.pagemap?.product?.[0]?.price;
    const structuredValue = Number(String(structured ?? '').replace(/[^0-9.]/g, ''));
    const priceNzd = Number.isFinite(structuredValue) && structuredValue > 0
      ? structuredValue
      : extractNzdPrice(`${title} ${snippet}`);
    if (priceNzd === null) return [];

    return [{ source, title, url: link, priceNzd, condition: null, retrievedAt: now }];
  });
}
