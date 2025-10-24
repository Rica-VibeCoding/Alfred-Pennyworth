// Simple Node.js script to generate icon placeholders
// Run with: node generate-icons.js
// Requires: npm install canvas (or use the HTML version in browser)

const fs = require('fs');
const path = require('path');

const SIZES = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const ICON_COLOR = '#2563eb';
const TEXT_COLOR = '#ffffff';

console.log('This script requires node-canvas package.');
console.log('Alternative: Open generate-icons.html in your browser to generate icons.\n');

try {
  const { createCanvas } = require('canvas');

  SIZES.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Draw circle
    ctx.fillStyle = ICON_COLOR;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw "A"
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = `bold ${size * 0.55}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', size / 2, size / 2 + size * 0.02);

    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.png`), buffer);
    console.log(`✓ Generated icon-${size}x${size}.png`);
  });

  console.log('\n✅ All icons generated successfully!');
} catch (error) {
  console.log('❌ Canvas package not installed.');
  console.log('\nTo generate icons, choose one of these methods:\n');
  console.log('1. Open assets/icons/generate-icons.html in your browser');
  console.log('2. Install canvas: npm install canvas && node generate-icons.js');
  console.log('3. Use online tool: https://www.pwabuilder.com/imageGenerator\n');
}
