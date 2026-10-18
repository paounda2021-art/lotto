async function test() {
  try {
    const res = await fetch('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js');
    const text = await res.text();
    const hasHoisted = text.includes('const isNextMode = (l === "NEXT") || (!O || O.length === 0 || !O[0]?.top2);');
    const hasOldTDZ = text.includes('const isNextMode = (l === "NEXT");\n    let laos100Digits;');
    console.log('Deployed bundle contains fixed isNextMode:', hasHoisted);
    console.log('Bundle length:', text.length);
  } catch (err) {
    console.error('Error fetching live bundle:', err);
  }
}
test();
