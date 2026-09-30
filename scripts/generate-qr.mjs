import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import QRCode from 'qrcode';

const url = process.argv[2];
if (!url || !/^https:\/\//i.test(url)) {
  throw new Error('Pass the published HTTPS menu URL: npm run generate:qr -- https://example.com/menu/');
}
const destination = resolve('public/menu-qr.svg');
await mkdir(resolve('public'), { recursive: true });
await writeFile(destination, await QRCode.toString(url, { type: 'svg', margin: 2, width: 600, color: { dark: '#171714', light: '#ffffff' } }));
process.stdout.write(`Wrote ${destination}\n`);
