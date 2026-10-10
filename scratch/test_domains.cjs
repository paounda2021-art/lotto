const domains = [
  'https://lotto289.paounda2021.workers.dev',
  'https://faae1b0f-lotto289.paounda2021.workers.dev',
  'https://faae1b0f.lotto289.paounda2021.workers.dev',
  'https://lotto.paounda2021.workers.dev',
  'https://hengheng.pages.dev'
];

async function check() {
  for (const domain of domains) {
    try {
      const res = await fetch(domain, { redirect: 'follow' });
      console.log(`URL: ${domain} => Status: ${res.status}, Type: ${res.headers.get('content-type')}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`  HTML preview (first 300 chars): ${text.slice(0, 300)}`);
      }
    } catch (e) {
      console.log(`URL: ${domain} => Error: ${e.message}`);
    }
  }
}

check();
