function getCombinedTag(type, title, digitsStr) {
  const t = (type || '').toUpperCase();
  if (t === 'HANOI') {
    return `🏷️ รวม 3 ฮานอย [${digitsStr}]`;
  }
  if (t === 'NIKKEI') {
    return `🏷️ รวมทุกหุ้นปกติ 6 รอบ [${digitsStr}]`;
  }
  if (t === 'STOCK_VIP' || t === 'STOCKS_VIP') {
    return `🏷️ รวมทุกหุ้น VIP 6 รอบ [${digitsStr}]`;
  }
  return '';
}

console.log('Hanoi VIP tag:', getCombinedTag('HANOI', 'ฮานอย VIP (19:30)', 'บน 3 1'));
console.log('Nikkei tag:', getCombinedTag('NIKKEI', 'นิเคอิ-ปก (เช้า)', 'บน 3 0'));
console.log('Stocks VIP tag:', getCombinedTag('STOCK_VIP', 'นิเคอิ-VIP (เช้า)', 'บน 2 5'));
console.log('Laos tag:', getCombinedTag('LAOS', 'ลาวพัฒนา', 'บน 2 5'));
