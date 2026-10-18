const https = require('https');

https.get('https://lotto289.paounda2021.workers.dev/api/draws', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(d);
      const keys = Object.keys(json.data || {});
      console.log('API draws keys count:', keys.length);
      console.log('Has lotto_data_dowjones:', keys.includes('lotto_data_dowjones'));
      console.log('Has lotto_data_malay:', keys.includes('lotto_data_malay'));
    } catch(e) { console.error('Parse error:', e); }
  });
});

https.get('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Live JS has 12.0.0_remove_malay_dowjones:', d.includes('12.0.0_remove_malay_dowjones'));
    console.log('Live JS has MALAY tab button:', d.includes('🇲🇾 หวยมาเลย์'));
    console.log('Live JS has DOWJONES tab button:', d.includes('🇺🇸 หุ้นดาวโจนส์'));
  });
});
