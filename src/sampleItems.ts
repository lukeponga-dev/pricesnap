// Sample item presets for instant testing and when camera device is not available

export interface SampleItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  conditionScore: number;
  conditionGrade: string;
  estimatedNZD: number;
  badge: string;
  icon: string;
  description: string;
  imageSvg: string;
}

export const SAMPLE_PRESETS: SampleItem[] = [
  {
    id: 'jordan-1',
    name: 'Nike Air Jordan 1 Retro High OG "Chicago"',
    category: 'Sneakers & Footwear',
    brand: 'Nike',
    conditionScore: 8,
    conditionGrade: 'A-',
    estimatedNZD: 340,
    badge: 'High Resale',
    icon: '👟',
    description: 'Leather upper with subtle toe box creasing. Clean outsoles and original red laces.',
    imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23111827"/><circle cx="200" cy="200" r="140" fill="%23DC2626" opacity="0.2"/><path d="M100 240 Q150 160 260 170 Q310 180 320 220 L300 260 L90 260 Z" fill="%23DC2626"/><path d="M120 230 Q160 170 240 180 L280 230 Z" fill="%23FFFFFF"/><path d="M180 210 Q240 210 270 190" stroke="%23111827" stroke-width="8" stroke-linecap="round" fill="none"/><text x="200" y="320" fill="%23F8FAFC" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Nike Air Jordan 1 High</text><text x="200" y="345" fill="%2310B981" font-family="sans-serif" font-size="14" text-anchor="middle">Est. NZ$340 (Trade Me)</text></svg>`
  },
  {
    id: 'sony-xm4',
    name: 'Sony WH-1000XM4 Noise Canceling Headphones',
    category: 'Audio & Electronics',
    brand: 'Sony',
    conditionScore: 9,
    conditionGrade: 'A',
    estimatedNZD: 280,
    badge: 'Fast Velocity',
    icon: '🎧',
    description: 'Black matte finish, active noise cancellation verified. Pristine earcups.',
    imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230B0F19"/><circle cx="200" cy="200" r="130" fill="%232563EB" opacity="0.15"/><path d="M130 200 A70 70 0 0 1 270 200" stroke="%23334155" stroke-width="14" fill="none" stroke-linecap="round"/><rect x="110" y="180" width="36" height="60" rx="18" fill="%231E293B" stroke="%23E2E8F0" stroke-width="2"/><rect x="254" y="180" width="36" height="60" rx="18" fill="%231E293B" stroke="%23E2E8F0" stroke-width="2"/><text x="200" y="320" fill="%23F8FAFC" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Sony WH-1000XM4</text><text x="200" y="345" fill="%2310B981" font-family="sans-serif" font-size="14" text-anchor="middle">Est. NZ$280 (FB Marketplace)</text></svg>`
  },
  {
    id: 'rm-williams',
    name: 'R.M. Williams Comfort Craftsman Boots (Chestnut)',
    category: 'Clothing & Apparel',
    brand: 'R.M. Williams',
    conditionScore: 8,
    conditionGrade: 'A-',
    estimatedNZD: 360,
    badge: 'Heritage Vintage',
    icon: '👢',
    description: 'Yearling chestnut leather, original pull tabs intact, good comfort rubber sole.',
    imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%231E1B18"/><circle cx="200" cy="200" r="130" fill="%23854D0E" opacity="0.2"/><path d="M130 140 L130 230 Q140 250 210 250 L270 250 Q280 230 260 210 L230 200 L210 140 Z" fill="%2378350F" stroke="%23B45309" stroke-width="2"/><text x="200" y="320" fill="%23F8FAFC" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">R.M. Williams Craftsman</text><text x="200" y="345" fill="%2310B981" font-family="sans-serif" font-size="14" text-anchor="middle">Est. NZ$360 (Trade Me)</text></svg>`
  },
  {
    id: 'nintendo-switch',
    name: 'Nintendo Switch OLED Console (White)',
    category: 'Gaming & Collectibles',
    brand: 'Nintendo',
    conditionScore: 9,
    conditionGrade: 'Mint',
    estimatedNZD: 395,
    badge: 'Popular',
    icon: '🎮',
    description: '7-inch vibrant OLED screen, complete with white Joy-Cons and TV dock.',
    imageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230F172A"/><rect x="130" y="160" width="140" height="90" rx="6" fill="%231E293B" stroke="%2338BDF8" stroke-width="2"/><path d="M96 160 Q96 160 126 160 L126 250 L96 250 Q86 240 86 205 Q86 170 96 160 Z" fill="%23E2E8F0"/><path d="M304 160 Q304 160 274 160 L274 250 L304 250 Q314 240 314 205 Q314 170 304 160 Z" fill="%23E2E8F0"/><text x="200" y="320" fill="%23F8FAFC" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Nintendo Switch OLED</text><text x="200" y="345" fill="%2310B981" font-family="sans-serif" font-size="14" text-anchor="middle">Est. NZ$395 (Trade Me)</text></svg>`
  }
];
