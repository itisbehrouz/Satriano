const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function createIconSvg(size, maskable = false) {
  const radius = maskable ? 0 : Math.round(size * 0.18);
  const strokeWidth = Math.max(2, Math.round(size * 0.015));
  const fontSizeLogo = Math.round(size * 0.42);
  const fontSizeText = Math.round(size * 0.075);
  const circleRadius = Math.round(size * 0.38);

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#0B1E3D"/>
  <circle cx="${size/2}" cy="${size/2}" r="${circleRadius}" fill="none" stroke="#DBB671" stroke-width="${strokeWidth}"/>
  <text x="50%" y="52%" font-family="Georgia, serif" font-size="${fontSizeLogo}px" font-weight="bold" fill="#DBB671" text-anchor="middle" dominant-baseline="middle">S</text>
  <text x="50%" y="78%" font-family="sans-serif" font-size="${fontSizeText}px" font-weight="600" fill="#E8ECF3" letter-spacing="${size * 0.01}" text-anchor="middle" dominant-baseline="middle">ATELIER</text>
</svg>
`;
}

async function generate() {
  const sizes = [
    { name: 'icon-192x192.png', size: 192, maskable: false },
    { name: 'icon-512x512.png', size: 512, maskable: false },
    { name: 'apple-touch-icon.png', size: 180, maskable: false },
    { name: 'icon-maskable.png', size: 512, maskable: true },
  ];

  for (const { name, size, maskable } of sizes) {
    const svg = createIconSvg(size, maskable);
    const outputPath = path.join(iconsDir, name);
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log('Generated:', name);
  }
}

generate().catch(console.error);
