const fs = require('fs');

const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Let's use Function constructor or vm to get the exact location
try {
  new Function(code);
} catch (e) {
  console.log('Error message:', e.message);
  console.log('Stack:', e.stack);
}
