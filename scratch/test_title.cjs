const activeType = 'STOCK_VIP';
let title = 'ผลรางวัล';
if (activeType === 'NIKKEI') {
  title = 'นิเคอิ';
} else if (activeType === 'STOCKS_VIP') {
  title = 'หุ้น VIP';
}
console.log('Resulting title:', title);
