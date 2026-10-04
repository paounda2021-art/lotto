const fs = require('fs');

const html = fs.readFileSync('scratch/special.html', 'utf-8');
const matches = html.match(/_app\/immutable\/[^\s"']+/g) || [];
console.log('All _app/immutable matches:', matches);
