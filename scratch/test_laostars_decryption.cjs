const { webcrypto } = require('crypto');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const n_ = "eM0zHI5kzg96Qad7yRjEm3WciYwys2qejHKM8JSuO6jpoeAXjfaCga7eGg8ATmx0";
const i_ = n_.replace("WciY", "TiSm").trim();

async function l_(e, t) {
  try {
    const a = new TextEncoder().encode(i_);
    const i = await webcrypto.subtle.digest("SHA-256", a);
    const r = await webcrypto.subtle.importKey("raw", i, { name: "AES-GCM" }, false, ["decrypt"]);
    const d = T => {
      let h = T.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
      for (; h.length % 4 !== 0;) h += "=";
      return h;
    };
    const l = T => {
      const h = Buffer.from(d(T), 'base64').toString('binary');
      const O = new Uint8Array(h.length);
      for (let g = 0; g < h.length; g++) O[g] = h.charCodeAt(g);
      return O;
    };
    const s = l(e.substring(268));
    const N = l(t);
    const y = await webcrypto.subtle.decrypt({ name: "AES-GCM", iv: N }, r, s);
    const u = new TextDecoder().decode(y);
    let p = JSON.parse(u);
    if (typeof p == "string") p = JSON.parse(p);
    return p;
  } catch (err) {
    return null;
  }
}

async function run() {
  const url = 'https://exphuay.com/backward/laostars/__data.json';
  const raw = await fetchUrl(url);
  const json = JSON.parse(raw);
  const items = [];
  
  for (const node of json.nodes || []) {
    if (node && node.data) {
      for (const item of node.data) {
        if (item && typeof item === 'object' && item.payload !== undefined && item.iv !== undefined) {
          const payloadStr = node.data[item.payload];
          const ivStr = node.data[item.iv];
          const dec = await l_(payloadStr, ivStr);
          if (Array.isArray(dec)) {
            dec.forEach(d => items.push(d));
          }
        }
      }
    }
  }

  console.log(`Successfully decoded ${items.length} Laos Star draws from exphuay /backward/laostars!`);
  console.log('\nTop 10 latest Laos Star draws:');
  items.slice(0, 10).forEach(x => {
    const num = String(x.lottosNumber).trim();
    const top3 = num.slice(-3);
    const bottom2 = String(x.lottosUnder).trim();
    console.log(`Date: ${x.lottosDate} | Full: ${num} | 3D Top: ${top3} | 2D Bottom: ${bottom2}`);
  });
}

run();
