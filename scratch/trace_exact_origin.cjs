const fs = require('fs');

// Let's check how the worker serves initial data or if initial data is embedded in HTML
const workerFile = fs.readdirSync('downloaded_target_worker').find(f => f.endsWith('.js'));
console.log('Worker file:', workerFile);

if (fs.existsSync('downloaded_target_worker/index.html')) {
  const html = fs.readFileSync('downloaded_target_worker/index.html', 'utf8');
  console.log('HTML size:', html.length);
  const match = html.match(/window\.__INITIAL_DATA__\s*=\s*({.*?});/s);
  if (match) {
    console.log('Found __INITIAL_DATA__ in HTML');
  }
}
