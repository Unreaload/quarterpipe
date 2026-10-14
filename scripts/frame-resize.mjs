// Verkleinert Bilder in public/frame/ auf max. 1920×1080 (in place) und dreht sie nach EXIF.
// Aufruf: npm run frame:resize
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.join(process.cwd(), 'public', 'frame');
const MAX_W = 1920;
const MAX_H = 1080;
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

for (const name of await readdir(DIR)) {
  const ext = path.extname(name).toLowerCase();
  if (!EXT.has(ext)) continue;

  const file = path.join(DIR, name);
  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  // orientation >= 5 heißt: Breite/Höhe sind vertauscht gespeichert
  const [w, h] = (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
  if (w <= MAX_W && h <= MAX_H && (meta.orientation ?? 1) === 1) continue;

  let img = sharp(input)
    .rotate()
    .resize(MAX_W, MAX_H, { fit: 'inside', withoutEnlargement: true });
  if (ext === '.png') img = img.png();
  else if (ext === '.webp') img = img.webp({ quality: 82 });
  else img = img.jpeg({ quality: 82, mozjpeg: true });

  const output = await img.toBuffer();
  await writeFile(file, output);
  console.log(`${name}: ${w}×${h} → ${(input.length / 1024).toFixed(0)} KB → ${(output.length / 1024).toFixed(0)} KB`);
}
