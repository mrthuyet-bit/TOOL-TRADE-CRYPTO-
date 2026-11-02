async function run() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Got', data.length, 'coins!');
      const fs = require('fs');
      fs.writeFileSync('cg_top250_market.json', JSON.stringify(data, null, 2));
    }
  } catch(e) {
    console.log('Err:', e.message);
  }
}
run();
