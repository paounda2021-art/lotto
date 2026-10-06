const fs = require('fs');

const html = fs.readFileSync('scratch/special.html', 'utf-8');
const matches = html.match(/\/ _app\/immutable\/[\w.-]+\.js/gi) || html.match(/\/assets\/[\w.-]+\.js/gi) || html.match(/src="([^"]+)"/g) || [];

console.log('Script matches:', matches.filter(m => m.includes('_app') || m.includes('immutable')));
