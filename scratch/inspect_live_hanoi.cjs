const fs = require('fs');

const special = JSON.parse(fs.readFileSync('scratch/live_hanoi_special.json', 'utf8'));
const regular = JSON.parse(fs.readFileSync('scratch/live_hanoi_regular.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('scratch/live_hanoi_vip.json', 'utf8'));

console.log('Top 3 Special:');
console.log(special.slice(0, 3));

console.log('Top 3 Regular:');
console.log(regular.slice(0, 3));

console.log('Top 3 VIP:');
console.log(vip.slice(0, 3));
