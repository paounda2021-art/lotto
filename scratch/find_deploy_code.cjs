const fs = require('fs');

const files = fs.readdirSync('scratch');
files.forEach(f => {
  try {
    const txt = fs.readFileSync('scratch/' + f, 'utf8');
    if (txt.includes('workers.dev') || txt.includes('deploy') || txt.includes('upload')) {
      console.log('Found in scratch/' + f);
    }
  } catch(e){}
});
