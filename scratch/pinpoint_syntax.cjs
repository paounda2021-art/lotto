const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

try {
  new vm.Script(code);
  console.log('Script parsed successfully!');
} catch (err) {
  console.error('Parse error:', err.message);
  console.error(err.stack);
}
