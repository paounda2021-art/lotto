const http = require('http');

function check(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, length: data.length, snippet: data.substring(0, 300) }));
    }).on('error', reject);
  });
}

async function main() {
  try {
    const html = await check('http://localhost:5173/');
    console.log('HTML status:', html.status, 'len:', html.length);

    const exportJs = await check('http://localhost:5173/assets/export_modal.js');
    console.log('export_modal status:', exportJs.status, 'len:', exportJs.length);

    const indexJs = await check('http://localhost:5173/assets/index-CN-5_2d9.js');
    console.log('indexJs status:', indexJs.status, 'len:', indexJs.length);

    const lineCfg = await check('http://localhost:5173/api/line/config');
    console.log('line config status:', lineCfg.status, 'body:', lineCfg.snippet);
  } catch(e) {
    console.error('Error connecting to localhost:5173:', e.message);
  }
}

main();
