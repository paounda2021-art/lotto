const fs = require('fs');

async function checkLive() {
  const res = await fetch('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js');
  const code = await res.text();

  console.log('code length:', code.length);
  console.log('has oMatchesDay check:', code.includes('const oMatchesDay = O.some'));
  console.log('has bad N.date check:', code.includes('targetDate = N.date'));
}

checkLive();
