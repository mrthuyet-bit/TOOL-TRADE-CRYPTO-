const fs = require('fs');

async function run() {
  const tRes = await fetch('https://api.binance.com/api/v3/ticker/24hr');
  const tData = await tRes.json();
  const usdtCoins = tData.filter(d => d.symbol.endsWith('USDT') && parseFloat(d.quoteVolume) > 1000000);
  console.log('Active USDT coins on Binance with Vol > 1M:', usdtCoins.length);
  console.log('Top 15 by volume:');
  usdtCoins
    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
    .slice(0, 15)
    .forEach((c, i) => {
      console.log(`${i + 1}. ${c.symbol} | Price: $${c.lastPrice} | 24h: ${c.priceChangePercent}% | Vol: $${(parseFloat(c.quoteVolume)/1e6).toFixed(1)}M`);
    });
}

run();
