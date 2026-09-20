// =========================================================
// Step 2: Build NZ Market-Targeted Search Queries
// =========================================================

import { IdentifiedProduct } from '../types';

export function buildQueries(product: IdentifiedProduct): string[] {
  const brand = product.brand && product.brand !== 'Generic / Unbranded' ? product.brand : '';
  const cleanName = product.name
    .replace(/[()[\]"]/g, '')
    .trim();

  const queries: string[] = [
    // Trade Me primary search
    `${brand} ${cleanName} Trade Me NZ price`.trim(),
    
    // Facebook Marketplace / local NZ second-hand
    `${cleanName} Facebook Marketplace New Zealand second hand`.trim(),
    
    // Broad NZ retail / secondary benchmark
    `${brand} ${cleanName} Google Shopping NZ used refurbished NZD`.trim(),
    
    // International / eBay comparator
    `${brand} ${cleanName} used price eBay`.trim()
  ];

  // Include any extra model-suggested queries
  if (Array.isArray(product.suggestedQueries)) {
    for (const q of product.suggestedQueries) {
      if (q && !queries.includes(q)) {
        queries.push(q);
      }
    }
  }

  return queries.slice(0, 5);
}
