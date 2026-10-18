const { execSync } = require('child_process');
try {
  const res = execSync('git grep INITIAL_LAOS_STAR_DATA').toString();
  console.log('grep result:\n', res);
} catch (e) {
  console.log('Not found in any other file!');
}
