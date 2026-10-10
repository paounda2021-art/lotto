async function test() {
  const r1 = await fetch('http://localhost:5173/');
  const html = await r1.text();
  console.log('HTML status:', r1.status);

  const jsMatch = html.match(/src="\.\/assets\/([^"]+)"/);
  if (jsMatch) {
    const jsUrl = 'http://localhost:5173/assets/' + jsMatch[1];
    console.log('Fetching JS:', jsUrl);
    const jsRes = await fetch(jsUrl);
    const js = await jsRes.text();
    console.log('JS contains ดาวน์โหลด Excel (.xlsx):', js.includes('ดาวน์โหลด Excel (.xlsx)'));
    console.log('JS contains ดาวน์โหลด CSV (.csv):', js.includes('ดาวน์โหลด CSV (.csv)'));
    console.log('JS contains 📥 ดาวน์โหลด Excel / CSV:', js.includes('📥 ดาวน์โหลด Excel / CSV'));
  }

  const r2 = await fetch('http://localhost:5173/api/proxy?url=https%3A%2F%2Fexphuay.com%2F');
  console.log('Proxy API status:', r2.status);

  const r3 = await fetch('http://localhost:5173/api/draws?key=lotto_data_hanoi');
  console.log('KV Draws API status:', r3.status);
}
test();
