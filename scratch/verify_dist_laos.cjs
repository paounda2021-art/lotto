const fs = require('fs');

fetch('http://localhost:5173/assets/index-CN-5_2d9.js')
  .then(r => r.text())
  .then(t => {
    console.log('Local server status 200 OK');
    console.log('Local server has Laos w2 fix:', t.includes('t==="NIKKEI"||t==="DOWJONES"||t==="LAOS"'));
    console.log('Local server has Laos Yy fix:', t.includes('t==="NIKKEI"||t==="LAOS"||t==="DOWJONES"'));
  })
  .catch(e => console.error(e));
