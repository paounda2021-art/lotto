async function check() {
  const r = await fetch('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js');
  const t = await r.text();
  console.log('Live has color black:', t.includes('color: "#000000"'));
}
check();
