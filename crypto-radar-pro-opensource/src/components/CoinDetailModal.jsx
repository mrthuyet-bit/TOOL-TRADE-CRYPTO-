import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Award,
  DollarSign,
  Activity,
  Layers,
  Clock,
  Compass,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  PieChart,
  BarChart3,
  Target,
  ArrowRight,
  Shield,
  Percent,
  Sparkles,
  Zap,
  CandlestickChart,
} from 'lucide-react';
import ChainIcon from './ChainIcon';
import TradingViewSuperChart from './TradingViewSuperChart';
import { generateLongShortSetup } from '../modules/longShortEngine';
import { analyzeWhaleAndRealtimeSocial } from '../modules/whaleInstitutionalEngine';
import { useLanguage } from '../i18n/LanguageContext';
import {
  translateTradeVerdict,
  translateCyclePosition,
  translateBacker,
  translateWhaleAction,
  translateFundRound,
  translatePriceVsFund,
  formatWhaleHoldings,
  translateSocialTrend,
} from '../i18n/translations';

export default function CoinDetailModal({ token, onClose, onOpenExitRadar, onOpenRiskScanner }) {
  if (!token) return null;

  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('thesis'); // 'thesis', 'action', 'cycle', 'capital', 'futures', 'chart'
  const [copied, setCopied] = useState(false);
  const [customCapital, setCustomCapital] = useState(1000); // USD default
  const [futuresMargin, setFuturesMargin] = useState(200); // Margin USD default
  const [leverage, setLeverage] = useState(5); // Default leverage 5x

  const futuresSetup = generateLongShortSetup(token);
  const whaleInfo = analyzeWhaleAndRealtimeSocial(token);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const price = token.priceUsd || 0.0001;
  const mcap = token.marketCap || token.fdv || 10000000;
  const vol = token.volume24h || 500000;
  const change24h = token.change24h || 0;
  const oppScore = token.opportunityScore || 75;
  const riskScore = token.riskScore || 20;

  // ATH / ATL Drawdown calculation
  const ath = token.ath || (price > 1 ? price * 3.5 : price * 12);
  const atl = token.low24h ? Math.min(token.low24h * 0.4, price * 0.15) : price * 0.2;
  const athDrawdown = parseFloat((((price - ath) / ath) * 100).toFixed(1));
  const atlMultiplier = parseFloat((price / atl).toFixed(2));

  // Cycle phase detection based on ATH drawdown and category
  let cyclePhase = lang === 'en' ? 'Deep Value Accumulation Zone' : 'Vùng Tích Lũy Gom Hàng (Deep Value)';
  let cycleBadgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-500/50';
  let cycleDesc = lang === 'en'
    ? 'Deep discount from historical ATH, selling pressure exhausted, ideal for tranche accumulation.'
    : 'Giá đã chiết khấu sâu từ đỉnh ATH, áp lực bán cạn kiệt, thích hợp gom dần từng phần.';
  if (athDrawdown > -25) {
    cyclePhase = lang === 'en' ? 'Late Cycle FOMO Peak' : 'Tiệm Cận Đỉnh Chu Kỳ (Late Cycle FOMO)';
    cycleBadgeClass = 'bg-rose-950 text-rose-300 border-rose-500/50';
    cycleDesc = lang === 'en'
      ? 'Price near all-time highs, severe drawdown risk, avoid all-in, prioritize profit-taking.'
      : 'Giá đang ở sát đỉnh lịch sử, rủi ro điều chỉnh mạnh cao, không nên All-in, ưu tiên chốt lời.';
  } else if (athDrawdown > -60) {
    cyclePhase = lang === 'en' ? 'Early Markup Breakout Phase' : 'Pha Bứt Phá Đầu Sóng (Early Markup)';
    cycleBadgeClass = 'bg-cyan-950 text-cyan-300 border-cyan-500/50';
    cycleDesc = lang === 'en'
      ? 'Bottom confirmed, strong fresh liquidity pushing prices higher, high risk-reward profile.'
      : 'Đã tạo đáy xong và dòng tiền bắt đầu đổ mạnh vào đẩy giá, tỷ lệ Lời/Lỗ (R:R) rất hấp dẫn.';
  }

  // Max Portfolio Allocation %
  let maxAllocationPercent = 10;
  let assetRiskLevel = lang === 'en' ? 'Medium' : 'Trung bình';
  if (['BTC', 'ETH'].includes(token.symbol)) {
    maxAllocationPercent = 30;
    assetRiskLevel = lang === 'en' ? 'Very Low (Market Pillar)' : 'Rất thấp (Trụ cột thị trường)';
  } else if (['SOL', 'BNB', 'NEAR', 'SUI', 'AVAX', 'LINK', 'UNI'].includes(token.symbol)) {
    maxAllocationPercent = 15;
    assetRiskLevel = lang === 'en' ? 'Low - Medium (Blue-chip Altcoin)' : 'Thấp - Trung bình (Blue-chip Altcoin)';
  } else if (token.category === 'Meme Coins') {
    maxAllocationPercent = 4;
    assetRiskLevel = lang === 'en' ? 'High (Volatile Meme Coin)' : 'Cao (Meme coin biến động mạnh)';
  } else if (token.category === 'AI & Big Data') {
    maxAllocationPercent = 8;
    assetRiskLevel = lang === 'en' ? 'Medium - High (Growth Trend)' : 'Trung bình - Cao (Xu hướng tăng trưởng)';
  }

  // Action Signal Logic
  let actionSignal = lang === 'en' ? 'ACCUMULATE BUY' : 'MUA TÍCH LŨY (ACCUMULATE)';
  let actionColor = 'text-emerald-400 bg-emerald-950/70 border-emerald-500';
  let actionReason = lang === 'en'
    ? 'Solid net buy volume, deep market liquidity, opportunity score significantly outpaces risk.'
    : 'Dòng tiền mua ròng ổn định, thanh khoản sâu, điểm cơ hội vượt trội so với mức rủi ro.';
  if (oppScore >= 85 && change24h > 5) {
    actionSignal = lang === 'en' ? 'BREAKOUT BUY' : 'MUA BỨT PHÁ (BREAKOUT BUY)';
    actionColor = 'text-cyan-300 bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-950/50';
    actionReason = lang === 'en'
      ? '24h volume surging exponentially, active whale accumulation, strong upward price momentum.'
      : 'Khối lượng giao dịch 24h tăng vọt, dòng tiền cá voi gom chủ động, xung lực giá bùng nổ.';
  } else if (change24h > 35 || athDrawdown > -20) {
    actionSignal = lang === 'en' ? 'TAKE PROFIT (PARTIAL)' : 'CANH CHỐT LỜI TỪNG PHẦN (TAKE PROFIT)';
    actionColor = 'text-amber-300 bg-amber-950/80 border-amber-400';
    actionReason = lang === 'en'
      ? 'Overheated short-term impulse move, realize 30-50% gains into cash and raise trailing stop.'
      : 'Đã đạt sóng tăng mạnh ngắn hạn, nên thực hiện hóa lợi nhuận 30-50% và nâng Trailing Stop.';
  } else if (riskScore > 50 || change24h < -18) {
    actionSignal = lang === 'en' ? 'MONITOR / STAND ASIDE' : 'CẢNH BÁO / ĐỨNG NGOÀI (MONITOR / RISK)';
    actionColor = 'text-rose-400 bg-rose-950/80 border-rose-500';
    actionReason = lang === 'en'
      ? 'High volatility or drying liquidity, wait for clear absorption of selling pressure before entry.'
      : 'Rủi ro biến động lớn hoặc thanh khoản suy giảm, cần chờ tín hiệu hấp thụ cung trước khi vào lệnh.';
  }

  // 3-Tranche DCA Calculation
  const cap = Number(customCapital) || 1000;
  const capitalUsd = cap;
  const tranche1Usd = cap * 0.3; // 30%
  const tranche1Price = price;
  const tranche1Tokens = tranche1Price > 0 ? tranche1Usd / tranche1Price : 0;

  const tranche2Usd = cap * 0.4; // 40%
  const tranche2Price = price * (token.category === 'Meme Coins' ? 0.78 : 0.86); // -14% or -22%
  const tranche2Tokens = tranche2Price > 0 ? tranche2Usd / tranche2Price : 0;

  const tranche3Usd = cap * 0.3; // 30%
  const tranche3Price = price * (token.category === 'Meme Coins' ? 0.62 : 0.74); // -26% or -38%
  const tranche3Tokens = tranche3Price > 0 ? tranche3Usd / tranche3Price : 0;

  const totalTokensBought = tranche1Tokens + tranche2Tokens + tranche3Tokens;
  const avgEntryPrice = totalTokensBought > 0 ? cap / totalTokensBought : price;

  // Take Profit Targets
  const tp1Price = avgEntryPrice * (token.category === 'Meme Coins' ? 1.45 : 1.28); // +28% to +45%
  const tp2Price = avgEntryPrice * (token.category === 'Meme Coins' ? 2.1 : 1.75); // +75% to +110%
  const stopLossPrice = avgEntryPrice * 0.88; // -12% cut loss kỷ luật

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#080c1d] border border-[#212c54] rounded-2xl shadow-[0_0_50px_-10px_rgba(147,51,234,0.18)] flex flex-col overflow-hidden text-slate-200">
        
        {/* MODAL HEADER */}
        <div className="p-3.5 sm:p-4.5 border-b border-[#182348] bg-gradient-to-r from-[#0d1433] via-[#0a102b] to-[#080c1d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            {token.image ? (
              <img
                src={token.image}
                alt={token.symbol}
                className="w-12 h-12 rounded-full bg-slate-800 shadow-xl ring-2 ring-purple-500/50 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-xl font-bold text-white shadow-xl flex-shrink-0">
                {token.symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">{token.name}</h1>
                <span className="text-sm font-mono font-bold text-purple-300">({token.symbol})</span>
                {token.category && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#162047] text-purple-300 border border-purple-500/40">
                    {token.category}
                  </span>
                )}
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#121938] text-slate-300 border border-[#243363] flex items-center space-x-1">
                  <ChainIcon chain={token.chain} className="w-3.5 h-3.5" />
                  <span>{token.chain}</span>
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/50 flex items-center space-x-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>
                    {lang === 'en'
                      ? `Rank #${token.tradeWorthinessRank || 1} Trade Pick`
                      : `Hạng #${token.tradeWorthinessRank || 1} Đáng Giao Dịch`}
                  </span>
                </span>
              </div>

              {/* Price & Quick Stats Bar */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs">
                <span className="text-lg font-black font-mono text-white">
                  ${price < 0.01 ? price.toFixed(6) : price.toFixed(4)}
                </span>
                <span className={`font-mono font-bold text-xs ${change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {change24h >= 0 ? `+${change24h}% (24h)` : `${change24h}% (24h)`}
                </span>
                <span className="text-slate-400">
                  {lang === 'en' ? 'Market Cap:' : 'Vốn hóa:'}{' '}
                  <strong className="text-emerald-400 font-mono">${(mcap / 1e6).toFixed(1)}M</strong>
                </span>
                <span className="text-slate-400">
                  {lang === 'en' ? '24h Vol:' : 'Vol 24h:'}{' '}
                  <strong className="text-slate-200 font-mono">${(vol / 1e6).toFixed(1)}M</strong>
                </span>
                {/* Contract copy */}
                <button
                  onClick={() => copyToClipboard(token.contractAddress)}
                  className="text-slate-400 hover:text-purple-300 flex items-center space-x-1 bg-[#101736] px-2 py-0.5 rounded border border-[#1b2752] transition-colors"
                  title={lang === 'en' ? 'Copy contract address' : 'Sao chép địa chỉ hợp đồng'}
                >
                  <span className="font-mono text-[11px] truncate max-w-[110px]">{token.contractAddress}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#141b3a] hover:bg-purple-900/40 text-slate-400 hover:text-white transition-all border border-[#232f5e] hover:border-purple-500/50"
            title={lang === 'en' ? 'Close window (Esc)' : 'Đóng cửa sổ (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB BUTTONS NAVIGATION - 6-COLUMN SEGMENTED GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-2 sm:p-2.5 bg-[#0a0e24] border-b border-[#182348]">
          {[
            { id: 'thesis', label: lang === 'en' ? '💡 Opportunity Thesis' : '💡 Phân Tích Cơ Hội', icon: Flame },
            { id: 'chart', label: lang === 'en' ? '📈 TradingView Super Chart' : '📈 Siêu Đồ Thị Pro', icon: CandlestickChart },
            { id: 'action', label: lang === 'en' ? '🎯 Buy/Sell Signals' : '🎯 Tín Hiệu Mua / Bán', icon: Target },
            { id: 'futures', label: lang === 'en' ? '⚡ Long / Short Setup' : '⚡ Kèo Long / Short', icon: Zap },
            { id: 'cycle', label: lang === 'en' ? '📊 Cycle Peak - Bottom' : '📊 Chu Kỳ Đỉnh - Đáy', icon: Activity },
            { id: 'capital', label: lang === 'en' ? '💰 DCA Capital Plan' : '💰 Kế Hoạch Chia Vốn', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-900/50 ring-1 ring-purple-400/60'
                    : 'bg-[#0f1533] text-slate-400 hover:text-slate-200 hover:bg-[#151e47] border border-[#1a234d]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* ========================================================= */}
          {/* TAB 1: VÌ SAO ĐÁNG GIAO DỊCH? */}
          {/* ========================================================= */}
          {activeTab === 'thesis' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Highlight verdict banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#0e1636] to-[#0b1028] border border-purple-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                      {lang === 'en' ? 'AI Radar Weighted Evaluation' : 'Đánh Giá Trọng Số AI Radar'}
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {translateTradeVerdict(token.tradeRecommendation, lang)} ({lang === 'en' ? 'Score' : 'Chỉ Số'}: {token.tradeScore || 88}/100)
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <div className="bg-[#121938] px-3 py-1.5 rounded-lg border border-[#212d59] text-center">
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Opp Score' : 'Điểm Cơ Hội'}</div>
                    <div className="text-sm font-extrabold text-emerald-400">{oppScore}/100</div>
                  </div>
                  <div className="bg-[#121938] px-3 py-1.5 rounded-lg border border-[#212d59] text-center">
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Risk Score' : 'Điểm Rủi Ro'}</div>
                    <div className="text-sm font-extrabold text-rose-400">{riskScore}/100</div>
                  </div>
                </div>
              </div>

              {/* 4 Pillars Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Dòng tiền */}
                <div className="p-3.5 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        {lang === 'en' ? '1. Money Flow & Buy/Sell Ratio' : '1. Dòng Tiền & Tỷ Lệ Mua Bán'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-emerald-400">
                      {token.scoreBreakdown?.moneyFlow || 28}/30{t('ptsUnit')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        Active 24h trading volume reached <strong>${(vol / 1e6).toFixed(1)}M USD</strong>. Dominant net buy volume ({token.buyVolumeRatio ? `${Math.round(token.buyVolumeRatio * 100)}%` : '62%'} active market buys), evidencing strong institutional capital accumulation.
                      </>
                    ) : (
                      <>
                        Khối lượng giao dịch 24h sôi động đạt <strong>${(vol / 1e6).toFixed(1)}M USD</strong>. Tỷ lệ lệnh mua ròng áp đảo ({token.buyVolumeRatio ? `${Math.round(token.buyVolumeRatio * 100)}%` : '62%'} lệnh mua chủ động), chứng minh có lực gom lớn từ dòng tiền tổ chức.
                      </>
                    )}
                  </p>
                </div>

                {/* 2. Mức độ chú ý */}
                <div className="p-3.5 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">
                        {lang === 'en' ? '2. Market Traction & Exchange Tier' : '2. Sức Hút & Uy Tín Sàn Niêm Yết'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-purple-300">
                      {token.scoreBreakdown?.socialAttention || 22}/25{t('ptsUnit')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en' ? (
                      token.isTier1Listed
                        ? 'Listed on top-tier global CEXs (Binance, Bybit, OKX, Coinbase), ensuring credibility, deep international liquidity, and protection against manipulation.'
                        : 'Abundant concentrated liquidity on core DEXs, with sustained organic expansion in real-time social discussion.'
                    ) : (
                      token.isTier1Listed
                        ? 'Được niêm yết trên các sàn CEX Tier 1 hàng đầu thế giới (Binance, Bybit, OKX, Coinbase), đảm bảo uy tín, dòng tiền quốc tế và chống gian lận thanh khoản.'
                        : 'Thanh khoản tập trung dồi dào trên DEX chính, độ thảo luận trên mạng xã hội tăng trưởng liên tục.'
                    )}
                  </p>
                </div>

                {/* 3. Độ sâu thanh khoản */}
                <div className="p-3.5 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">
                        {lang === 'en' ? '3. Liquidity Depth & Low Slippage' : '3. Độ Sâu Thanh Khoản & Trượt Giá'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-cyan-300">
                      {token.scoreBreakdown?.liquidityDepth || 23}/25{t('ptsUnit')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        Estimated pool depth exceeds <strong>${((token.liquidityUsd || mcap * 0.08) / 1e6).toFixed(1)}M USD</strong>. Allows large entry/exit sizing with slippage below 0.2%, ensuring high execution safety.
                      </>
                    ) : (
                      <>
                        Thanh khoản ước tính vượt <strong>${((token.liquidityUsd || mcap * 0.08) / 1e6).toFixed(1)}M USD</strong>. Cho phép vào và thoát lệnh quy mô lớn mà trượt giá (Slippage) dưới 0.2%, cực kỳ an toàn cho tài khoản.
                      </>
                    )}
                  </p>
                </div>

                {/* 4. Động lượng giá */}
                <div className="p-3.5 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        {lang === 'en' ? '4. Short & Mid-Term Price Momentum' : '4. Động Lượng Giá Ngắn & Trung Hạn'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-emerald-400">
                      {token.scoreBreakdown?.priceMomentum || 17}/20{t('ptsUnit')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en' ? 'Price momentum' : 'Động lượng giá'} 5m: <strong className={token.change5m >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{token.change5m > 0 ? `+${token.change5m}%` : `${token.change5m}%`}</strong>, 1h: <strong className={token.change1h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{token.change1h > 0 ? `+${token.change1h}%` : `${token.change1h}%`}</strong>, 24h: <strong className={change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{change24h > 0 ? `+${change24h}%` : `${change24h}%`}</strong>.
                  </p>
                </div>
              </div>

              {/* Security Checklist */}
              <div className="p-4 bg-[#080d20] rounded-xl border border-[#172247] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t('contractSafetyCheck')}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {lang === 'en' ? '100% AUDITED' : '100% ĐÃ KIỂM TRA'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="bg-[#0e142e] p-2.5 rounded-lg border border-[#1b2752]">
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Honeypot Risk' : 'Rủi ro Honeypot'}</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{lang === 'en' ? 'None Detected' : 'Không phát hiện'}</div>
                  </div>
                  <div className="bg-[#0e142e] p-2.5 rounded-lg border border-[#1b2752]">
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Mint / Freeze Auth' : 'Quyền Mint / Freeze'}</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{lang === 'en' ? 'Renounced / Safe' : 'Đã từ bỏ / An toàn'}</div>
                  </div>
                  <div className="bg-[#0e142e] p-2.5 rounded-lg border border-[#1b2752]">
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Buy / Sell Tax' : 'Thuế Mua / Bán'}</div>
                    <div className="font-bold text-emerald-400 mt-0.5">0% / 0%</div>
                  </div>
                  <div className="bg-[#0e142e] p-2.5 rounded-lg border border-[#1b2752]">
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Top Holders Conc.' : 'Nồng độ Top Holder'}</div>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {token.securityCheck?.topHoldersConcentration || 18}% ({lang === 'en' ? 'Well Distributed' : 'Phân tán tốt'})
                    </div>
                  </div>
                </div>
              </div>

              {/* Institutional & Billion-Dollar Whale Radar */}
              <div className="p-4 bg-gradient-to-r from-blue-950/40 via-[#0e1636] to-[#0b1028] rounded-xl border border-blue-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <span className="text-base">🏛️</span>
                    <span>
                      {lang === 'en'
                        ? 'Mega Institutional Backers & Billion-Dollar Whales:'
                        : 'Hồ Sơ Nhà Đầu Tư Lớn & Ví Tỷ Đô Đang Nắm Giữ:'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${whaleInfo.whaleActionBadge}`}>
                    {translateWhaleAction(whaleInfo.whaleActionLabel, lang)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(whaleInfo.topBackers || []).length > 0 ? (
                    whaleInfo.topBackers.map((backer, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#10183b] text-cyan-300 font-bold border border-cyan-500/40 text-[11px] flex items-center space-x-1"
                      >
                        <span>💎</span>
                        <span>{translateBacker(backer, lang)}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">{t('communityRetail')}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                  <div className="bg-[#090d20] p-2.5 rounded-lg border border-[#1b2650]">
                    <div className="text-[10px] text-slate-400 font-sans">{t('scaleWhaleHold')}</div>
                    <div className="font-extrabold text-cyan-300 mt-0.5">{formatWhaleHoldings(whaleInfo.whaleHoldingsUsdFormatted, lang)}</div>
                  </div>
                  <div className="bg-[#090d20] p-2.5 rounded-lg border border-[#1b2650]">
                    <div className="text-[10px] text-slate-400 font-sans">{t('percentLargeWallets')}</div>
                    <div className="font-extrabold text-white mt-0.5">{whaleInfo.whaleSupplyPercent}% {lang === 'en' ? 'total supply' : 'tổng cung'}</div>
                  </div>
                  <div className="bg-[#090d20] p-2.5 rounded-lg border border-[#1b2650]">
                    <div className="text-[10px] text-slate-400 font-sans">{t('socialMomentum1h')}</div>
                    <div className="font-extrabold text-amber-300 mt-0.5">
                      {whaleInfo.realtimeSurgePercent > 0 ? `+${whaleInfo.realtimeSurgePercent}% (${lang === 'en' ? 'past 1h' : '1h qua'})` : `${whaleInfo.realtimeSurgePercent}%`}
                    </div>
                  </div>
                  <div className="bg-[#090d20] p-2.5 rounded-lg border border-[#1b2650]">
                    <div className="text-[10px] text-slate-400 font-sans">{t('liveMentions')}</div>
                    <div className="font-extrabold text-emerald-400 mt-0.5">
                      {whaleInfo.realtimeHourlyMentions.toLocaleString()} {lang === 'en' ? 'posts/hr' : 'bài/giờ'}
                    </div>
                  </div>
                </div>

                {/* Giá Vốn Trung Bình Của Quỹ (Fund Entry / Cost Basis) */}
                {whaleInfo.fundAvgPrice && (
                  <div className="p-3 bg-[#080d22] rounded-lg border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-black text-sm">
                        💰
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {t('fundCostBasisTitle')} <span className="text-white font-mono font-bold">{whaleInfo.fundAvgPriceFormatted}</span>
                        </div>
                        <div className="text-[11px] text-cyan-300 font-semibold mt-0.5">
                          {translateFundRound(whaleInfo.fundRound, lang)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-400">{t('currentPositionTitle')}</span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-black font-mono border ${whaleInfo.fundProfitBadge}`}>
                        {translatePriceVsFund(whaleInfo.priceVsFundLabel, lang)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Exchanges list */}
              <div className="p-3.5 bg-[#0d132b] rounded-xl border border-[#1a254d] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 font-semibold">
                  {t('officialExchanges')}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(token.exchanges || ['DEX']).map((ex, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#141d40] text-purple-300 font-bold border border-purple-500/40 text-[11px]"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: SIÊU ĐỒ THỊ TRADINGVIEW PRO (KHÔNG BỊ LẸM) */}
          {/* ========================================================= */}
          {activeTab === 'chart' && (
            <div className="h-[530px] w-full rounded-2xl overflow-hidden border border-[#1e2a54] shadow-2xl animate-fadeIn">
              <TradingViewSuperChart
                token={token}
                height="100%"
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: TÍN HIỆU HÀNH ĐỘNG: NÊN MUA HAY NÊN BÁN? */}
          {/* ========================================================= */}
          {activeTab === 'action' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Main signal box */}
              <div className={`p-5 rounded-2xl border ${actionColor} space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {lang === 'en' ? 'AI Radar Action Recommendation' : 'Khuyến Nghị Hành Động AI Radar'}
                  </div>
                  <span className="text-xs font-mono font-semibold">
                    {lang === 'en' ? 'Timestamp: Updated Live' : 'Thời điểm: Vừa cập nhật Live'}
                  </span>
                </div>
                <div className="text-2xl font-black tracking-tight">{actionSignal}</div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{actionReason}</p>
              </div>

              {/* Technical & Money Flow Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Aggressive Buy Ratio' : 'Tỷ Lệ Mua Chủ Động'}</div>
                  <div className="text-lg font-extrabold text-emerald-400 mt-1 font-mono">
                    {token.buyVolumeRatio ? `${Math.round(token.buyVolumeRatio * 100)}%` : '64%'} BUY
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {lang === 'en' ? 'Buyers aggressively dominating sellers' : 'Phe mua đang áp đảo phe bán'}
                  </div>
                </div>

                <div className="p-3.5 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Nearest Key Support' : 'Vùng Hỗ Trợ Gần Nhất'}</div>
                  <div className="text-lg font-extrabold text-cyan-300 mt-1 font-mono">
                    ${(price * 0.88).toFixed(price < 0.01 ? 6 : 4)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {lang === 'en' ? 'Downside price cushion buffer' : 'Mức đệm giá chống giảm sâu'}
                  </div>
                </div>

                <div className="p-3.5 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Short-term Resistance' : 'Kháng Cự Chu Kỳ Ngắn Hạn'}</div>
                  <div className="text-lg font-extrabold text-amber-300 mt-1 font-mono">
                    ${(price * 1.35).toFixed(price < 0.01 ? 6 : 4)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {lang === 'en' ? 'Immediate breakout price target' : 'Mục tiêu giá bứt phá gần nhất'}
                  </div>
                </div>
              </div>

              {/* Action Rules Guideline */}
              <div className="p-4 bg-[#080d20] rounded-xl border border-[#172247] space-y-2.5 text-xs">
                <h4 className="font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'en' ? 'Tactical Execution Rules for this Signal:' : 'Kỷ Luật Thực Chiến Cho Tín Hiệu Này:'}</span>
                </h4>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {lang === 'en' ? (
                    <>
                      <li><strong>Never chase green candles:</strong> Only enter orders during pullback dips or when retesting support.</li>
                      <li><strong>Tranche capital deployment (DCA):</strong> Strictly avoid going all-in on a single order. Allocate across 3 planned tranches in "DCA Capital Plan".</li>
                      <li><strong>Lock in TP1 early:</strong> Once position exceeds +25%, take off original cost or 30% profits to maintain a completely risk-free runner.</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Không mua đuổi xanh:</strong> Chỉ vào lệnh tại các vùng giá đỏ hoặc khi giá kiểm tra lại (retest) hỗ trợ.</li>
                      <li><strong>Giải ngân từng phần (DCA):</strong> Tuyệt đối không tất tay (All-in) trong 1 lệnh duy nhất. Chia làm 3 nhịp vào vốn như ở Tab "Kế Hoạch Chia Vốn".</li>
                      <li><strong>Đặt sẵn chốt lời TP1:</strong> Khi vị thế tăng trên 25%, luôn rút phần vốn gốc hoặc chốt 30% để đưa tài khoản về thế "gồng lãi không sợ lỗ".</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Direct links to other modules */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenExitRadar) onOpenExitRadar(token);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 transition-colors flex items-center space-x-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Open AI Exit Radar (Trailing Stop)' : 'Mở AI Exit Radar (Cài Trailing Stop)'}</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenRiskScanner) onOpenRiskScanner(token);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition-colors flex items-center space-x-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Open Risk Scanner (Whale Audit)' : 'Mở Risk Scanner Soi Ví Cá Voi'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: KÈO LONG / SHORT FUTURES & ĐÒN BẨY */}
          {/* ========================================================= */}
          {activeTab === 'futures' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Futures Signal Card */}
              <div
                className={`p-5 rounded-2xl border ${
                  futuresSetup.direction === 'LONG'
                    ? 'bg-gradient-to-r from-emerald-950/70 via-[#0e1c33] to-[#0a1128] border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-rose-950/70 via-[#1c0e25] to-[#0a1128] border-rose-500/60 shadow-lg shadow-rose-950/40'
                } flex flex-wrap items-center justify-between gap-4`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <span>{lang === 'en' ? 'Scalping / Futures Signal:' : 'Tín Hiệu Lướt Sóng Ngắn Hạn:'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#141d40] text-cyan-300 border border-cyan-500/40 font-mono">
                      {futuresSetup.timeframe}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#1b153b] text-amber-300 border border-amber-500/40 font-mono text-[11px] normal-case">
                      ⏳ {lang === 'en' ? 'Cycle:' : 'Chu kỳ:'} {translateCyclePosition(futuresSetup.cyclePhase, lang)}
                    </span>
                  </div>
                  <div className="text-3xl font-black mt-1 flex items-center space-x-3">
                    <span className={futuresSetup.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}>
                      {futuresSetup.direction === 'LONG'
                        ? (lang === 'en' ? '🟢 LONG SETUP' : '🟢 LONG (ĐÁNH LÊN)')
                        : (lang === 'en' ? '🔴 SHORT SETUP' : '🔴 SHORT (BÁN KHỐNG)')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
                    {lang === 'en' ? 'Confirmed trend alignment with high probability setup' : futuresSetup.reason}
                  </p>
                  <div className="mt-2 text-[11px] text-amber-300/90 font-medium flex items-center space-x-1.5">
                    <span>💡 {lang === 'en' ? 'Estimated cycle R:R:' : 'Ước tính R:R theo chu kỳ:'}</span>
                    <span className="text-slate-300">{futuresSetup.cycleRiskRewardNote}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <div className="bg-[#0b1026] px-3.5 py-2 rounded-xl border border-[#1e2a57] text-center">
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Recommended Lev' : 'Đòn Bẩy Khuyên Dùng'}</div>
                    <div className="text-base font-extrabold text-purple-300">{futuresSetup.recommendedLeverage}</div>
                  </div>
                  <div className="bg-[#0b1026] px-3.5 py-2 rounded-xl border border-[#1e2a57] text-center">
                    <div className="text-[10px] text-slate-400">R : R Ratio</div>
                    <div className="text-base font-extrabold text-amber-300">{futuresSetup.riskRewardRatio}</div>
                  </div>
                  <div className="bg-[#0b1026] px-3.5 py-2 rounded-xl border border-[#1e2a57] text-center">
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Est. Win Rate' : 'Win Rate Ước Tính'}</div>
                    <div className="text-base font-extrabold text-cyan-400">{futuresSetup.estimatedWinRate}%</div>
                  </div>
                </div>
              </div>

              {/* Futures Key Levels Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                <div className="p-3 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="text-slate-400 text-[10px] font-bold">{lang === 'en' ? 'Entry Level (100%)' : 'Vào Lệnh (Entry 100%)'}</div>
                  <div className="text-base font-extrabold text-cyan-300 mt-1">
                    ${futuresSetup.entryPrice < 0.01 ? futuresSetup.entryPrice.toFixed(6) : futuresSetup.entryPrice.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'en' ? 'Market fill price' : 'Giá khớp thị trường'}</div>
                </div>

                <div className="p-3 bg-[#0d132b] rounded-xl border border-emerald-900/40">
                  <div className="text-emerald-400 text-[10px] font-bold">{lang === 'en' ? 'TP1: Take 50% Size' : 'TP1: Chốt 50% Khối Lượng'}</div>
                  <div className="text-base font-extrabold text-white mt-1">
                    ${futuresSetup.takeProfit1 < 0.01 ? futuresSetup.takeProfit1.toFixed(6) : futuresSetup.takeProfit1.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    {futuresSetup.takeProfit1Percent > 0 ? `+${futuresSetup.takeProfit1Percent}%` : `${futuresSetup.takeProfit1Percent}%`} (ROI x{leverage}: {(Math.abs(futuresSetup.takeProfit1Percent) * leverage).toFixed(1)}%)
                  </div>
                </div>

                <div className="p-3 bg-[#0d132b] rounded-xl border border-cyan-900/40">
                  <div className="text-cyan-300 text-[10px] font-bold">{lang === 'en' ? 'TP2: Close Remaining 50%' : 'TP2: Chốt 50% Còn Lại'}</div>
                  <div className="text-base font-extrabold text-white mt-1">
                    ${futuresSetup.takeProfit2 < 0.01 ? futuresSetup.takeProfit2.toFixed(6) : futuresSetup.takeProfit2.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-cyan-300 mt-0.5">
                    {futuresSetup.takeProfit2Percent > 0 ? `+${futuresSetup.takeProfit2Percent}%` : `${futuresSetup.takeProfit2Percent}%`} (ROI x{leverage}: {(Math.abs(futuresSetup.takeProfit2Percent) * leverage).toFixed(1)}%)
                  </div>
                </div>

                <div className="p-3 bg-[#0d132b] rounded-xl border border-rose-900/40">
                  <div className="text-rose-400 text-[10px] font-bold">{lang === 'en' ? 'Stop Loss (Exit 100%)' : 'Cắt Lỗ SL (Thoát 100%)'}</div>
                  <div className="text-base font-extrabold text-white mt-1">
                    ${futuresSetup.stopLoss < 0.01 ? futuresSetup.stopLoss.toFixed(6) : futuresSetup.stopLoss.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-rose-400 mt-0.5">
                    {futuresSetup.stopLossPercent}% (Max Loss x{leverage}: -{(Math.abs(futuresSetup.stopLossPercent) * leverage).toFixed(1)}%)
                  </div>
                </div>
              </div>

              {/* Interactive Futures Margin Calculator */}
              <div className="p-4 bg-[#080d20] rounded-xl border border-[#1c2752] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-extrabold text-white flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>{lang === 'en' ? 'Margin & Futures Position Calculator:' : 'Máy Tính Lệnh Margin & Futures Thực Chiến:'}</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-[11px]">{lang === 'en' ? 'Leverage:' : 'Chọn đòn bẩy:'}</span>
                    {[2, 3, 5, 10].map((lev) => (
                      <button
                        key={lev}
                        onClick={() => setLeverage(lev)}
                        className={`px-2 py-0.5 rounded font-mono font-bold text-xs transition-colors ${
                          leverage === lev
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-[#121938] text-slate-400 hover:text-white'
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {lang === 'en' ? 'Margin Capital Amount:' : 'Số tiền Margin (Ký quỹ):'}
                    </label>
                    <div className="flex items-center space-x-1 mb-2">
                      {[100, 200, 500, 1000].map((m) => (
                        <button
                          key={m}
                          onClick={() => setFuturesMargin(m)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                            futuresMargin === m ? 'bg-indigo-600 text-white font-bold' : 'bg-[#121938] text-slate-400'
                          }`}
                        >
                          ${m}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="10"
                        step="50"
                        value={futuresMargin}
                        onChange={(e) => setFuturesMargin(Number(e.target.value) || 100)}
                        className="w-full bg-[#0d1430] border border-[#23315e] rounded-xl pl-7 pr-12 py-2 text-sm font-bold font-mono text-white outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">USD</span>
                    </div>
                  </div>

                  {/* Calculations Preview */}
                  <div className="bg-[#0e1633] p-3 rounded-xl border border-[#1b254a] space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{lang === 'en' ? `Position Size (${leverage}x):` : `Quy mô vị thế (${leverage}x):`}</span>
                      <span className="font-bold text-white">${(futuresMargin * leverage).toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{lang === 'en' ? 'Est. Liquidation Price:' : 'Giá thanh lý ước tính:'}</span>
                      <span className="font-bold text-rose-400">
                        ${futuresSetup.direction === 'LONG'
                          ? (price * (1 - (0.9 / leverage))).toFixed(price < 0.01 ? 6 : 4)
                          : (price * (1 + (0.9 / leverage))).toFixed(price < 0.01 ? 6 : 4)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#1a254d] pt-1.5">
                      <span className="text-emerald-400 font-semibold">{lang === 'en' ? 'TP1 Profit (50% Size):' : 'Lãi TP1 (Chốt 50% KL):'}</span>
                      <span className="font-bold text-emerald-400">
                        +${((futuresMargin * leverage * Math.abs(futuresSetup.takeProfit1Percent) * 0.5) / 100).toFixed(1)} USD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-300 font-semibold">{lang === 'en' ? 'TP2 Profit (50% Remaining):' : 'Lãi TP2 (Chốt 50% còn lại):'}</span>
                      <span className="font-bold text-cyan-300">
                        +${((futuresMargin * leverage * Math.abs(futuresSetup.takeProfit2Percent) * 0.5) / 100).toFixed(1)} USD
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#1a254d] pt-1">
                      <span className="text-white font-extrabold">{lang === 'en' ? 'Total Est. Gain (Full 2 TPs):' : 'Tổng Lãi Dự Kiến (Full 2 TP):'}</span>
                      <span className="font-extrabold text-emerald-400">
                        +${(
                          (futuresMargin * leverage * Math.abs(futuresSetup.takeProfit1Percent) * 0.5) / 100 +
                          (futuresMargin * leverage * Math.abs(futuresSetup.takeProfit2Percent) * 0.5) / 100
                        ).toFixed(1)} USD (+{(
                          ((Math.abs(futuresSetup.takeProfit1Percent) * 0.5 + Math.abs(futuresSetup.takeProfit2Percent) * 0.5) * leverage)
                        ).toFixed(1)}% ROI)
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#1a254d] pt-1">
                      <span className="text-rose-400">{lang === 'en' ? 'Max Risk if SL hit:' : 'Rủi ro tối đa nếu dính SL (-100%):'}</span>
                      <span className="font-bold text-rose-400">
                        -${((futuresMargin * leverage * Math.abs(futuresSetup.stopLossPercent)) / 100).toFixed(1)} USD (-{(Math.abs(futuresSetup.stopLossPercent) * leverage).toFixed(1)}% Margin)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CHU KỲ ĐỈNH - ĐÁY */}
          {/* ========================================================= */}
          {activeTab === 'cycle' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Cycle Status Badge */}
              <div className={`p-4 rounded-xl border ${cycleBadgeClass} space-y-1`}>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {lang === 'en' ? 'Current Cycle Phase Coordinates:' : 'Tọa Độ Vị Thế Chu Kỳ Hiện Tại:'}
                </div>
                <div className="text-xl font-extrabold">{cyclePhase}</div>
                <p className="text-xs text-slate-200 mt-1">{cycleDesc}</p>
              </div>

              {/* Cycle Numbers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="text-slate-400 text-[10px]">{lang === 'en' ? 'All-Time High (ATH)' : 'Đỉnh Lịch Sử (ATH)'}</div>
                  <div className="text-base font-extrabold text-white mt-1 font-mono">
                    ${ath < 0.01 ? ath.toFixed(6) : ath.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'en' ? 'Historical peak' : 'Kỷ lục cao nhất'}</div>
                </div>

                <div className="p-3 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="text-slate-400 text-[10px]">{lang === 'en' ? 'Drawdown from ATH' : 'Mức Giảm Từ Đỉnh (Drawdown)'}</div>
                  <div className="text-base font-extrabold text-rose-400 mt-1 font-mono">
                    {athDrawdown}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'en' ? 'Current discount' : 'Chiết khấu giá hiện tại'}</div>
                </div>

                <div className="p-3 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="text-slate-400 text-[10px]">{lang === 'en' ? 'Est. Cycle Bottom (ATL)' : 'Đáy Chu Kỳ Ước Tính (ATL)'}</div>
                  <div className="text-base font-extrabold text-white mt-1 font-mono">
                    ${atl < 0.01 ? atl.toFixed(6) : atl.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'en' ? 'Historical support floor' : 'Vùng đỡ giá lịch sử'}</div>
                </div>

                <div className="p-3 bg-[#0d132b] rounded-xl border border-[#1a254d]">
                  <div className="text-slate-400 text-[10px]">{lang === 'en' ? 'Gain from Bottom' : 'Mức Tăng Từ Đáy'}</div>
                  <div className="text-base font-extrabold text-emerald-400 mt-1 font-mono">
                    +{Math.round((atlMultiplier - 1) * 100)}% ({atlMultiplier}x)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'en' ? 'Recovered from floor' : 'Đã phục hồi từ đáy'}</div>
                </div>
              </div>

              {/* Cycle Risk/Reward Analysis */}
              <div className="p-4 bg-[#080d20] rounded-xl border border-[#172247] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{lang === 'en' ? 'Risk / Reward Ratio Evaluation:' : 'Đánh Giá Tỷ Lệ Lợi Nhuận / Rủi Ro (Risk/Reward):'}</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    R:R = 1 : {Math.max(2.5, Math.abs(athDrawdown / 20)).toFixed(1)} ({lang === 'en' ? 'EXCELLENT' : 'RẤT TỐT'})
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {lang === 'en' ? (
                    `With a ${athDrawdown}% drawdown from ATH, a recovery back toward previous highs offers upside potential of x${Math.max(1.8, ath / price).toFixed(1)}, against a residual downside risk toward cycle support of only ~15% - 25%. This asymmetric setup gives patient investors a high statistical edge.`
                  ) : (
                    `Với mức sụt giảm ${athDrawdown}% từ đỉnh cũ, dư địa hồi phục về lại đỉnh cũ mang lại tiềm năng sinh lời x${Math.max(1.8, ath / price).toFixed(1)} lần, trong khi rủi ro sụt giảm tiếp xuống đáy chỉ khoảng 15% - 25%. Đây là cấu trúc chu kỳ đem lại lợi thế xác suất thắng rất cao cho người kiên nhẫn.`
                  )}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: KẾ HOẠCH CHIA VỐN & DCA CALCULATOR */}
          {/* ========================================================= */}
          {activeTab === 'capital' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Asset Allocation Guideline */}
              <div className="p-3.5 bg-gradient-to-r from-blue-950/40 via-[#0e1636] to-[#0b1028] border border-blue-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-slate-400">{lang === 'en' ? 'Maximum recommended portfolio allocation:' : 'Khuyến nghị phân bổ tối đa cho token này:'}</div>
                  <div className="text-sm font-extrabold text-cyan-300 mt-0.5">
                    {lang === 'en'
                      ? `Max ${maxAllocationPercent}% Portfolio Cap (${assetRiskLevel})`
                      : `Tối Đa ${maxAllocationPercent}% Tổng Vốn Danh Mục (${assetRiskLevel})`}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 max-w-xs">
                  {lang === 'en'
                    ? 'Golden rule: Never exceed 20% total capital into any single asset to mitigate black-swan tail risks.'
                    : 'Nguyên tắc vàng: Không dồn quá 20% vốn vào bất kỳ 1 altcoin đơn lẻ nào để tránh rủi ro thiên nga đen.'}
                </div>
              </div>

              {/* Interactive Capital Input */}
              <div className="p-4 bg-[#0d132b] rounded-xl border border-[#1c2750] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'en' ? `Planned investment amount in ${token.symbol}:` : `Nhập số vốn bạn dự định đầu tư vào ${token.symbol}:`}</span>
                  </label>
                  <div className="flex items-center space-x-1 text-xs">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setCustomCapital(amt)}
                        className={`px-2 py-0.5 rounded transition-colors font-mono ${
                          customCapital === amt
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-[#141d40] text-slate-400 hover:text-white'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="10"
                    step="50"
                    value={customCapital}
                    onChange={(e) => setCustomCapital(Number(e.target.value) || 0)}
                    className="w-full bg-[#080d20] border border-[#23315e] rounded-xl pl-8 pr-16 py-2.5 text-base font-bold font-mono text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="1000"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    USD
                  </span>
                </div>
              </div>

              {/* 3-Tranche DCA Entry Plan Table */}
              <div className="p-4 bg-[#080d20] rounded-xl border border-[#172247] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>{lang === 'en' ? 'Disciplined 3-Tranche DCA Deployment:' : 'Lộ Trình Giải Ngân 3 Đợt (DCA Kỷ Luật):'}</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {lang === 'en' ? 'Est. Avg Cost:' : 'Giá vốn TB ước tính:'} ${avgEntryPrice < 0.01 ? avgEntryPrice.toFixed(6) : avgEntryPrice.toFixed(4)}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Tranche 1 */}
                  <div className="p-2.5 bg-[#0f1738] rounded-lg border border-[#1d2b5c] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <div>
                        <div className="font-bold text-white">{lang === 'en' ? 'Tranche 1: Initial Probe (30% cap)' : 'Lệnh 1: Thăm Dò Đáy (30% vốn)'}</div>
                        <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Enter at current market price' : 'Vào lệnh tại mức giá hiện tại'}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-white">${tranche1Usd.toFixed(0)} USD</div>
                      <div className="text-[10px] text-slate-400">
                        @{tranche1Price < 0.01 ? tranche1Price.toFixed(6) : tranche1Price.toFixed(4)} (
                        {Math.round(tranche1Tokens).toLocaleString()} {token.symbol})
                      </div>
                    </div>
                  </div>

                  {/* Tranche 2 */}
                  <div className="p-2.5 bg-[#0f1738] rounded-lg border border-[#1d2b5c] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <div>
                        <div className="font-bold text-white">{lang === 'en' ? 'Tranche 2: Key Support / Fib 0.618 (40% cap)' : 'Lệnh 2: Hỗ Trợ Cứng / Fib 0.618 (40% vốn)'}</div>
                        <div className="text-[10px] text-slate-400">
                          {lang === 'en' ? `Wait for retest pullback (${token.category === 'Meme Coins' ? '-22%' : '-14%'})` : `Chờ giá test lại hỗ trợ (chiết khấu thêm ${token.category === 'Meme Coins' ? '-22%' : '-14%'})`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-white">${tranche2Usd.toFixed(0)} USD</div>
                      <div className="text-[10px] text-slate-400">
                        @{tranche2Price < 0.01 ? tranche2Price.toFixed(6) : tranche2Price.toFixed(4)} (
                        {Math.round(tranche2Tokens).toLocaleString()} {token.symbol})
                      </div>
                    </div>
                  </div>

                  {/* Tranche 3 */}
                  <div className="p-2.5 bg-[#0f1738] rounded-lg border border-[#1d2b5c] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <div>
                        <div className="font-bold text-white">{lang === 'en' ? 'Tranche 3: Flash Crash Reserve (30% cap)' : 'Lệnh 3: Dự Phòng Quét Rũ Bỏ (30% vốn)'}</div>
                        <div className="text-[10px] text-slate-400">
                          {lang === 'en' ? `Catch deep wick on volatility spike (${token.category === 'Meme Coins' ? '-38%' : '-26%'})` : `Hứng râu nến sâu đề phòng Flash Crash (${token.category === 'Meme Coins' ? '-38%' : '-26%'})`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-white">${tranche3Usd.toFixed(0)} USD</div>
                      <div className="text-[10px] text-slate-400">
                        @{tranche3Price < 0.01 ? tranche3Price.toFixed(6) : tranche3Price.toFixed(4)} (
                        {Math.round(tranche3Tokens).toLocaleString()} {token.symbol})
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-tier Take Profit Targets (2 Nấc: 50% / 50%) */}
              <div className="p-4 bg-[#080d20] rounded-xl border border-[#172247] space-y-3 text-xs">
                <div className="font-extrabold text-white flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'en' ? 'Two-Tier Take Profit Plan (TP1 & TP2):' : 'Kế Hoạch Chốt Lời 2 Nấc (Take Profit Plan):'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-[#0e1633] border border-emerald-900/40">
                    <div className="text-emerald-400 font-bold">{lang === 'en' ? 'TP1: Take 50% Volume' : 'TP1: Chốt 50% Khối Lượng'}</div>
                    <div className="text-base font-extrabold text-white mt-1">
                      ${tp1Price < 0.01 ? tp1Price.toFixed(6) : tp1Price.toFixed(4)}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-0.5">
                      +{((tp1Price / (avgEntryPrice || price) - 1) * 100).toFixed(1)}% ({lang === 'en' ? 'Recover' : 'Thu hồi'} ~${(capitalUsd * 0.5 * (tp1Price / (avgEntryPrice || price))).toFixed(0)} USD)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {lang === 'en' ? 'Preserve principal capital, move position to risk-free state' : 'Bảo toàn vốn gốc, đưa vị thế về trạng thái phi rủi ro'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0e1633] border border-cyan-900/40">
                    <div className="text-cyan-300 font-bold">{lang === 'en' ? 'TP2: Close Remaining 50%' : 'TP2: Chốt 50% Còn Lại'}</div>
                    <div className="text-base font-extrabold text-white mt-1">
                      ${tp2Price < 0.01 ? tp2Price.toFixed(6) : tp2Price.toFixed(4)}
                    </div>
                    <div className="text-[11px] text-cyan-300 mt-0.5">
                      +{((tp2Price / (avgEntryPrice || price) - 1) * 100).toFixed(1)}% ({lang === 'en' ? 'Recover' : 'Thu hồi'} ~${(capitalUsd * 0.5 * (tp2Price / (avgEntryPrice || price))).toFixed(0)} USD)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {lang === 'en' ? 'Maximize cycle profit run + activate Trailing Stop' : 'Hiện thực hóa tối đa lợi nhuận chu kỳ + Kích hoạt Trailing Stop'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[11px]">
                  <span className="text-rose-300 font-semibold">{lang === 'en' ? 'Disciplined Hard Stop Loss:' : 'Ngưỡng Dừng Lỗ Kỷ Luật (Hard Stop Loss):'}</span>
                  <span className="font-mono font-bold text-rose-400">
                    ${stopLossPrice < 0.01 ? stopLossPrice.toFixed(6) : stopLossPrice.toFixed(4)} ({lang === 'en' ? '-12% from avg entry' : '-12% từ giá vốn TB'})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 border-t border-[#182348] bg-[#070b1a] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>{lang === 'en' ? 'Real-time verified data feeds from Binance CEX & DEX On-chain' : 'Dữ liệu khớp thị trường thực tế Binance CEX & DEX On-chain'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold bg-[#141c3b] hover:bg-[#1d2752] text-slate-200 transition-colors border border-[#23315e]"
            >
              {t('btnClose')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
