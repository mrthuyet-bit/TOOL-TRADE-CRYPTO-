import { AlertSeverity, AlertType, SecurityAlert, TokenMetrics } from '../types';

export interface PositionTrackerInput {
  token: TokenMetrics;
  entryPrice: number;
  highestPriceSeen: number;
  trailingStopPercentage: number; // e.g. 15 (%)
}

export interface ExitSignalResult {
  hasSignal: boolean;
  alertType?: AlertType;
  severity?: AlertSeverity;
  headline: string;
  recommendedAction: string;
  rationale: string[];
  suggestedSellPercentage?: number; // e.g. 25%, 50%, 100%
  alertObject?: SecurityAlert;
}

export function evaluateExitStrategy(input: PositionTrackerInput): ExitSignalResult {
  const { token, entryPrice, highestPriceSeen, trailingStopPercentage } = input;
  const currentPrice = token.priceUsd;
  const rationale: string[] = [];

  // ==========================================
  // 1. EMERGENCY EXIT (Ưu tiên tối cao)
  // ==========================================
  if (token.securityCheck?.isHoneypot === 'RISK_DETECTED') {
    return {
      hasSignal: true,
      alertType: 'EMERGENCY_EXIT',
      severity: 'CRITICAL',
      headline: `🚨 THOÁT KHẨN CẤP: ${token.symbol} PHÁT HIỆN MÃ ĐỘC HONEYPOT!`,
      recommendedAction: 'Thoát vị thế 100% ngay lập tức nếu hàm swap còn khả dụng.',
      suggestedSellPercentage: 100,
      rationale: [
        'Hợp đồng vừa kích hoạt hàm khóa chuyển token hoặc thay đổi thuế bán 100%.',
        'Nguy cơ mất trắng toàn bộ vị thế nếu trì hoãn.',
      ],
      alertObject: {
        id: `exit-emerg-${token.id}-${Date.now()}`,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        chain: token.chain,
        contractAddress: token.contractAddress,
        alertType: 'EMERGENCY_EXIT',
        severity: 'CRITICAL',
        opportunityScore: token.opportunityScore,
        riskScore: 99,
        reason: 'Honeypot hoặc thanh khoản bị tấn công nghiêm trọng',
        evidence: [
          { metric: 'Honeypot Status', value: 'DETECTED', threshold: 'NONE' },
          { metric: 'Thanh khoản', value: `$${token.liquidityUsd.toLocaleString()}`, threshold: '>$50K' },
        ],
        timestamp: new Date().toISOString(),
        dataSource: 'GoPlus Security + Mempool Scanner',
        isVerified: true,
      },
    };
  }

  // ==========================================
  // 2. TRAILING STOP (Bảo vệ lợi nhuận từ đỉnh)
  // ==========================================
  if (highestPriceSeen > entryPrice) {
    const drawdownFromPeak = ((highestPriceSeen - currentPrice) / highestPriceSeen) * 100;
    if (drawdownFromPeak >= trailingStopPercentage) {
      rationale.push(`Giá đã giảm -${drawdownFromPeak.toFixed(1)}% từ đỉnh cao nhất ($${highestPriceSeen}).`);
      rationale.push(`Ngưỡng Trailing Stop cài đặt: -${trailingStopPercentage}%.`);
      rationale.push('Nguyên tắc: Không hạ ngưỡng bảo vệ khi giá đang suy yếu.');

      return {
        hasSignal: true,
        alertType: 'TRAILING_STOP',
        severity: 'HIGH',
        headline: `🛑 KÍCH HOẠT TRAILING STOP: ${token.symbol} GIẢM -${drawdownFromPeak.toFixed(1)}% TỪ ĐỈNH`,
        recommendedAction: 'Đóng 75% - 100% vị thế để bảo toàn thành quả lợi nhuận đã đạt.',
        suggestedSellPercentage: 75,
        rationale,
        alertObject: {
          id: `exit-ts-${token.id}-${Date.now()}`,
          tokenSymbol: token.symbol,
          tokenName: token.name,
          chain: token.chain,
          contractAddress: token.contractAddress,
          alertType: 'TRAILING_STOP',
          severity: 'HIGH',
          opportunityScore: token.opportunityScore,
          riskScore: token.riskScore,
          reason: `Giá sụt giảm vượt ngưỡng Trailing Stop (-${drawdownFromPeak.toFixed(1)}%)`,
          evidence: [
            { metric: 'Đỉnh cao nhất', value: `$${highestPriceSeen}`, threshold: 'Peak' },
            { metric: 'Giá hiện tại', value: `$${currentPrice}`, threshold: `-${trailingStopPercentage}%` },
          ],
          timestamp: new Date().toISOString(),
          dataSource: 'Price Engine Realtime Tick',
          isVerified: true,
        },
      };
    }
  }

  // ==========================================
  // 3. SELL PRESSURE (Áp lực xả từ ví lớn / cạn kiệt lực mua)
  // ==========================================
  if (token.sellers24h > token.buyers24h * 1.5 && token.change5m < -5) {
    rationale.push(`Số người bán gấp ${(token.sellers24h / token.buyers24h).toFixed(1)}x số người mua.`);
    rationale.push(`Giá sụt giảm nhanh trong 5 phút qua (${token.change5m}%).`);
    rationale.push('Dấu hiệu phân phối token từ các ví lớn sang thanh khoản.');

    return {
      hasSignal: true,
      alertType: 'SELL_PRESSURE',
      severity: 'HIGH',
      headline: `⚠️ ÁP LỰC BÁN TĂNG MẠNH: ${token.symbol} BỊ XẢ LIÊN TỤC`,
      recommendedAction: 'Cân nhắc giảm 50% khối lượng nắm giữ hoặc nâng chặt Trailing Stop.',
      suggestedSellPercentage: 50,
      rationale,
      alertObject: {
        id: `exit-sp-${token.id}-${Date.now()}`,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        chain: token.chain,
        contractAddress: token.contractAddress,
        alertType: 'SELL_PRESSURE',
        severity: 'HIGH',
        opportunityScore: token.opportunityScore,
        riskScore: 65,
        reason: 'Áp lực bán áp đảo, ví lớn phân phối hàng',
        evidence: [
          { metric: 'Buyers vs Sellers', value: `${token.buyers24h} vs ${token.sellers24h}`, threshold: '1:1.5' },
          { metric: '5m Price Change', value: `${token.change5m}%`, threshold: '< -5%' },
        ],
        timestamp: new Date().toISOString(),
        dataSource: 'DEX Screener Swap Stream',
        isVerified: true,
      },
    };
  }

  // ==========================================
  // 4. TAKE PROFIT (Chốt lời từng phần theo mốc)
  // ==========================================
  if (entryPrice > 0) {
    const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
    if (pnlPercent >= 200) {
      return {
        hasSignal: true,
        alertType: 'TAKE_PROFIT',
        severity: 'MEDIUM',
        headline: `🎯 MỤC TIÊU LỢI NHUẬN TP3 (+200%): ${token.symbol} ĐẠT X3 VỐN!`,
        recommendedAction: 'Chốt lời thêm 25% - 50% vị thế, giữ lại phần gốc "Free Ride".',
        suggestedSellPercentage: 50,
        rationale: [
          `Lợi nhuận vị thế hiện tại: +${pnlPercent.toFixed(1)}%.`,
          'Chiến lược chốt lời bậc thang giúp khóa lợi nhuận tiền mặt an toàn.',
        ],
      };
    } else if (pnlPercent >= 100) {
      return {
        hasSignal: true,
        alertType: 'TAKE_PROFIT',
        severity: 'MEDIUM',
        headline: `🎯 MỤC TIÊU LỢI NHUẬN TP2 (+100%): ${token.symbol} NHÂN ĐÔI TÀI KHOẢN!`,
        recommendedAction: 'Rút toàn bộ gốc đầu tư ban đầu (50% vị thế), gồng lãi phần còn lại.',
        suggestedSellPercentage: 50,
        rationale: [
          `Lợi nhuận vị thế hiện tại: +${pnlPercent.toFixed(1)}%.`,
          'Thu hồi vốn gốc giúp tâm lý giao dịch vững vàng tuyệt đối.',
        ],
      };
    } else if (pnlPercent >= 50) {
      return {
        hasSignal: true,
        alertType: 'TAKE_PROFIT',
        severity: 'LOW',
        headline: `🎯 MỤC TIÊU LỢI NHUẬN TP1 (+50%): ${token.symbol} TĂNG TRƯỞNG MẠNH!`,
        recommendedAction: 'Cân nhắc chốt lời 20% - 25% vị thế đầu tiên.',
        suggestedSellPercentage: 25,
        rationale: [`Vị thế đang có lãi +${pnlPercent.toFixed(1)}%.`],
      };
    }
  }

  return {
    hasSignal: false,
    headline: 'Vị thế ổn định, chưa có tín hiệu thoát.',
    recommendedAction: 'Tiếp tục theo dõi theo kế hoạch quản lý vốn.',
    rationale: ['Không phát hiện sự kiện bất thường về bảo mật hoặc áp lực bán.'],
  };
}
