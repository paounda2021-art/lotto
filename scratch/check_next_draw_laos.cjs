const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', 'lotto_data_laos.json');
const laosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Check what the latest draw is
console.log('Latest draw in laosData:', laosData[0]);

// Let's check how the next prediction is calculated
// In lotto_data_laos.json:
// 12 Oct: full6D = 377592 (top3=592, top2=92, bottom2=75)
// Previous was 09 Oct: full6D = 465647 (top3=647, top2=47, bottom2=56)
// Previous was 08 Oct: full6D = 856998 (top3=998, top2=98, bottom2=69)
// Previous was 07 Oct: full6D = 530090 (top3=090, top2=90, bottom2=00)
// Previous was 06 Oct: full6D = 121878 (top3=878, top2=78, bottom2=18)
// Previous was 05 Oct: full6D = 272607 (top3=607, top2=07, bottom2=26)

console.log('\n--- Checking dynamic next-draw calculation ---');
