import { IdentifiedProduct, CleanEvidenceItem } from '../types';

const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(Boolean);
const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function scoreRelevance(product: IdentifiedProduct, evidence: CleanEvidenceItem[]): CleanEvidenceItem[] {
  const name = tokens(product.name).filter(t => !['the', 'and', 'for', 'with'].includes(t));
  // Model numbers and storage capacity are required when actually identified.
  const identifiers = name.filter(t => /\d/.test(t));
  return evidence.map(item => {
    const title = tokens(item.title);
    const titleCompact = compact(item.title);
    const matches = name.filter(t => title.includes(t)).length;
    const brandMatch = !product.brand || /generic|unknown|unbranded/i.test(product.brand) || titleCompact.includes(compact(product.brand));
    const modelMatch = identifiers.every(t => title.includes(t) || (t.length >= 4 && titleCompact.includes(t)));
    const accessory = /\b(case|cover|cable|charger|earpads|strap|screen protector|replacement|box only|for parts|broken|repair|bundle|lot of)\b/i;
    const extraVariant = ['pro', 'max', 'mini', 'ultra', 'plus', 'oled', 'lite'].some(t => title.includes(t) && !name.includes(t));
    const mismatch = extraVariant || accessory.test(item.title) && !accessory.test(product.name);
    const score = brandMatch && modelMatch && !mismatch ? matches / Math.max(1, name.length) : 0;
    return { ...item, relevanceScore: score, weight: item.weight * score };
  });
}
