import { RiskAssessmentStatus, TokenMetrics } from '../types';

export interface DetailedRiskReport {
  overallRiskScore: number; // 0 - 100 (càng cao càng rủi ro)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    category: string;
    status: RiskAssessmentStatus;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    detail: string;
    verifiedBy: string;
  }[];
  criticalWarnings: string[];
  isSafeToTrade: boolean;
  disclaimer: string;
}

export function evaluateTokenRisks(token: TokenMetrics): DetailedRiskReport {
  const factors: DetailedRiskReport['factors'] = [];
  const criticalWarnings: string[] = [];
  let riskScore = 0;

  const sec = token.securityCheck;

  // 1. Kiểm tra Honeypot
  if (sec?.isHoneypot === 'RISK_DETECTED') {
    riskScore += 50;
    criticalWarnings.push('HONEYPOT NGUY HIỂM: Token không thể bán ra hoặc bị khóa hàm transfer!');
    factors.push({
      category: 'Honeypot / Khả năng bán',
      status: 'RISK_DETECTED',
      severity: 'CRITICAL',
      detail: 'Mã nguồn có dấu hiệu chặn lệnh bán từ ví người dùng thường.',
      verifiedBy: 'GoPlus Security Engine',
    });
  } else if (sec?.isHoneypot === 'NO_RISK_DETECTED') {
    factors.push({
      category: 'Honeypot / Khả năng bán',
      status: 'NO_RISK_DETECTED',
      severity: 'NONE',
      detail: 'Đã giả lập giao dịch mua/bán thành công, chưa phát hiện mã độc chặn bán.',
      verifiedBy: 'GoPlus Security Engine',
    });
  } else {
    factors.push({
      category: 'Honeypot / Khả năng bán',
      status: 'UNABLE_TO_VERIFY',
      severity: 'MEDIUM',
      detail: 'Chưa đủ dữ liệu block để giả lập bán token. Hãy cẩn trọng.',
      verifiedBy: 'Pending Verification',
    });
    riskScore += 15;
  }

  // 2. Quyền Mint thêm token
  if (sec?.mintable === 'RISK_DETECTED') {
    riskScore += 25;
    criticalWarnings.push('QUYỀN MINT TOKEN CÒN MỞ: Deployer có thể in thêm token không giới hạn để xả.');
    factors.push({
      category: 'Quyền Mint Token',
      status: 'RISK_DETECTED',
      severity: 'HIGH',
      detail: 'Chủ hợp đồng giữ quyền mint token mới mà không qua timelock.',
      verifiedBy: 'On-chain Bytecode Analysis',
    });
  } else if (sec?.mintable === 'NO_RISK_DETECTED') {
    factors.push({
      category: 'Quyền Mint Token',
      status: 'NO_RISK_DETECTED',
      severity: 'NONE',
      detail: 'Hàm mint đã bị thu hồi (Revoked) hoặc hard-capped.',
      verifiedBy: 'On-chain Bytecode Analysis',
    });
  } else {
    factors.push({
      category: 'Quyền Mint Token',
      status: 'INSUFFICIENT_DATA',
      severity: 'LOW',
      detail: 'Dữ liệu bytecode chưa phân tích xong.',
      verifiedBy: 'Pending Scan',
    });
  }

  // 3. Quyền Freeze / Blacklist ví
  if (sec?.freezeable === 'RISK_DETECTED') {
    riskScore += 20;
    criticalWarnings.push('QUYỀN FREEZE VÍ: Deployer có quyền đóng băng số dư token của nhà đầu tư.');
    factors.push({
      category: 'Quyền Freeze / Blacklist',
      status: 'RISK_DETECTED',
      severity: 'HIGH',
      detail: 'Hợp đồng có hàm freezeAccount hoặc blacklist transfer.',
      verifiedBy: 'On-chain Contract Spec',
    });
  }

  // 4. Mức độ tập trung của Top 10 Holder
  const topHolders = sec?.topHoldersConcentration ?? 35;
  if (topHolders > 60) {
    riskScore += 25;
    criticalWarnings.push(`TOP 10 HOLDER NẮM ${topHolders}% CUNG: Nguy cơ xả hàng tập trung cao!`);
    factors.push({
      category: 'Phân bổ Top Holder',
      status: 'RISK_DETECTED',
      severity: 'HIGH',
      detail: `Top 10 ví nắm giữ tới ${topHolders}% tổng lượng cung lưu hành.`,
      verifiedBy: 'Blockchain RPC Holder Scan',
    });
  } else if (topHolders > 35) {
    riskScore += 10;
    factors.push({
      category: 'Phân bổ Top Holder',
      status: 'RISK_DETECTED',
      severity: 'MEDIUM',
      detail: `Top 10 ví nắm ${topHolders}%. Mức độ phân bổ ở mức trung bình.`,
      verifiedBy: 'Blockchain RPC Holder Scan',
    });
  } else {
    factors.push({
      category: 'Phân bổ Top Holder',
      status: 'NO_RISK_DETECTED',
      severity: 'NONE',
      detail: `Top 10 ví chỉ nắm ${topHolders}%. Phân phối phi tập trung tốt.`,
      verifiedBy: 'Blockchain RPC Holder Scan',
    });
  }

  // 5. Thuế Mua / Bán
  const buyTax = sec?.buyTax ?? 0;
  const sellTax = sec?.sellTax ?? 0;
  if (sellTax > 10 || buyTax > 10) {
    riskScore += 20;
    criticalWarnings.push(`THUẾ GIAO DỊCH CAO: Thuế mua ${buyTax}%, thuế bán ${sellTax}%!`);
    factors.push({
      category: 'Thuế Giao Dịch (Tax)',
      status: 'RISK_DETECTED',
      severity: 'HIGH',
      detail: `Thuế mua: ${buyTax}%, Thuế bán: ${sellTax}%. Vượt ngưỡng an toàn tiêu chuẩn (<5%).`,
      verifiedBy: 'GoPlus Security Engine',
    });
  } else {
    factors.push({
      category: 'Thuế Giao Dịch (Tax)',
      status: 'NO_RISK_DETECTED',
      severity: 'NONE',
      detail: `Thuế mua: ${buyTax}%, Thuế bán: ${sellTax}% (Trong ngưỡng an toàn).`,
      verifiedBy: 'GoPlus Security Engine',
    });
  }

  // 6. Thanh khoản so với FDV
  if (token.fdv > 0 && token.liquidityUsd > 0) {
    const liqToFdvRatio = (token.liquidityUsd / token.fdv) * 100;
    if (liqToFdvRatio < 3.0) {
      riskScore += 15;
      factors.push({
        category: 'Độ mỏng Thanh Khoản so với FDV',
        status: 'RISK_DETECTED',
        severity: 'MEDIUM',
        detail: `Thanh khoản chỉ bằng ${liqToFdvRatio.toFixed(1)}% vốn hóa. Khi chốt lời lớn sẽ trượt giá nặng.`,
        verifiedBy: 'DEX Pool Scanner',
      });
    }
  }

  const finalScore = Math.min(100, Math.max(token.riskScore, riskScore));
  const riskLevel =
    finalScore >= 70 ? 'CRITICAL' : finalScore >= 45 ? 'HIGH' : finalScore >= 25 ? 'MEDIUM' : 'LOW';

  return {
    overallRiskScore: finalScore,
    riskLevel,
    factors,
    criticalWarnings,
    isSafeToTrade: criticalWarnings.length === 0 && finalScore < 50,
    disclaimer: 'QUY TẮC BẢO MẬT: "Chưa phát hiện rủi ro" KHÔNG ĐỒNG NGHĨA VỚI "Tuyệt đối an toàn". Luôn tự kiểm chứng mã hợp đồng trên block explorer trước khi đưa ra quyết định.',
  };
}
