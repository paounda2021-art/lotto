// Suppose we have text near 'ชุดเจาะ 2 ตัว'
const sampleDom = `
✨ ชุดเจาะ 2 ตัว (เน้นประจำวันอังคาร)
เน้น 6 ชุด
10 40 48 82 92 14
`;

function extractPairs(text) {
  const idx = text.indexOf('ชุดเจาะ 2 ตัว');
  if (idx !== -1) {
    const chunk = text.substring(idx, idx + 250);
    const matches = chunk.match(/\b[0-9]{2}\b/g);
    if (matches && matches.length >= 6) {
      return matches.slice(0, 6);
    }
  }
  return null;
}

console.log('Extracted pairs from sample DOM:', extractPairs(sampleDom));
