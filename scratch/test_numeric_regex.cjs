function isNumericResult(draw) {
  if (!draw) return false;
  const top3 = (draw.top3 || '').trim();
  const bottom2 = (draw.bottom2 || '').trim();
  return /^[0-9]{2,3}$/.test(top3) && /^[0-9]{2}$/.test(bottom2);
}

console.log('230, 81:', isNumericResult({ top3: '230', bottom2: '81' }));
console.log('กผล, งดออกผล:', isNumericResult({ top3: 'กผล', bottom2: 'งดออกผล' }));
console.log('รอผล, รอผล:', isNumericResult({ top3: 'รอผล', bottom2: 'รอผล' }));
