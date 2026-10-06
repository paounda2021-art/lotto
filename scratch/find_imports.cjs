const fs = require('fs');

const html = fs.readFileSync('scratch/special.html', 'utf-8');
const regex = /import\("([^"]+)"\)/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log('Found import:', match[1]);
}
