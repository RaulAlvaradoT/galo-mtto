// Requires: npm install sharp
// Usage: node tools/optimize_images.js [--quality 80]
// Generates resized WebP/JPEG variants and a small LQIP placeholder for each image
// Writes a manifest `galeria/manifest.json` with available variants and placeholder data URIs.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const args = process.argv.slice(2);
const qualityArgIndex = args.indexOf('--quality');
const quality = qualityArgIndex !== -1 ? parseInt(args[qualityArgIndex + 1], 10) : 80;

const SIZES = [400, 800, 1200];

const dir = path.join(__dirname, '..', 'galeria');
if (!fs.existsSync(dir)) {
  console.error('galeria directory not found:', dir);
  process.exit(1);
}

(async ()=>{
  const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f));
  const manifest = {};
  for (const file of files) {
    const srcPath = path.join(dir, file);
    const base = file.replace(/\.[^/.]+$/, '');
    manifest[file] = { variants: [], placeholder: null };
    try {
      // create placeholder (tiny, blurred)
      const placeholderBuf = await sharp(srcPath)
        .resize({ width: 20 })
        .blur(1)
        .toBuffer();
      const placeholderBase64 = placeholderBuf.toString('base64');
      const mime = /\.png$/i.test(file) ? 'image/png' : 'image/jpeg';
      manifest[file].placeholder = `data:${mime};base64,${placeholderBase64}`;

      for (const w of SIZES) {
        const outJpg = path.join(dir, `${base}-${w}.jpg`);
        const outWebp = path.join(dir, `${base}-${w}.webp`);
        await sharp(srcPath)
          .resize({ width: w, withoutEnlargement: true })
          .jpeg({ quality })
          .toFile(outJpg);
        await sharp(srcPath)
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality })
          .toFile(outWebp);
        manifest[file].variants.push({ width: w, jpeg: path.relative(path.join(__dirname, '..'), outJpg).replace(/\\/g, '/'), webp: path.relative(path.join(__dirname, '..'), outWebp).replace(/\\/g, '/') });
        console.log('Written', outJpg, outWebp);
      }
    } catch (err) {
      console.error('Error processing', srcPath, err.message);
    }
  }

  // write manifest
  const manifestPath = path.join(dir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Wrote manifest:', manifestPath);
})();
