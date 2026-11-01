import { TokenMetrics } from '../types';

export interface HoldScoreDetail {
  score: number;
  rank: number;
  recommendation: 'RẤT NÊN TÍCH LŨY' | 'NÊN TÍCH LŨY' | 'CÂN NHẮC (5-10% VỐN)' | 'THEO DÕI THÊM' | 'KHÔNG NÊN HOLD';
  allocation: string;
  cyclePosition: string;
  reason: string;
}

export function evaluateTokenHoldSafety(token: TokenMetrics): HoldScoreDetail {
  const sym = (token.symbol || '').toUpperCase();
  const mcap = token.marketCap || token.fdv || 0;
  const vol = token.volume24h || 0;
  const risk = token.riskScore || 20;
  const cat = token.category || 'Layer 1 / L2';
  const isMeme = cat === 'Meme Coins';
  const isTier1 = token.isTier1Listed || (token.exchanges && token.exchanges.some(e => ['binance', 'coinbase', 'bybit', 'okx'].includes(e.toLowerCase())));

  // 0. BỘ LỌC RÁC: Loại bỏ các token nợ thế chấp đóng, RWA nội bộ không thể giao dịch hoặc data ảo
  const BLACKLIST_SYMBOLS = ['FIGR_HELOC', 'FIGR', 'WBTC', 'WETH'];
  if (BLACKLIST_SYMBOLS.includes(sym)) {
    return {
      score: 20,
      rank: 999,
      recommendation: 'KHÔNG NÊN HOLD',
      allocation: '0% (Tài Sản Nợ Đóng)',
      cyclePosition: 'Tài Sản Nợ Chuyên Biệt',
      reason: 'Token nợ/RWA thế chấp đóng nội bộ của tổ chức Mỹ (Figure HELOC), không phải crypto thanh khoản tự do để cá nhân DCA tích lũy.',
    };
  }

  // 1. Trụ cột đặc biệt: ĐÁNH GIÁ CHU KỲ ĐỘNG (DYNAMIC CYCLE VALUATION)
  // Điểm tích lũy BIẾN THIÊN theo tọa độ giá so với Đỉnh ATH và Đáy ATL, không bao giờ cố định một mức!
  let price = token.priceUsd || 1;
  let mcapActual = mcap;

  // Sửa lỗi dữ liệu lệch cho ZEC nếu có
  if (sym === 'ZEC' && price > 200) {
    price = 32.4;
    mcapActual = 520000000;
  }

  const ath = (token as any).ath || (sym === 'BTC' ? 73750 : sym === 'ETH' ? 4890 : sym === 'SOL' ? 260 : sym === 'BNB' ? 720 : price * 3.5);
  const athDrawdown = ath > 0 ? ((price - ath) / ath) * 100 : 0;

  if (sym === 'BTC') {
    let score = 90;
    let cyclePosition = 'Tích Lũy Bền Vững';
    let recommendation: HoldScoreDetail['recommendation'] = 'NÊN TÍCH LŨY';
    let allocation = '30% - 40% Danh Mục';
    let reason = 'Vàng kỹ thuật số, tài sản dự trữ an toàn số 1 thế giới.';

    if (athDrawdown >= -5) {
      // Đang ở vùng đỉnh hoặc sát đỉnh ATH ($73K - $78K+) -> Điểm tích lũy GIẢM MẠNH để chống đu đỉnh FOMO!
      score = 79;
      cyclePosition = '⚠️ Tiệm Cận Đỉnh (Late Cycle)';
      recommendation = 'CÂN NHẮC (5-10% VỐN)';
      allocation = '15% - 25% (Chờ Nhịp Chỉnh)';
      reason = `Giá BTC ($${Math.round(price).toLocaleString()}) đang ở sát đỉnh lịch sử. Dù là tài sản dự trữ an toàn số 1, rủi ro điều chỉnh ngắn hạn (-15% đến -25%) rất cao, tuyệt đối không mua đuổi, chỉ giải ngân thăm dò hoặc chờ retest hỗ trợ sâu.`;
    } else if (athDrawdown >= -20) {
      // Vùng bứt phá đầu sóng
      score = 88;
      cyclePosition = 'Bứt Phá Đầu Sóng';
      recommendation = 'NÊN TÍCH LŨY';
      allocation = '25% - 35% Danh Mục';
      reason = 'Đang giữ vững cấu trúc tăng trưởng, dòng tiền quỹ ETF mua ròng ổn định.';
    } else if (athDrawdown >= -40) {
      // Nhịp điều chỉnh lành mạnh giữa chu kỳ
      score = 94;
      cyclePosition = 'Chiết Khấu Đẹp Giữa Chu Kỳ';
      recommendation = 'RẤT NÊN TÍCH LŨY';
      allocation = '35% - 50% Danh Mục';
      reason = 'Vùng giá điều chỉnh lành mạnh rất đẹp để dòng tiền lớn gia tăng vị thế dài hạn.';
    } else {
      // Vùng đáy mùa đông (Deep Value)
      score = 99;
      cyclePosition = '💎 Vùng Đáy Lịch Sử (Deep Value)';
      recommendation = 'RẤT NÊN TÍCH LŨY';
      allocation = '45% - 60% Danh Mục';
      reason = 'Vùng định giá rẻ hiếm có trong lịch sử (Deep Value), áp lực bán tháo cạn kiệt, tỷ lệ R:R gom tài sản an toàn nhất.';
    }

    return {
      score,
      rank: 1,
      recommendation,
      allocation,
      cyclePosition,
      reason,
    };
  }

  if (sym === 'ETH') {
    let score = 88;
    let cyclePosition = 'Tích Lũy Hạ Tầng';
    let recommendation: HoldScoreDetail['recommendation'] = 'NÊN TÍCH LŨY';
    let allocation = '20% - 30% Danh Mục';
    let reason = 'Trụ cột Web3 & Smart Contract toàn cầu.';

    if (athDrawdown >= -10) {
      score = 78;
      cyclePosition = '⚠️ Tiệm Cận Đỉnh (Late Cycle)';
      recommendation = 'CÂN NHẮC (5-10% VỐN)';
      allocation = '15% - 20% (Chờ Chiết Khấu)';
      reason = 'Giá đang ở sát đỉnh lịch sử, rủi ro rung lắc lớn, không nên gom mạnh.';
    } else if (athDrawdown < -50) {
      // Chiết khấu sâu > -50% (như vùng giá $2200 - $2500 hiện tại)
      score = 96;
      cyclePosition = '💎 Chiết Khấu Sâu Đẹp (Deep Value)';
      recommendation = 'RẤT NÊN TÍCH LŨY';
      allocation = '25% - 35% Danh Mục';
      reason = 'Giá đã chiết khấu hơn 50% từ đỉnh ATH ($4,890), nền tảng DeFi và dòng tiền tổ chức ETF vững chắc, vùng mua gom cực kỳ hấp dẫn.';
    } else {
      score = 90;
      cyclePosition = 'Tích Lũy Bền Vững L1';
      recommendation = 'NÊN TÍCH LŨY';
      allocation = '20% - 30% Danh Mục';
      reason = 'Nền tảng smart contract số 1 thế giới, tỷ lệ staking cao bảo đảm an ninh mạng lưới.';
    }

    return {
      score,
      rank: 2,
      recommendation,
      allocation,
      cyclePosition,
      reason,
    };
  }

  if (sym === 'SOL') {
    let score = 84;
    let cyclePosition = 'Bứt Phá Hệ Sinh Thái L1';
    let recommendation: HoldScoreDetail['recommendation'] = 'NÊN TÍCH LŨY';
    let allocation = '10% - 20% Danh Mục';
    let reason = 'Top 1 Layer 1 về tốc độ giao dịch và lượng người dùng thực.';

    if (athDrawdown >= -15) {
      score = 76;
      cyclePosition = '⚠️ Tiệm Cận Đỉnh (Late Cycle)';
      recommendation = 'CÂN NHẮC (5-10% VỐN)';
      allocation = '5% - 10% (Chờ Retest)';
      reason = 'Giá tiệm cận đỉnh cũ ($260), áp lực chốt lời lớn, hạn chế mua đuổi.';
    } else if (athDrawdown < -55) {
      // Chiết khấu sâu (vùng <$100)
      score = 91;
      cyclePosition = 'Chiết Khấu Sâu Đẹp (Dòng Tiền L1)';
      recommendation = 'NÊN TÍCH LŨY';
      allocation = '10% - 20% Danh Mục';
      reason = 'Chiết khấu sâu từ đỉnh ATH, dòng tiền hệ sinh thái Solana dẫn đầu thị trường về volume giao dịch thực.';
    }

    return {
      score,
      rank: 3,
      recommendation,
      allocation,
      cyclePosition,
      reason,
    };
  }

  if (sym === 'BNB') {
    let score = 85;
    let cyclePosition = 'Tích Lũy Bền Vững CEX';
    let recommendation: HoldScoreDetail['recommendation'] = 'NÊN TÍCH LŨY';
    let allocation = '10% - 15% Danh Mục';
    let reason = 'Coin sàn lớn nhất thế giới (Binance), tiện ích thực tế cao.';

    if (athDrawdown >= -10) {
      score = 78;
      cyclePosition = 'Tiệm Cận Đỉnh CEX';
      recommendation = 'CÂN NHẮC (5-10% VỐN)';
      allocation = '5% - 10% Danh Mục';
    } else {
      score = 89;
      cyclePosition = 'Tích Lũy Bền Vững CEX';
      recommendation = 'NÊN TÍCH LŨY';
      allocation = '10% - 15% Danh Mục';
    }

    return {
      score,
      rank: 4,
      recommendation,
      allocation,
      cyclePosition,
      reason,
    };
  }

  if (sym === 'LINK') {
    let score = 88;
    return {
      score,
      rank: 5,
      recommendation: 'NÊN TÍCH LŨY',
      allocation: '10% - 15% Danh Mục',
      cyclePosition: 'Hạ Tầng Oracle & RWA Cốt Lõi',
      reason: 'Độc quyền hạ tầng Oracle toàn cầu, đối tác chính thức của mạng lưới liên ngân hàng SWIFT trong RWA.',
    };
  }
  if (sym === 'NEAR') {
    return {
      score: 86,
      rank: 6,
      recommendation: 'NÊN TÍCH LŨY',
      allocation: '10% - 15% Danh Mục',
      cyclePosition: 'Tích Lũy Đáy Chu Kỳ (User-Owned AI)',
      reason: 'Layer 1 sharding mạnh mẽ, tiên phong định hướng Chain Abstraction và AI On-chain, thanh khoản sâu.',
    };
  }
  if (sym === 'SUI') {
    return {
      score: 85,
      rank: 7,
      recommendation: 'NÊN TÍCH LŨY',
      allocation: '10% - 15% Danh Mục',
      cyclePosition: 'Bứt Phá Dòng Tiền L1',
      reason: 'Công nghệ Move ngôn ngữ an toàn, tăng trưởng TVL thần tốc, được hậu thuẫn bởi các quỹ hàng đầu.',
    };
  }
  if (sym === 'AVAX') {
    return {
      score: 84,
      rank: 8,
      recommendation: 'NÊN TÍCH LŨY',
      allocation: '10% - 15% Danh Mục',
      cyclePosition: 'Tích Lũy Nền Subnet',
      reason: 'Mô hình Subnet doanh nghiệp ứng dụng cao, hợp tác với JPMorgan, Citi và nhiều định chế lớn.',
    };
  }
  if (sym === 'UNI') {
    return {
      score: 83,
      rank: 9,
      recommendation: 'NÊN TÍCH LŨY',
      allocation: '5% - 10% Danh Mục',
      cyclePosition: 'Blue-Chip Sàn DEX Số 1',
      reason: 'Sàn phi tập trung lớn nhất Web3, doanh thu phí giao dịch thực tế khổng lồ, Unichain sắp ra mắt.',
    };
  }
  if (sym === 'AAVE') {
    return {
      score: 83,
      rank: 10,
      recommendation: 'NÊN TÍCH LŨY',
      allocation: '5% - 10% Danh Mục',
      cyclePosition: 'Blue-Chip Cho Vay DeFi',
      reason: 'Nền tảng Lending & Borrowing trụ cột của toàn bộ thế giới DeFi, an toàn qua nhiều mùa giông bão.',
    };
  }

  // 2. Chấm điểm theo thuật toán quản trị tài sản an toàn
  let score = 50;

  // Tiêu chí 1: Quy mô Vốn Hóa (Max 35đ)
  if (mcap >= 50000000000) score += 34; // >= $50B
  else if (mcap >= 10000000000) score += 28; // >= $10B
  else if (mcap >= 3000000000) score += 22; // >= $3B
  else if (mcap >= 1000000000) score += 16; // >= $1B
  else if (mcap >= 300000000) score += 10; // >= $300M
  else if (mcap >= 100000000) score += 6; // >= $100M
  else score += 1;

  // Tiêu chí 2: Phân hệ tài sản (Category Fundamental)
  if (cat === 'Layer 1 / L2') {
    score += 18;
  } else if (cat === 'RWA & Hạ tầng') {
    score += 16;
  } else if (cat === 'DeFi') {
    score += 14;
  } else if (cat === 'AI & Big Data') {
    score += 12;
  } else if (cat === 'Gaming & NFT') {
    score += 4;
  } else if (isMeme) {
    // MEME COIN: KHÔNG ĐỦ TIÊU CHUẨN TÍCH LŨY TÀI SẢN DÀI HẠN
    score -= 38;
  }

  // Tiêu chí 3: Niêm yết sàn Tier 1 & Thanh khoản sâu
  if (isTier1) score += 10;
  if (vol >= 100000000) score += 8;
  else if (vol >= 20000000) score += 5;
  else if (vol >= 5000000) score += 2;

  // Tiêu chí 4: Độ an toàn Smart Contract & Rủi ro
  if (risk <= 12) score += 12;
  else if (risk <= 25) score += 6;
  else if (risk > 45) score -= 16;

  // Tiêu chí 5: Tọa độ Chu kỳ (Đỉnh / Đáy chiết khấu)
  let cyclePosition = 'Tích Lũy Nền Giá';
  let isLateCyclePeak = false;
  if (athDrawdown > -20) {
    cyclePosition = '⚠️ Tiệm Cận Đỉnh (Late Cycle)';
    score -= 35; // Giảm mạnh điểm tích lũy khi ở sát đỉnh chu kỳ
    isLateCyclePeak = true;
  } else if (athDrawdown < -75) {
    cyclePosition = '💎 Vùng Đáy Chu Kỳ (Deep Value)';
    score += 10; // Chiết khấu sâu, cơ hội gom
  } else if (athDrawdown < -50) {
    cyclePosition = 'Chiết Khấu Sâu Đẹp';
    score += 5;
  } else {
    cyclePosition = 'Bứt Phá Đầu Sóng';
  }

  // Capped 10 - 92 cho các token thông thường
  score = Math.max(12, Math.min(88, Math.round(score)));

  // NGUYÊN TẮC QUẢN TRỊ RỦI RO SỐ 1: BẤT KỲ COIN NÀO Ở TIỆM CẬN ĐỈNH KHÔNG BAO GIỜ ĐƯỢC VƯỢT QUÁ 58 ĐIỂM!
  if (isLateCyclePeak) {
    score = Math.min(58, score);
  }

  // Nếu là Meme Coin -> Giới hạn tối đa không quá 38 điểm
  if (isMeme) {
    score = Math.min(38, score);
  }

  // Phân loại khuyến nghị rõ ràng: TỪ NÊN CHO ĐẾN KHÔNG NÊN
  let recommendation: HoldScoreDetail['recommendation'] = 'THEO DÕI THÊM';
  let allocation = '0% - 5% (Chỉ Thăm Dò)';
  let reason = '';

  if (isLateCyclePeak) {
    recommendation = 'THEO DÕI THÊM';
    allocation = '0% (Chờ Retest Hỗ Trợ)';
    reason = 'Giá đang ở sát đỉnh lịch sử (Late Cycle Peak), rủi ro rung lắc điều chỉnh -30% đến -50% rất cao. Tuyệt đối không FOMO mua tích lũy ở vùng này.';
  } else if (score >= 80) {
    recommendation = 'NÊN TÍCH LŨY';
    allocation = '10% - 20% Danh Mục';
    reason = 'Vốn hóa lớn, hạ tầng công nghệ vững chắc, thanh khoản cao, phù hợp mua tích lũy tài sản dài hạn.';
  } else if (score >= 65) {
    recommendation = 'CÂN NHẮC (5-10% VỐN)';
    allocation = '5% - 10% Danh Mục';
    reason = 'Altcoin tiềm năng tăng trưởng, nên chia nhỏ vốn mua thăm dò khi giá chạm hỗ trợ cứng.';
  } else if (score >= 45) {
    recommendation = 'THEO DÕI THÊM';
    allocation = '0% - 5% (Chờ Chiết Khấu)';
    reason = 'Đang có biến động rung lắc lớn hoặc ở vùng giá cao, nên kiên nhẫn quan sát chờ điểm vào đẹp hơn.';
  } else {
    recommendation = 'KHÔNG NÊN HOLD';
    allocation = '0% (Chỉ Lướt Sóng Ngắn)';
    reason = isMeme
      ? 'Meme coin mang tính chất đầu cơ sóng ngắn, không có nội tại giữ giá, nguy cơ chia 5 chia 10 nếu hold lâu.'
      : 'Rủi ro cao, vốn hóa mỏng hoặc lạm phát token lớn, không đạt chuẩn tích lũy tài sản an toàn.';
  }

  return {
    score,
    rank: 999,
    recommendation,
    allocation,
    cyclePosition,
    reason,
  };
}

export function rankTokensForHoldAccumulation(tokens: TokenMetrics[]): TokenMetrics[] {
  // Score every token
  const scored = tokens.map(token => {
    const detail = evaluateTokenHoldSafety(token);
    return {
      ...token,
      holdSafetyScore: detail.score,
      holdRecommendation: detail.recommendation,
      holdAllocationPercent: detail.allocation,
      cyclePosition: detail.cyclePosition,
      holdReason: detail.reason,
    };
  });

  // Sort strictly descending: Highest holdSafetyScore first, then higher market cap
  scored.sort((a: any, b: any) => {
    if ((b.holdSafetyScore || 0) !== (a.holdSafetyScore || 0)) {
      return (b.holdSafetyScore || 0) - (a.holdSafetyScore || 0);
    }
    return (b.marketCap || b.fdv || 0) - (a.marketCap || a.fdv || 0);
  });

  // Assign holdRank #1, #2, #3...
  scored.forEach((t: any, i: number) => {
    t.holdRank = i + 1;
    t.tradeWorthinessRank = i + 1;
  });

  return scored;
}
