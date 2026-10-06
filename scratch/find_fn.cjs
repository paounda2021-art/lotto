const fs = require('fs');
const content = fs.readFileSync('C:/Users/FMO-3/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('getClientIdFromEnv')) {
    console.log(i, lines[i]);
  }
}
