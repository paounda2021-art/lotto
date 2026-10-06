const fs = require('fs');

function parseExphuay(filePath, lotteryType, session) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const results = [];
  
  // Find table rows or text content containing dates and digits
  // exphuay tables usually have dates like "03/10/2569" or "03/10/2026" or "3 ต.ค. 69"
  // Let's inspect regex pattern or print snippets
  
  // Match rows in table
  const trMatches = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  console.log(`Found ${trMatches.length} <tr> elements in ${filePath}`);

  for (const tr of trMatches) {
    const tdMatches = tr.match(/<td[\s\S]*?<\/td>/gi) || [];
    if (tdMatches.length >= 3) {
      const texts = tdMatches.map(td => td.replace(/<[^>]+>/g, '').trim());
      // Check if text has date pattern or numbers
      results.push(texts);
    }
  }

  return results;
}

const specialRows = parseExphuay('scratch/special.html', 'HANOI_SPECIAL', 'HANOI_SPECIAL');
console.log('Sample Special Rows (first 15):', specialRows.slice(0, 15));

const vipRows = parseExphuay('scratch/vip.html', 'HANOI_VIP', 'HANOI_VIP');
console.log('Sample VIP Rows (first 15):', vipRows.slice(0, 15));
