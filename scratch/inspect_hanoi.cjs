const fs = require('fs');

const html = fs.readFileSync('scratch/special.html', 'utf-8');
console.log('HTML Length:', html.length);

// Look for script tags or data attributes or text patterns like dates
const scripts = html.match(/<script[\s\S]*?<\/script>/gi) || [];
console.log('Script count:', scripts.length);

// Search for any script containing JSON data or data arrays
scripts.forEach((s, idx) => {
  if (s.includes('2026') || s.includes('2569') || s.includes('result') || s.includes('data')) {
    console.log(`Script ${idx} sample:`, s.slice(0, 300));
  }
});

// Search for text snippets with dates
const textMatches = html.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || html.match(/\d{1,2}\s+(?:ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)/g) || [];
console.log('Text date matches count:', textMatches.length);
console.log('Date matches sample:', textMatches.slice(0, 20));
