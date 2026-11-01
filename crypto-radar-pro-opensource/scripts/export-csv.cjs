const fs = require('fs');
const path = require('path');

const data = require('../src/data/coins10MPlus.json');

const headers = [
  'Rank',
  'Symbol',
  'Name',
  'Blockchain',
  'Price_USD',
  'Market_Cap_USD',
  'Market_Cap_M',
  'Volume_24h_USD',
  'Volume_24h_M',
  'Change_24h_Percent',
  'ATH_USD',
  'ATH_Drop_Percent',
  'Tier1_CEX_Listed',
  'Total_Exchanges_Count',
  'Listed_Exchanges'
];

const rows = data.map(c => [
  c.rank,
  c.symbol,
  `"${c.name}"`,
  c.chain,
  c.priceUsd,
  c.marketCap,
  `"${c.marketCapFormatted}"`,
  c.volume24h,
  `"${c.volume24hFormatted}"`,
  c.change24h,
  c.ath,
  c.athChangePercent,
  c.isTier1Listed ? 'YES' : 'NO',
  c.exchangesCount,
  `"${c.exchanges.join(', ')}"`
]);

const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
const outputPath = path.join(__dirname, 'Coins_MarketCap_Over_10M.csv');
fs.writeFileSync(outputPath, csvContent, 'utf8');

console.log(`✅ Đã xuất file CSV thành công: ${outputPath}`);
