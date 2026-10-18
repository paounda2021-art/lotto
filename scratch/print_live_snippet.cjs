async function check() {
  const r = await fetch('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js');
  const t = await r.text();
  const idx = t.indexOf('setMmCapital');
  const idx2 = t.indexOf('setMmCapital', idx + 1);
  console.log('LIVE SNIPPET:');
  console.log(t.substring(idx2 - 80, idx2 + 250));
}
check();
