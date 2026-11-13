// Wandelt PDFs aus public/frame/ seitenweise in JPGs um (<name>-1.jpg, <name>-2.jpg, …)
// und gibt die passenden Playlist-Einträge für content/frame.json aus.
// Aufruf: npm run frame:pdf                  (alle PDFs in public/frame/)
//         npm run frame:pdf -- datei.pdf     (nur diese Datei)
//         npm run frame:pdf -- datei.pdf 2   (nur Seite 2)
// Das Original-PDF bleibt liegen, kann aber nach dem Umwandeln gelöscht werden.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import sharp from 'sharp';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const DIR = path.join(process.cwd(), 'public', 'frame');
const LONG = 1920; // längste Kante in Pixel
const SHORT = 1080; // kürzeste Kante in Pixel
const pdfDir = path.join(process.cwd(), 'node_modules', 'pdfjs-dist');
const asDirUrl = (p) => pathToFileURL(p).href + '/';

const [fileArg, pageArg] = process.argv.slice(2);
const files = fileArg
  ? [fileArg]
  : (await readdir(DIR)).filter((n) => n.toLowerCase().endsWith('.pdf'));

if (!files.length) {
  console.log('Keine PDFs in public/frame/ gefunden.');
  process.exit(0);
}

for (const name of files) {
  const base = path.basename(name, path.extname(name));
  const data = new Uint8Array(await readFile(path.join(DIR, name)));
  const doc = await pdfjs.getDocument({
    data,
    standardFontDataUrl: asDirUrl(path.join(pdfDir, 'standard_fonts')),
    cMapUrl: asDirUrl(path.join(pdfDir, 'cmaps')),
    cMapPacked: true,
    useSystemFonts: false,
  }).promise;

  const pages = pageArg ? [Number(pageArg)] : Array.from({ length: doc.numPages }, (_, i) => i + 1);
  const entries = [];

  for (const n of pages) {
    if (!(n >= 1 && n <= doc.numPages)) {
      console.error(`${name}: Seite ${n} gibt es nicht (${doc.numPages} Seiten)`);
      process.exitCode = 1;
      continue;
    }
    const page = await doc.getPage(n);
    const base1 = page.getViewport({ scale: 1 });
    // So skalieren, dass die Seite in 1080×1920 (Hochkant) bzw. 1920×1080 (Quer) passt
    const [boxW, boxH] = base1.width <= base1.height ? [SHORT, LONG] : [LONG, SHORT];
    const scale = Math.min(boxW / base1.width, boxH / base1.height);
    const viewport = page.getViewport({ scale });

    // abrunden, sonst bleibt am Rand eine Pixelzeile ohne Seiteninhalt (weißer Streifen)
    const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const out = `${base}-${n}.jpg`;
    const jpg = await sharp(canvas.toBuffer('image/png')).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    await writeFile(path.join(DIR, out), jpg);
    console.log(`${out}: ${canvas.width}×${canvas.height}, ${(jpg.length / 1024).toFixed(0)} KB`);
    entries.push(`    { "type": "image", "src": "/frame/${out}" }`);
    page.cleanup();
  }

  if (entries.length) {
    console.log(`\nEinträge für content/frame.json (${name}):\n${entries.join(',\n')}\n`);
  }
  await doc.cleanup();
}
