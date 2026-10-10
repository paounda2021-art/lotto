const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js'),
  path.join(__dirname, '..', 'cloudflare_latest_download', 'assets', 'index-CN-5_2d9.js')
];

const malayJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scratch', 'malay_data.json'), 'utf8'));

for (const fp of filePaths) {
  if (!fs.existsSync(fp)) {
    console.log('File not found:', fp);
    continue;
  }
  let code = fs.readFileSync(fp, 'utf8');

  // 1. Patch zr map
  code = code.replace(
    'zr={LAOS:["laosdevelops"],LAOS_STAR:[],DOWJONES:',
    'zr={LAOS:["laosdevelops"],LAOS_STAR:["laostars"],MALAY:["magnum4d","magnum"],DOWJONES:'
  );

  // 2. Patch s_ map
  code = code.replace(
    'laosdevelops:{lotteryType:"LAOS",session:"LAOS_EVENING"},',
    'laosdevelops:{lotteryType:"LAOS",session:"LAOS_EVENING"},"laostars":{lotteryType:"LAOS_STAR",session:"LAOS_STAR_DAY"},"laos-star":{lotteryType:"LAOS_STAR",session:"LAOS_STAR_DAY"},"magnum4d":{lotteryType:"MALAY",session:"MALAY_EVENING"},"magnum":{lotteryType:"MALAY",session:"MALAY_EVENING"},"malay":{lotteryType:"MALAY",session:"MALAY_EVENING"},'
  );

  // 3. Prepend Oct 6 Laos Star draw to e0 if missing
  const oct6Str = '{"id":"laos_star_20261006","lotteryType":"LAOS_STAR","session":"LAOS_STAR_DAY","date":"2026-10-06","dateFormatted":"06 ต.ค. 2569","dayOfWeek":"Tue","dayNameThai":"อังคาร","full6D":"18176","top3":"176","top2":"76","bottom2":"18"}';
  if (!code.includes('laos_star_20261006')) {
    code = code.replace('e0=[{id:"laos_star_20260716"', `e0=[${oct6Str},{id:"laos_star_20260716"`);
  }

  fs.writeFileSync(fp, code, 'utf8');
  console.log('Successfully patched:', fp);
}
