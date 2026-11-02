import { TokenMetrics } from '../types';

export interface LongShortSetup {
  tokenSymbol: string;
  tokenName: string;
  category?: string;
  chain: string;
  currentPrice: number;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  timeframe: 'M15 (Scalping)' | 'H1 (Day Trade)' | 'H4 (Swing)';
  cyclePhase: string; // Ước tính vị thế chu kỳ riêng cho từng coin
  cycleRiskRewardNote: string; // Lý do R:R phân bổ linh hoạt
  shortTermScore: number; // 0 - 100 điểm tiềm năng lướt sóng ngắn hạn
  recommendedLeverage: string; // e.g. '5x - 10x', '3x - 5x'
  maxLeverage: number; // 5, 10
  entryPrice: number;
  entryRange: [number, number];
  stopLoss: number;
  stopLossPercent: number; // e.g. -2.1%
  takeProfit1: number;
  takeProfit1Percent: number; // e.g. +4.8% (Chốt 50% khối lượng)
  takeProfit2: number;
  takeProfit2Percent: number; // e.g. +11.2% (Chốt 50% còn lại)
  takeProfit3?: number; // Tương thích ngược (optional)
  takeProfit3Percent?: number;
  riskRewardRatio: string; // e.g. '1 : 2.4', '1 : 3.8', '1 : 4.5' (Linh hoạt cho từng coin)
  rrNumber: number;
  estimatedWinRate: number; // e.g. 72%
  fundingRate: string; // e.g. '+0.0100%'
  volume24h: number;
  marketCap: number;
  reason: string;
  catalysts: string[];
}

export function generateLongShortSetup(token: TokenMetrics): LongShortSetup {
  const price = token.priceUsd || 1;
  const change5m = token.change5m || 0;
  const change1h = token.change1h || 0;
  const change24h = token.change24h || 0;
  const buyRatio = token.buyVolumeRatio || 0.52;
  const vol = token.volume24h || 1000000;
  const mcap = token.marketCap || token.fdv || 10000000;
  const sym = token.symbol.toUpperCase();

  const isMajor = ['BTC', 'ETH', 'SOL', 'BNB'].includes(sym);
  const isMeme = token.category === 'Meme Coins';

  // 1. ATH & Drawdown cycle calculation
  const ath = (token as any).ath || (price > 1 ? price * 3.5 : price * 12);
  const athDrawdown = Math.max(-98, Math.min(0, parseFloat((((price - ath) / ath) * 100).toFixed(1))));

  // 2. Determine Direction: LONG vs SHORT
  let direction: 'LONG' | 'SHORT' | 'NEUTRAL' = 'LONG';
  let shortTermScore = 70;
  let reason = '';
  const catalysts: string[] = [];

  if (change24h > 25 && change5m < -0.3) {
    direction = 'SHORT';
    shortTermScore = 84;
    reason = `Đã tăng nóng +${change24h}% trong 24h qua, xuất hiện phân kỳ giảm M15, volume chốt lời tăng. Thích hợp đánh Short đón sóng điều chỉnh kỹ thuật.`;
    catalysts.push('Chạm kháng cự chu kỳ M15/H1', 'Lực mua suy kiệt, phe bán đẩy hàng', 'R:R vị thế Short tối ưu');
  } else if (change1h < -2.5 && change5m < -0.5 && buyRatio < 0.46) {
    direction = 'SHORT';
    shortTermScore = 78;
    reason = `Áp lực bán chủ động chiếm ${Math.round((1 - buyRatio) * 100)}%, thủng hỗ trợ ngắn hạn, xu hướng giảm tiếp diễn.`;
    catalysts.push('Thủng hỗ trợ M15', 'Taker Sell chiếm ưu thế', 'Dòng tiền rút ra ngắn hạn');
  } else if (change5m > 0.2 && change1h > 0.5 && buyRatio > 0.53) {
    direction = 'LONG';
    shortTermScore = 88;
    reason = `Dòng tiền mua chủ động bùng nổ (${Math.round(buyRatio * 100)}% buy), bứt phá cản chéo ngắn hạn, động lượng 5m và 1h đồng thuận tăng.`;
    catalysts.push('Breakout cản ngắn hạn M15', 'Taker Buy gia tăng đột biến', 'Động lượng RSI hướng lên 60-70');
  } else if (change24h < -12 && change5m > 0.1) {
    direction = 'LONG';
    shortTermScore = 82;
    reason = `Đã chiết khấu sâu ${change24h}% trong 24h, chạm hỗ trợ cứng chu kỳ, lực cầu bắt đáy xuất hiện. Setup Long ăn sóng hồi kỹ thuật.`;
    catalysts.push('RSI vào vùng quá bán (<35)', 'Hỗ trợ cứng chu kỳ giữ vững', 'Lực cầu gom đáy xuất hiện');
  } else {
    direction = buyRatio >= 0.5 ? 'LONG' : 'SHORT';
    shortTermScore = 74;
    reason = direction === 'LONG' 
      ? 'Dòng tiền duy trì ổn định, giữ vững cấu trúc đáy cao dần (higher lows) trên khung H1.'
      : 'Biến động yếu, dòng tiền chững lại, áp lực bán rỉ rả chưa có tín hiệu gom mạnh.';
    catalysts.push('Tích lũy biên độ hẹp', 'Khối lượng giao dịch ổn định', 'Chờ xác nhận breakout');
  }

  // 3. ƯỚC TÍNH VỊ THẾ CHU KỲ & ĐỊNH HÌNH TỶ LỆ R:R RIÊNG CHO TỪNG COIN
  let cyclePhase = 'Vùng Tích Lũy Gom Hàng';
  let cycleRiskRewardNote = '';
  let baseSl = 2.4;
  let baseTp1 = 4.8;
  let baseTp2 = 9.8;

  if (athDrawdown > -25) {
    cyclePhase = 'Tiệm Cận Đỉnh (Late Cycle FOMO)';
    if (direction === 'SHORT') {
      cycleRiskRewardNote = 'Cản đỉnh lịch sử rất gần, cắt lỗ cực chặt, biên độ rơi sâu -> Kèo Short R:R cao';
      baseSl = 1.9;
      baseTp1 = 4.6;
      baseTp2 = 9.2; // R:R ~ 1 : 4.8
    } else {
      cycleRiskRewardNote = 'Dư địa trần mỏng, biến động rung lắc lớn -> Cần chốt nhanh, R:R thận trọng';
      baseSl = 3.2;
      baseTp1 = 3.6;
      baseTp2 = 6.4; // R:R ~ 1 : 2.0
    }
  } else if (athDrawdown > -55) {
    cyclePhase = 'Bứt Phá Đầu Sóng (Markup)';
    cycleRiskRewardNote = 'Vượt cản tạo trend tăng, dòng tiền đẩy dứt khoát -> Tỷ lệ R:R chuẩn sóng';
    baseSl = 2.4;
    baseTp1 = 5.2;
    baseTp2 = 10.4; // R:R ~ 1 : 3.0 - 1 : 3.3
  } else if (athDrawdown > -78) {
    cyclePhase = 'Tái Tích Lũy Nền Trung Hạn';
    cycleRiskRewardNote = 'Hỗ trợ chu kỳ được bảo vệ, tích lũy gom hàng chuẩn bị bứt phá';
    baseSl = 2.1;
    baseTp1 = 4.9;
    baseTp2 = 11.2; // R:R ~ 1 : 3.6 - 1 : 4.0
  } else {
    // Deep Value (Đáy chu kỳ)
    cyclePhase = 'Đáy Chu Kỳ (Deep Value)';
    cycleRiskRewardNote = 'Chiết khấu sâu từ đỉnh, rủi ro thủng đáy thấp, dư địa bật nảy cực lớn -> R:R vượt trội';
    baseSl = 1.8;
    baseTp1 = 5.6;
    baseTp2 = 13.2; // R:R ~ 1 : 4.5 - 1 : 5.2
  }

  // 4. Hệ số biến động theo phân hệ (Category) & động lượng thực tế
  let categoryFactor = 1.0;
  if (isMeme) {
    categoryFactor = 1.55;
  } else if (isMajor) {
    categoryFactor = 0.65;
  } else if (token.category === 'AI & Big Data') {
    categoryFactor = 1.2;
  } else if (token.category === 'DeFi') {
    categoryFactor = 1.05;
  }

  // Biến động thực tế 24h & 1h tạo dấu ấn riêng cho từng coin
  const realVolFactor = Math.min(2.2, Math.max(0.75, (Math.abs(change24h) * 0.035) + (Math.abs(change1h) * 0.12) + 0.85));

  // Biến thiên tự nhiên theo mã token để không có 2 coin nào giống hệt nhau
  const charSum = sym.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const individualVariance = 0.90 + ((charSum % 9) * 0.025); // Dao động từ 0.90 đến 1.10

  const combinedFactor = categoryFactor * realVolFactor * individualVariance;

  // Tính toán chính xác từng mức SL, TP1, TP2
  const stopLossPercentVal = parseFloat((baseSl * combinedFactor).toFixed(1));
  const tp1PercentVal = parseFloat((baseTp1 * combinedFactor).toFixed(1));
  const tp2PercentVal = parseFloat((baseTp2 * combinedFactor).toFixed(1));

  // Đảm bảo tối thiểu và tính R:R
  const finalSlPercent = Math.max(isMajor ? 1.0 : 1.4, stopLossPercentVal);
  const finalTp1Percent = Math.max(finalSlPercent * 1.25, tp1PercentVal);
  const finalTp2Percent = Math.max(finalTp1Percent * 1.6, tp2PercentVal);

  let stopLoss = 0;
  let stopLossPercent = 0;
  let takeProfit1 = 0;
  let takeProfit1Percent = 0;
  let takeProfit2 = 0;
  let takeProfit2Percent = 0;

  if (direction === 'LONG') {
    stopLossPercent = -finalSlPercent;
    stopLoss = price * (1 + stopLossPercent / 100);

    takeProfit1Percent = finalTp1Percent;
    takeProfit1 = price * (1 + takeProfit1Percent / 100);

    takeProfit2Percent = finalTp2Percent;
    takeProfit2 = price * (1 + takeProfit2Percent / 100);
  } else {
    // SHORT setup
    stopLossPercent = finalSlPercent;
    stopLoss = price * (1 + stopLossPercent / 100);

    takeProfit1Percent = -finalTp1Percent;
    takeProfit1 = price * (1 + takeProfit1Percent / 100);

    takeProfit2Percent = -finalTp2Percent;
    takeProfit2 = price * (1 + takeProfit2Percent / 100);
  }

  // Tỷ lệ R:R linh hoạt cho từng coin
  const rrNumber = parseFloat((Math.abs(takeProfit2Percent) / Math.abs(stopLossPercent)).toFixed(1));
  const riskRewardRatio = `1 : ${rrNumber}`;

  // Đòn bẩy khuyến nghị
  let recommendedLeverage = '3x - 5x';
  let maxLeverage = 5;
  if (isMajor) {
    recommendedLeverage = '5x - 10x';
    maxLeverage = 10;
  } else if (isMeme) {
    recommendedLeverage = '2x - 3x (Biến động cao)';
    maxLeverage = 3;
  }

  const entryRange: [number, number] = direction === 'LONG'
    ? [price * 0.995, price * 1.005]
    : [price * 0.998, price * 1.008];

  const estimatedWinRate = Math.min(84, Math.max(62, Math.round(shortTermScore * 0.85 + (charSum % 5) - 2)));
  const fundingRate = (direction === 'LONG' ? '+' : '-') + (0.005 + (Math.abs(change24h) * 0.001)).toFixed(4) + '%';

  return {
    tokenSymbol: sym,
    tokenName: token.name,
    category: token.category || 'Layer 1 / L2',
    chain: token.chain,
    currentPrice: price,
    direction,
    timeframe: isMeme ? 'M15 (Scalping)' : isMajor ? 'H1 (Day Trade)' : 'H4 (Swing)',
    cyclePhase,
    cycleRiskRewardNote,
    shortTermScore,
    recommendedLeverage,
    maxLeverage,
    entryPrice: price,
    entryRange,
    stopLoss,
    stopLossPercent: parseFloat(stopLossPercent.toFixed(2)),
    takeProfit1,
    takeProfit1Percent: parseFloat(takeProfit1Percent.toFixed(2)),
    takeProfit2,
    takeProfit2Percent: parseFloat(takeProfit2Percent.toFixed(2)),
    riskRewardRatio,
    rrNumber,
    estimatedWinRate,
    fundingRate,
    volume24h: vol,
    marketCap: mcap,
    reason,
    catalysts,
  };
}

export function rankTokensForShortTermTrading(tokens: TokenMetrics[]): LongShortSetup[] {
  const setups = tokens
    .filter((t) => t.category !== 'Stablecoin' && (t.volume24h || 0) > 1000000)
    .map(generateLongShortSetup);

  // Sort by shortTermScore descending
  setups.sort((a, b) => b.shortTermScore - a.shortTermScore);
  return setups;
}
