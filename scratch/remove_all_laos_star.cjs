const fs = require('fs');

let content = fs.readFileSync('src/data/nikkeiData.ts', 'utf8');

// Find the export const initialNikkeiData: DrawResult[] = [
const prefix = 'export const initialNikkeiData: DrawResult[] = ';
const startIdx = content.indexOf(prefix);
if (startIdx === -1) {
  console.error('Prefix not found');
  process.exit(1);
}

const headerPart = content.slice(0, startIdx + prefix.length);
const arrayJsonPart = content.slice(startIdx + prefix.length).trim().replace(/;$/, '');

const data = JSON.parse(arrayJsonPart);
console.log('Original count:', data.length);

const filtered = data.filter(d => d.lotteryType !== 'LAOS_STAR' && d.session !== 'LAOS_STAR_DAY');
console.log('Filtered count:', filtered.length);

const newContent = headerPart + JSON.stringify(filtered, null, 2) + ';\n';
fs.writeFileSync('src/data/nikkeiData.ts', newContent, 'utf8');
console.log('Successfully removed all LAOS_STAR items from nikkeiData.ts!');
