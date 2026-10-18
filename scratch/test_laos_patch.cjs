const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const targetW2 = ';if(t==="LAOS")return o.setDate(o.getDate()+1),o;if(t==="NIKKEI"||t==="DOWJONES"){for(o.setDate(o.getDate()+1);o.getDay()===0||o.getDay()===6;)o.setDate(o.getDate()+1);return o}';
console.log('Target W2 index:', code.indexOf(targetW2));

const targetYy = 'Yy=(e,t)=>{const o=t==="NIKKEI"?"Mon":t==="MALAY"?"Wed":"Sat";';
console.log('Target Yy index:', code.indexOf(targetYy));
