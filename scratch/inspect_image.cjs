const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:/Users/FMO-10/.gemini/antigravity/brain/bcf64274-ce77-4714-b635-e14b05cce356/.user_uploaded/media_1791771881768_28355fda.png');
let offset = 8;
let width = 346, height = 245, idatChunks = [];
while (offset < buf.length) {
  const len = buf.readUInt32BE(offset);
  const type = buf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IDAT') idatChunks.push(buf.slice(offset + 8, offset + 8 + len));
  offset += 12 + len;
}

const compressed = Buffer.concat(idatChunks);
const decompressed = zlib.inflateSync(compressed);

// RGBA, 4 bytes per pixel + 1 filter byte per row
const stride = width * 4 + 1;
const pixels = Buffer.alloc(width * height * 4);

function unfilter() {
  for (let y = 0; y < height; y++) {
    const filter = decompressed[y * stride];
    const rowStart = y * stride + 1;
    for (let x = 0; x < width * 4; x++) {
      const raw = decompressed[rowStart + x];
      let a = x >= 4 ? pixels[(y * width * 4) + (x - 4)] : 0;
      let b = y > 0 ? pixels[((y - 1) * width * 4) + x] : 0;
      let c = (x >= 4 && y > 0) ? pixels[((y - 1) * width * 4) + (x - 4)] : 0;
      
      let val = 0;
      if (filter === 0) val = raw;
      else if (filter === 1) val = (raw + a) & 0xff;
      else if (filter === 2) val = (raw + b) & 0xff;
      else if (filter === 3) val = (raw + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        val = (raw + pr) & 0xff;
      }
      pixels[y * width * 4 + x] = val;
    }
  }
}

unfilter();

// Let's render lines 3, 4, 5 in ascii:
// y from 90 to 200, x from 20 to 320
for (let y = 90; y < 200; y += 4) {
  let line = '';
  for (let x = 20; x < 320; x += 3) {
    const idx = (y * width + x) * 4;
    const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
    // background is light green: ~180-220, 240-255, 140-180
    // text is dark: ~0-50, 0-50, 0-50
    // colored numbers have distinct colors
    const isDark = (r + g + b) < 300;
    const isColored = Math.abs(r - g) > 40 || Math.abs(b - g) > 40;
    if (isDark) line += '#';
    else if (isColored) line += '*';
    else line += ' ';
  }
  console.log(y.toString().padStart(3), line);
}
