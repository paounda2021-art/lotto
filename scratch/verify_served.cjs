const http = require('http');
http.get('http://localhost:5173/assets/index-CN-5_2d9.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Served length:', data.length);
    console.log('Includes STOCK_VIP in 6-round check:', data.includes('o==="STOCK_VIP")?vipSess'));
  });
});
