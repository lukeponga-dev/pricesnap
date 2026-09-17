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

function tokens(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(x => x.length > 1);
}

function relevant(query: string, title: string) {
  const wanted = tokens(query);
  const got = new Set(tokens(title));
  return wanted.length > 0 && wanted.filter(x => got.has(x)).length / wanted.length >= 0.55;
}

function excluded(title: string) {
  return /\b(case|cover|charger|cable|screen protector|parts only|for parts|manual|box only|replacement)\b/i.test(title);
}

export async function retrieveBraveComparables(query: string, source: SearchSource): Promise<ListingComparable[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return [];

  const config = SOURCE_CONFIG[source];
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', `site:${config.querySite} "${query}"`);
  url.searchParams.set('count', '20');
  url.searchParams.set('country', 'NZ');
  url.searchParams.set('search_lang', 'en');
  url.searchParams.set('safesearch', 'moderate');

  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'X-Subscription-Token': apiKey },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`Brave search for ${source} failed (${response.status})`);
  const body: any = await response.json();
  const results = Array.isArray(body?.web?.results) ? body.web.results : [];
  const now = new Date().toISOString();

  return results.flatMap((item: any) => {
    const title = typeof item?.title === 'string' ? item.title : '';
    const link = typeof item?.url === 'string' ? item.url : '';
    const description = typeof item?.description === 'string' ? item.description : '';
    const extra = Array.isArray(item?.extra_snippets) ? item.extra_snippets.join(' ') : '';
    if (!title || !link || excluded(title) || !relevant(query, title)) return [];
    try {
      const host = new URL(link).hostname.toLowerCase();
      if (!(host === config.domain || host.endsWith(`.${config.domain}`))) return [];
    } catch { return []; }
    const priceNzd = extractNzdPrice(`${title} ${description} ${extra}`);
    if (priceNzd === null) return [];
    return [{ source, title, url: link, priceNzd, condition: null, retrievedAt: now }];
  });
}
