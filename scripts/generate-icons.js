import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SVG_SRC = 'public/logo.svg';
const OUT_DIR = 'public/icons';
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure the directory exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  try {
    console.log('🎨 Starting sharp rendering of logo.svg to PWA PNG formats...');
    
    // Read the SVG content
    const svgBuffer = fs.readFileSync(SVG_SRC);

    for (const size of SIZES) {
      const dest = path.join(OUT_DIR, `icon-${size}x${size}.png`);
      console.log(`   ├─ Rendering ${size}x${size} PNG...`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(dest);
    }

    // Generate apple-touch-icon.png at 152x152 inside public
    const appleTouchDest = 'public/apple-touch-icon.png';
    console.log('   ├─ Creating public/apple-touch-icon.png...');
    await sharp(svgBuffer)
      .resize(152, 152)
      .png()
      .toFile(appleTouchDest);

    console.log('✅ Success! All PWA PNG icons generated successfully using sharp.');
  } catch (error) {
    console.error('❌ Error rendering SVG using sharp:', error);
    process.exit(1);
  }
}

run();
