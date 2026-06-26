import { readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const dir = new URL('../public/placeholders/', import.meta.url).pathname;

const files = (await readdir(dir)).filter((f) => f.endsWith('.png'));
let before = 0;
let after = 0;

for (const file of files) {
  const src = join(dir, file);
  const { name } = parse(file);
  const out = join(dir, `${name}.webp`);

  before += (await stat(src)).size;

  await sharp(src)
    .resize({ width: 720, height: 720, fit: 'cover', position: 'centre' })
    .webp({ quality: 72, effort: 6 })
    .toFile(out);

  after += (await stat(out)).size;
  console.log(`${file} -> ${name}.webp`);
}

const mb = (b) => (b / 1024 / 1024).toFixed(2);
console.log(`\nTotal: ${mb(before)}MB -> ${mb(after)}MB (${Math.round((1 - after / before) * 100)}% smaller)`);
