import { ScanResult } from './types';

export function generateMockResult(): ScanResult {
  const items = [
    { name: "Sony WH-1000XM5", sku: "SNY-WH1000XM5-BLK", emoji: "🎧", low: 489, high: 599, avg: 549, insight: "15% below average at low end" },
    { name: "Logitech MX Master 3S", sku: "LOG-MX3S-GRY", emoji: "🖱️", low: 169, high: 229, avg: 199, insight: "Stable pricing this month" },
    { name: "Nintendo Switch OLED", sku: "NIN-SWOLED-WHT", emoji: "🎮", low: 529, high: 599, avg: 569, insight: "High demand, prices firm" },
    { name: "Dyson V15 Detect", sku: "DYS-V15-ABS", emoji: "🧹", low: 1199, high: 1499, avg: 1349, insight: "On sale at major retailers" },
    { name: "Apple AirPods Pro 2", sku: "APP-APP2-WHT", emoji: "🎧", low: 399, high: 479, avg: 439, insight: "Slightly below average" },
    { name: "Yeti Rambler 20oz", sku: "YET-R20-NAV", emoji: "☕", low: 55, high: 65, avg: 60, insight: "Rarely discounted" },
    { name: "Nike Air Force 1", sku: "NIK-AF1-WHT", emoji: "👟", low: 160, high: 200, avg: 180, insight: "Classic item, low variance" },
    { name: "Stanley Quencher H2.0", sku: "STA-Q40-ROS", emoji: "🥤", low: 79, high: 99, avg: 89, insight: "High stock availability" }
  ];

  const randomItem = items[Math.floor(Math.random() * items.length)];

  return {
    id: Math.random().toString(36).substring(2, 9),
    name: randomItem.name,
    sku: randomItem.sku,
    emoji: randomItem.emoji,
    confidence: Math.floor(Math.random() * 8) + 92, // 92-99
    price: {
      low: randomItem.low,
      high: randomItem.high,
      average: randomItem.avg,
      currency: "NZD"
    },
    insight: randomItem.insight,
    reasoning: "Market average calculated from recent verified New Zealand resale listings.",
    marketComparisons: [
      { platform: "eBay New Zealand", price: Math.round(randomItem.avg * 1.05), condition: "Refurbished", url: "https://ebay.com.au" },
      { platform: "Trade Me NZ", price: Math.round(randomItem.avg * 0.94), condition: "Used - Very Good", url: "https://trademe.co.nz" },
      { platform: "Facebook Marketplace", price: Math.round(randomItem.low), condition: "Used - Good", url: "https://facebook.com/marketplace" }
    ],
    date: new Date().toISOString()
  };
}
