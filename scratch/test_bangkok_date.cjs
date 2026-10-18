function getBangkokTodayDate() {
  const now = new Date();
  // Bangkok is UTC+7
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const bangkokDate = new Date(utc + (3600000 * 7));
  const y = bangkokDate.getFullYear();
  const m = String(bangkokDate.getMonth() + 1).padStart(2, '0');
  const d = String(bangkokDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

console.log('Bangkok today date:', getBangkokTodayDate());
