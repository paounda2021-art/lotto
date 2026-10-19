const fs = require('fs');

const files = [
  'dist/assets/index-CN-5_2d9.js',
  'downloaded_target_worker/assets/index-CN-5_2d9.js'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  const badStr = '{style:{fontSize:"13px"}},children:"✍️"';
  const goodStr = '{style:{fontSize:"13px"},children:"✍️"}';
  
  console.log(`[${file}] Bad string exists:`, code.includes(badStr));
  if (code.includes(badStr)) {
    code = code.replace(badStr, goodStr);
    try {
      new Function(code);
      console.log(`[${file}] Syntax is now 100% VALID!`);
      fs.writeFileSync(file, code, 'utf8');
    } catch (e) {
      console.error(`[${file}] Error after fix:`, e.message);
    }
  }
});
