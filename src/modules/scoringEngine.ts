/**
 * MEME COIN SCORING ENGINE
 * 
 * Công thức tính điểm minh bạch theo Section V:
 * - Dòng tiền và giao dịch: max 30 điểm
 * - Mức độ chú ý: max 25 điểm
 * - Thanh khoản: max 25 điểm
 * - Động lượng giá: max 20 điểm
 * Tổng: 0 - 100 điểm.
 * 
 * NGUYÊN TẮC: Điểm số có thể truy xuất chi tiết từng lý do. Không coi điểm cao là xác suất sinh lời.
 */

export interface ScoringInput {
  volume24h: number;
  liquidityUsd: number;
  buyers24h: number;
  sellers24h: number;
  buyVolumeRatio: number;
  change5m: number;
  change1h: number;
  change24h: number;
  holdersCount: number;
  fdv: number;
}

export interface ScoreResult {
  totalScore: number;
  moneyFlowScore: number;       // max 30
  socialAttentionScore: number; // max 25
  liquidityScore: number;       // max 25
  priceMomentumScore: number;   // max 20
  reasons: string[];
  disclaimer: string;
}

export function calculateOpportunityScore(input: ScoringInput): ScoreResult {
  let moneyFlowScore = 0;
  let socialAttentionScore = 0;
  let liquidityScore = 0;
  let priceMomentumScore = 0;
  const reasons: string[] = [];

  // 1. Dòng tiền & Giao dịch (Max 30đ)
  // Tỷ lệ mua/bán
  const buyRatio = input.sellers24h > 0 ? input.buyers24h / input.sellers24h : 1;
  if (buyRatio >= 2.0) {
    moneyFlowScore += 12;
    reasons.push(`Số người mua áp đảo gấp ${buyRatio.toFixed(1)}x số người bán (+12đ)`);
  } else if (buyRatio >= 1.3) {
    moneyFlowScore += 8;
    reasons.push(`Người mua chiếm ưu thế (+8đ)`);
  } else {
    moneyFlowScore += 3;
    reasons.push(`Áp lực mua/bán cân bằng (+3đ)`);
  }

  // Tỷ lệ buy volume
  if (input.buyVolumeRatio >= 0.7) {
    moneyFlowScore += 10;
    reasons.push(`Tỷ lệ dòng tiền mua chiếm ${(input.buyVolumeRatio * 100).toFixed(0)}% tổng khối lượng (+10đ)`);
  } else if (input.buyVolumeRatio >= 0.55) {
    moneyFlowScore += 6;
  }

  // Tỷ lệ Volume / Thanh khoản (Đo độ xoay vòng)
  const volToLiq = input.liquidityUsd > 0 ? input.volume24h / input.liquidityUsd : 0;
  if (volToLiq >= 3.0 && volToLiq <= 15.0) {
    moneyFlowScore += 8;
    reasons.push(`Vòng quay vốn sôi động (Vol/Liq = ${volToLiq.toFixed(1)}x) (+8đ)`);
  } else if (volToLiq > 15.0) {
    moneyFlowScore += 4;
    reasons.push(`Cảnh báo: Vol/Liq quá cao (>15x), có thể có dấu hiệu wash trading (+4đ)`);
  } else {
    moneyFlowScore += 4;
  }

  // 2. Mức độ chú ý & Tăng trưởng cộng đồng (Max 25đ)
  if (input.buyers24h >= 3000) {
    socialAttentionScore += 15;
    reasons.push(`Cộng đồng chú ý mạnh: Trên 3,000 ví mua trong 24h (+15đ)`);
  } else if (input.buyers24h >= 1000) {
    socialAttentionScore += 10;
    reasons.push(`Lượng người mua mới đạt ${input.buyers24h.toLocaleString()} ví (+10đ)`);
  } else {
    socialAttentionScore += 5;
  }

  if (input.holdersCount >= 10000) {
    socialAttentionScore += 10;
    reasons.push(`Tập holder lớn: ${input.holdersCount.toLocaleString()} ví nắm giữ (+10đ)`);
  } else if (input.holdersCount >= 3000) {
    socialAttentionScore += 6;
  } else {
    socialAttentionScore += 3;
  }

  // 3. Thanh khoản & Độ sâu Pool (Max 25đ)
  if (input.liquidityUsd >= 2000000) {
    liquidityScore += 25;
    reasons.push(`Pool thanh khoản rất sâu ($${(input.liquidityUsd / 1e6).toFixed(1)}M), trượt giá thấp (+25đ)`);
  } else if (input.liquidityUsd >= 500000) {
    liquidityScore += 18;
    reasons.push(`Thanh khoản đạt $${(input.liquidityUsd / 1000).toFixed(0)}K, an toàn cho vị thế vừa (+18đ)`);
  } else if (input.liquidityUsd >= 100000) {
    liquidityScore += 10;
    reasons.push(`Thanh khoản cơ bản ($${(input.liquidityUsd / 1000).toFixed(0)}K) (+10đ)`);
  } else {
    liquidityScore += 4;
    reasons.push(`Cảnh báo: Thanh khoản mỏng (<$100K), rủi ro trượt giá lớn (+4đ)`);
  }

  // 4. Động lượng giá (Max 20đ)
  if (input.change5m > 0 && input.change1h > 10 && input.change24h > 50) {
    priceMomentumScore += 20;
    reasons.push(`Động lượng đồng thuận: Tăng trên cả 3 khung 5m, 1h, 24h (+20đ)`);
  } else if (input.change1h > 5 && input.change24h > 20) {
    priceMomentumScore += 14;
    reasons.push(`Đà tăng ổn định trên khung 1h và 24h (+14đ)`);
  } else if (input.change24h > 0) {
    priceMomentumScore += 8;
  } else {
    priceMomentumScore += 2;
    reasons.push(`Giá đang điều chỉnh hoặc chưa có động lượng (+2đ)`);
  }

  const totalScore = Math.min(100, moneyFlowScore + socialAttentionScore + liquidityScore + priceMomentumScore);

  return {
    totalScore,
    moneyFlowScore,
    socialAttentionScore,
    liquidityScore,
    priceMomentumScore,
    reasons,
    disclaimer: 'CẢNH BÁO QUAN TRỌNG: Điểm số chỉ phản ánh dòng tiền và thanh khoản tại thời điểm kiểm tra. Điểm cao KHÔNG PHẢI là xác suất hay cam kết sinh lời.',
  };
}
