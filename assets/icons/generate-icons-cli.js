#!/usr/bin/env node

/**
 * Gerador de ícones PWA para Alfred
 * Gera todos os tamanhos necessários a partir de um Canvas simples
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const SIZES = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const ICON_COLOR = '#2563eb';
const TEXT_COLOR = '#ffffff';
const OUTPUT_DIR = __dirname;

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw circle background
  ctx.fillStyle = ICON_COLOR;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw letter "A"
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `bold ${size * 0.55}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', size / 2, size / 2 + size * 0.02);

  return canvas;
}

function saveIcon(canvas, filename) {
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ Generated: ${filename}`);
}

function main() {
  console.log('Generating PWA icons for Alfred...\n');

  SIZES.forEach(size => {
    const canvas = drawIcon(size);
    saveIcon(canvas, `icon-${size}x${size}.png`);
  });

  console.log('\nAll icons generated successfully! 🎉');
}

main();
