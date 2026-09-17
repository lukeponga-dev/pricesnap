import { ScanResult } from './types';

export function generateMockResult(): ScanResult {
  const items = [
    { name: "Sony WH-1000XM5 Wireless Headphones", brand: "Sony", category: "Audio", low: 380, high: 490, avg: 435, score: 9, defects: [] },
    { name: "Logitech MX Master 3S Wireless Mouse", brand: "Logitech", category: "Electronics", low: 130, high: 180, avg: 155, score: 8, defects: ["Light shine on thumb rest"] },
    { name: "Nintendo Switch OLED Console (White)", brand: "Nintendo", category: "Gaming", low: 350, high: 430, avg: 395, score: 9, defects: [] },
    { name: "Dyson V15 Detect Cordless Vacuum", brand: "Dyson", category: "Appliances", low: 850, high: 1100, avg: 975, score: 8, defects: ["Scuffs on dust bin canister"] },
    { name: "Apple AirPods Pro (2nd Generation)", brand: "Apple", category: "Audio", low: 280, high: 360, avg: 320, score: 9, defects: [] },
    { name: "Yeti Rambler 20oz Tumbler", brand: "Yeti", category: "Kitchenware", low: 40, high: 55, avg: 48, score: 8, defects: ["Light rub mark on bottom rim"] },
    { name: "Nike Air Jordan 1 Retro High OG", brand: "Nike", category: "Footwear", low: 220, high: 310, avg: 265, score: 8, defects: ["Light creasing on toe box"] },
    { name: "Apple iPhone 13 128GB", brand: "Apple", category: "Smartphone", low: 520, high: 640, avg: 580, score: 8, defects: ["Minor micro-scratches on bezel"] }
  ];

  const randomItem = items[Math.floor(Math.random() * items.length)];
  const avg = randomItem.avg;
  const requestId = crypto.randomUUID();

  return {
    status: 'identified',
    id: requestId,
    date: new Date().toISOString(),
    item: randomItem.name,
    item_category: randomItem.category,
    item_name: randomItem.name,
    brand: randomItem.brand,
    conditionScore: randomItem.score,
    condition_score: randomItem.score,
    defects: randomItem.defects,
    resale_price_nz: avg,
    confidence: 0.95,
    product: {
      name: randomItem.name,
      brand: randomItem.brand,
      category: randomItem.category,
      condition_score: randomItem.score,
      condition_grade: randomItem.score >= 9 ? "Mint" : randomItem.score >= 7 ? "Great" : "Good",
      defects: randomItem.defects,
      resale_price_nz: avg,
      confidence: 0.95,
      confidence_color: "green",
      summary: randomItem.defects.length > 0 
        ? `Condition score: ${randomItem.score}/10. Issues: ${randomItem.defects.join(", ")}` 
        : `Mint condition (${randomItem.score}/10). No defects identified.`
    },
    market: {
      trademe: null,
      facebook: null,
      ebay: {
        low: randomItem.low,
        median: avg,
        high: randomItem.high,
        sample_listings: [],
        evidence_count: 1
      },
      trend: "stable",
      recommended_price: avg,
      best_platform: "eBay",
      grounded: true
    },
    meta: {
      timestamp: new Date().toISOString(),
      analysis_id: requestId,
      request_id: requestId,
      model: "mock-model",
      duration_ms: 120,
      grounding_duration_ms: 50
    }
  };
}
