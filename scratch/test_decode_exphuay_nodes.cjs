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

const i_ = "AXjfaCga7eGg8ATmx0";

async function l_(payload, ivStr) {
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
    const s = l(payload.substring(268));
    const N = l(ivStr);
    const y = await webcrypto.subtle.decrypt({ name: "AES-GCM", iv: N }, r, s);
    const u = new TextDecoder().decode(y);
    let p = JSON.parse(u);
    if (typeof p == "string") p = JSON.parse(p);
    return p;
  } catch (err) {
    console.error('Decryption error:', err.message);
    return null;
  }
}

async function run() {
  const raw = await fetchUrl('https://exphuay.com/result/__data.json');
  const json = JSON.parse(raw);
  
  for (let i = 0; i < json.nodes.length; i++) {
    const n = json.nodes[i];
    if (n && n.data) {
      for (const item of n.data) {
        if (item && typeof item === 'object' && item.payload !== undefined && item.iv !== undefined) {
          const payloadStr = n.data[item.payload];
          const ivStr = n.data[item.iv];
          console.log(`Decoding Node ${i} payload length:`, payloadStr ? payloadStr.length : 'null');
          const dec = await l_(payloadStr, ivStr);
          console.log(`Node ${i} decoded result:`, Array.isArray(dec) ? `Array of ${dec.length} items` : dec);
          if (Array.isArray(dec) && dec.length > 0) {
            console.log(`Node ${i} sample items:`, dec.slice(0, 5));
            console.log('All lottosNames:', Array.from(new Set(dec.map(x => x.lottosName))));
          }
        }
      }
    }
  }
}

run();
