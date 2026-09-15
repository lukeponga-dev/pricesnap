import React from 'react';

export function Logo({ className, variant = 'primary' }: { className?: string; variant?: 'primary' | 'secondary' }) {
  // We render the high-fidelity vector illustration matching the uploaded brand logo image.
  // This maintains extreme brand consistency and a premium, professional appearance.
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className} fill="none">
      <defs>
        {/* Background Gradient (Midnight blue-grey/charcoal) */}
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E2432" />
          <stop offset="100%" stopColor="#0F131A" />
        </linearGradient>

        {/* Orange Tag Gradient (Vibrant amber/gold to deep rich orange) */}
        <linearGradient id="tagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFAA47" />
          <stop offset="100%" stopColor="#FF6600" />
        </linearGradient>

        {/* Tag Drop Shadow */}
        <filter id="tagShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        
        {/* Card Inner Glow & Shadow for premium look */}
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Squircle App Icon Background */}
      <rect x="10" y="10" width="180" height="180" rx="48" fill="url(#bgGradient)" filter="url(#cardShadow)" />
      
      {/* Camera Shutter Button (Left) */}
      <rect x="52" y="74" width="16" height="12" rx="3" fill="#FFFFFF" />

      {/* Camera Body & Viewfinder (Unified Silhouette) */}
      <path
        d="M 36,132 A 20 20 0 0 0 56,152 L 144,152 A 20 20 0 0 0 164,132 L 164,104 A 20 20 0 0 0 144,84 L 128,84 Q 122,62 116,62 L 84,62 Q 78,62 72,84 L 56,84 A 20 20 0 0 0 36,104 Z"
        fill="#FFFFFF"
      />

      {/* Camera Flash Window / Assist Light Cutout (Right of lens) */}
      <rect x="134" y="94" width="14" height="8" rx="2" fill="#131721" />

      {/* Lens Outer Cutout (Reveals Dark Inside) */}
      <circle cx="100" cy="118" r="30" fill="#131721" />

      {/* Inner Lens Concentric White Ring */}
      <circle cx="100" cy="118" r="22" stroke="#FFFFFF" strokeWidth="4.5" fill="none" />

      {/* Inner Lens Dark Core */}
      <circle cx="100" cy="118" r="17.5" fill="#1C212E" />

      {/* Lens Reflection Gloss Highlight (Crescent / Ellipse) */}
      <ellipse cx="94.5" cy="112.5" rx="4" ry="7.5" transform="rotate(-40 94.5 112.5)" fill="#FFFFFF" opacity="0.6" />
      
      {/* Lens Reflection Tiny Dot (Bottom Right) */}
      <circle cx="108" cy="126" r="1.5" fill="#FFFFFF" opacity="0.4" />

      {/* Orange Price Tag (Tilted & Overlapping on Top-Right Corner) */}
      <g transform="translate(138, 70) rotate(35)" filter="url(#tagShadow)">
        {/* Upright Price Tag with point at top (local cy around -25) */}
        <path
          d="M -18,15 L -18,-10 L -9,-26 Q -7,-29 -4,-29 L 4,-29 Q 7,-29 9,-26 L 18,-10 L 18,15 A 5 5 0 0 1 13,20 L -13,20 A 5 5 0 0 1 -18,15 Z"
          fill="url(#tagGradient)"
        />
        {/* Tag String Hole */}
        <circle cx="0" cy="-18" r="4" fill="#131721" />
      </g>
    </svg>
  );
}
