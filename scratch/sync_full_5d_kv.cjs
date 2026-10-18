const spc5DMap = {
  '2026-10-18': '67291',
  '2026-10-17': '42338',
  '2026-10-16': '8045',
  '2026-10-15': '12830',
  '2026-10-14': '14104',
  '2026-10-13': '74307',
  '2026-10-12': '07286',
  '2026-10-11': '75291',
  '2026-10-10': '16463',
  '2026-10-09': '20007',
  '2026-10-08': '78576',
  '2026-10-07': '51499',
  '2026-10-06': '39283',
  '2026-10-05': '81751',
  '2026-10-04': '47792',
  '2026-10-03': '83948',
  '2026-10-02': '22030',
  '2026-10-01': '78849'
};

const reg5DMap = {
  '2026-10-18': '00642',
  '2026-10-17': '64538',
  '2026-10-16': '63756',
  '2026-10-15': '62066',
  '2026-10-14': '28259',
  '2026-10-13': '53618',
  '2026-10-12': '38287',
  '2026-10-11': '07363',
  '2026-10-10': '82153',
  '2026-10-09': '20635',
  '2026-10-08': '43339',
  '2026-10-07': '56488',
  '2026-10-06': '12554',
  '2026-10-05': '19654',
  '2026-10-04': '82951',
  '2026-10-03': '77961',
  '2026-10-02': '24483',
  '2026-10-01': '40208'
};

const vip5DMap = {
  '2026-10-18': '53820',
  '2026-10-17': '23316',
  '2026-10-16': '69866',
  '2026-10-15': '92335',
  '2026-10-14': '58464',
  '2026-10-13': '82498',
  '2026-10-12': '19181',
  '2026-10-11': '62031',
  '2026-10-10': '92629',
  '2026-10-09': '53768',
  '2026-10-08': '78461',
  '2026-10-07': '71738',
  '2026-10-06': '50172',
  '2026-10-05': '17087',
  '2026-10-04': '12748',
  '2026-10-03': '00167',
  '2026-10-02': '25018',
  '2026-10-01': '96624'
};

async function syncAll() {
  const getRes = await fetch('https://lotto289.paounda2021.workers.dev/api/draws');
  const json = await getRes.json();
  const ds = json.datasets;

  const spc = ds['lotto_data_hanoi_special'] || [];
  const reg = ds['lotto_data_hanoi'] || [];
  const vip = ds['lotto_data_hanoi_vip'] || [];

  spc.forEach(d => {
    const val = spc5DMap[d.date] || (d.top3 && d.top3.length === 5 ? d.top3 : undefined) || (d.full6D && d.full6D.length >= 5 ? d.full6D.slice(-5) : undefined) || (d.top3 ? '00' + d.top3 : '-');
    d.full5 = val;
    d.prize5d = val;
  });

  reg.forEach(d => {
    const val = reg5DMap[d.date] || (d.top3 && d.top3.length === 5 ? d.top3 : undefined) || (d.full6D && d.full6D.length >= 5 ? d.full6D.slice(-5) : undefined) || (d.top3 ? '00' + d.top3 : '-');
    d.full5 = val;
    d.prize5d = val;
  });

  vip.forEach(d => {
    const val = vip5DMap[d.date] || (d.top3 && d.top3.length === 5 ? d.top3 : undefined) || (d.full6D && d.full6D.length >= 5 ? d.full6D.slice(-5) : undefined) || (d.top3 ? '00' + d.top3 : '-');
    d.full5 = val;
    d.prize5d = val;
  });

  await fetch('https://lotto289.paounda2021.workers.dev/api/draws', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'lotto_data_hanoi_special', data: spc })
  });
  console.log('Special updated!');

  await fetch('https://lotto289.paounda2021.workers.dev/api/draws', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'lotto_data_hanoi', data: reg })
  });
  console.log('Regular updated!');

  await fetch('https://lotto289.paounda2021.workers.dev/api/draws', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'lotto_data_hanoi_vip', data: vip })
  });
  console.log('VIP updated!');

  // Verify
  const ver = await fetch('https://lotto289.paounda2021.workers.dev/api/draws');
  const verJson = await ver.json();
  const vSpc = verJson.datasets.lotto_data_hanoi_special;
  const vReg = verJson.datasets.lotto_data_hanoi;
  const vVip = verJson.datasets.lotto_data_hanoi_vip;

  console.log('Verified Special [0]:', vSpc[0].date, 'full5:', vSpc[0].full5);
  console.log('Verified Special [1]:', vSpc[1].date, 'full5:', vSpc[1].full5);
  console.log('Verified Regular [0]:', vReg[0].date, 'full5:', vReg[0].full5);
  console.log('Verified Regular [1]:', vReg[1].date, 'full5:', vReg[1].full5);
  console.log('Verified VIP [0]:', vVip[0].date, 'full5:', vVip[0].full5);
  console.log('Verified VIP [1]:', vVip[1].date, 'full5:', vVip[1].full5);
}

syncAll();
