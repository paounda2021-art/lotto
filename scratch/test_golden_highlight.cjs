const fs = require('fs');

const special = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const normal = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));

special.forEach(d => d.session = d.session || 'HANOI_SPECIAL');
normal.forEach(d => d.session = d.session || 'HANOI_EVENING');
vip.forEach(d => d.session = d.session || 'HANOI_VIP');

const allHanoi = [...special, ...normal, ...vip];

// Thursday draws
const drawsThu = allHanoi.filter(d => d.date === '2026-10-08');

// Collect all winning numbers across the 3 draws:
// 2D numbers: all top2 and bottom2
const winning2D = new Set();
const winning3DDirect = new Set();
const winning3DTod = new Set();
const winningDigits = new Set();

drawsThu.forEach(dr => {
  if (dr.top3) {
    winning3DDirect.add(dr.top3);
    winning3DTod.add(dr.top3.split('').sort().join(''));
  }
  if (dr.top2) winning2D.add(dr.top2);
  else if (dr.top3 && dr.top3.length >= 2) winning2D.add(dr.top3.slice(-2));
  if (dr.bottom2) winning2D.add(dr.bottom2);

  // digits
  `${dr.top3||''}${dr.bottom2||''}`.split('').forEach(ch => winningDigits.add(parseInt(ch, 10)));
});

console.log('Winning 2D on Thursday:', Array.from(winning2D));
console.log('Winning 3D on Thursday:', Array.from(winning3DDirect));

// Thursday digits were 0, 3, 4, 9
const pairs2D = ['03', '04', '09', '30', '34', '39', '40', '43', '49', '90', '93', '94'];
const hits2D = pairs2D.filter(p => winning2D.has(p));
console.log('Hit 2D pairs:', hits2D);
