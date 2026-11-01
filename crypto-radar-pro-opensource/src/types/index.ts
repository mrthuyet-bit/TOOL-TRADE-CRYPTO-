/**
 * AI MEME COIN RADAR - CORE TYPE DEFINITIONS
 * Thiết kế theo nguyên tắc Module độc lập, có thể kiểm chứng và bảo đảm an toàn.
 */

export type BlockchainType = 'Solana' | 'Ethereum' | 'BNB Chain' | 'Base' | 'Arbitrum';

export type DataFreshnessStatus = 'LIVE' | 'VERIFIED' | 'STALE' | 'RATE_LIMITED' | 'ERROR';

export type AlertType = 
  | 'BUY_OPPORTUNITY' 
  | 'TAKE_PROFIT' 
  | 'TRAILING_STOP' 
  | 'SELL_PRESSURE' 
  | 'EMERGENCY_EXIT' 
  | 'RISK_WARNING';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RiskAssessmentStatus = 
  | 'RISK_DETECTED'        // Đã phát hiện rủi ro
  | 'NO_RISK_DETECTED'     // Chưa phát hiện rủi ro
  | 'UNABLE_TO_VERIFY'     // Chưa thể kiểm tra
  | 'INSUFFICIENT_DATA';   // Dữ liệu không đầy đủ

export interface TokenMetrics {
  id: string;
  name: string;
  symbol: string;
  chain: BlockchainType;
  contractAddress: string;
  priceUsd: number;
  change5m: number;
  change15m: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  liquidityUsd: number;
  buyers24h: number;
  sellers24h: number;
  buyVolumeRatio: number; // Tỷ lệ volume mua / tổng volume
  fdv: number;
  marketCap?: number;
  holdersCount: number;
  opportunityScore: number; // 0 - 100
  riskScore: number;        // 0 - 100
  tradeWorthinessRank?: number; // Thứ hạng đáng giao dịch nhất #1, #2, #3...
  tradeRecommendation?: 'RẤT ĐÁNG GIAO DỊCH' | 'TIỀM NĂNG CAO' | 'ĐANG TÍCH LŨY' | 'THEO DÕI THÊM' | 'RỦI RO CAO';
  exchanges?: string[];     // Danh sách sàn CEX & DEX đang niêm yết
  exchangesCount?: number;
  isTier1Listed?: boolean;
  image?: string;
  signalStatus: 'STRONG_BUY' | 'ACCUMULATION' | 'MONITOR' | 'TAKE_PROFIT' | 'HIGH_RISK';
  dataSource: string;       // e.g. 'CoinGecko + DexScreener + GoPlus'
  lastUpdated: string;      // ISO String
  verificationStatus: DataFreshnessStatus;
  scoreBreakdown?: {
    moneyFlow: number;      // max 30
    socialAttention: number;// max 25
    liquidityDepth: number; // max 25
    priceMomentum: number;  // max 20
    reasons: string[];
  };
  securityCheck?: {
    isHoneypot: RiskAssessmentStatus;
    mintable: RiskAssessmentStatus;
    freezeable: RiskAssessmentStatus;
    topHoldersConcentration: number; // %
    buyTax: number;
    sellTax: number;
    liquidityBurnedOrLocked: boolean;
    contractStatus: RiskAssessmentStatus;
    summary: string;
  };
}

export interface SecurityAlert {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  chain: BlockchainType;
  contractAddress: string;
  alertType: AlertType;
  severity: AlertSeverity;
  opportunityScore: number;
  riskScore: number;
  reason: string;
  evidence: {
    metric: string;
    value: string;
    threshold: string;
  }[];
  timestamp: string;
  dataSource: string;
  isVerified: boolean;
  cooldownActive?: boolean;
}

export interface PublicWalletPosition {
  id: string;
  walletAddress: string;
  walletLabel: string;
  chain: BlockchainType;
  tokenSymbol: string;
  tokenAddress: string;
  balance: number;
  estimatedBuyPrice: number;
  currentPrice: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPercent: number;
  entryDate: string;
  lastActivity: string;
  activityType: 'BUY' | 'SELL' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  isEstimate: boolean;
}

export interface BacktestRecord {
  id: string;
  strategyName: string;
  chain: BlockchainType;
  testedTokensCount: number;
  totalAlertsTriggered: number;
  profitableAlertsRate: number;
  falsePositiveRate: number;
  avgLatencyMs: number;
  maxDrawdownPercent: number;
  samplePeriod: string;
  estimatedSlippage: number;
}
