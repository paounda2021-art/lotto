const fs = require('fs');
const bundle = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');

const w2Idx = bundle.indexOf('function w2(');
const w2End = bundle.indexOf('function gy(', w2Idx);
const w2Code = bundle.substring(w2Idx, w2End);

const yyIdx = bundle.indexOf('Yy=(e,t)=>{');
const yyEnd = bundle.indexOf(',d0=(e,t,o)=>{', yyIdx);
const yyCode = bundle.substring(yyIdx, yyEnd);

eval(w2Code);
let Yy;
eval(yyCode);

const reg = JSON.parse(fs.readFileSync('scratch/live_hanoi_regular.json', 'utf8'));
console.log('With live_hanoi_regular, a[0] date:', reg[0].date, reg[0].dayOfWeek);
console.log('Yy(reg, "HANOI") =', Yy(reg, 'HANOI'));

async function testKV() {
  const res = await fetch('https://lotto289.paounda2021.workers.dev/api/draws');
  const d = await res.json();
  const kvHanoi = d.datasets['lotto_data_hanoi'];
  console.log('With KV lotto_data_hanoi, a[0] date:', kvHanoi[0].date, kvHanoi[0].dayOfWeek);
  console.log('Yy(kvHanoi, "HANOI") =', Yy(kvHanoi, 'HANOI'));
}
testKV();
