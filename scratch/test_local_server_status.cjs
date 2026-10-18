(async () => {
  const tests = [
    { name: 'HTML Root', url: 'http://localhost:5173/' },
    { name: 'Main JS Bundle (index-CN-5_2d9.js)', url: 'http://localhost:5173/assets/index-CN-5_2d9.js' },
    { name: 'Main CSS (index-Cip8XUMO.css)', url: 'http://localhost:5173/assets/index-Cip8XUMO.css' },
    { name: 'Proxy API (exphuay result)', url: 'http://localhost:5173/api/proxy?url=' + encodeURIComponent('https://exphuay.com/result/__data.json') },
    { name: 'Draws KV API', url: 'http://localhost:5173/api/draws' },
    { name: 'Line Config API', url: 'http://localhost:5173/api/line/config' }
  ];

  for (const t of tests) {
    try {
      const res = await fetch(t.url);
      const text = await res.text();
      console.log(`[PASS] ${t.name}: Status ${res.status}, Length ${text.length}`);
    } catch(err) {
      console.error(`[FAIL] ${t.name}: ${err.message}`);
    }
  }
})();
