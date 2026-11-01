import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Download,
  Filter,
  Search,
  Award,
  Coins,
  Shield,
  Gem,
  Target,
  Zap,
  Rocket,
  Users,
  Radio
} from 'lucide-react';
import ChainIcon from '../components/ChainIcon';
import MiniChart from '../components/MiniChart';
import CoinDetailModal from '../components/CoinDetailModal';
import { getAdapter } from '../adapters';
import { analyzeWhaleAndRealtimeSocial } from '../modules/whaleInstitutionalEngine';
import { useLanguage } from '../i18n/LanguageContext';
import {
  translateTradeVerdict,
  translateCyclePosition,
  translateHoldRecommendation,
  translateHoldAllocation,
  translateBacker,
  translateWhaleAction,
  translateFundRound,
  translatePriceVsFund,
  formatWhaleHoldings,
  translateSocialTrend,
  translateViralLabel,
  translateWaveRating,
} from '../i18n/translations';

// Helper tính toán độ hot mạng xã hội và tiềm năng nhân vốn chu kỳ
function calculateViralAndMultiplier(token, lang = 'vi') {
  const mcap = token.marketCap || token.fdv || 10000000;
  const isMeme = token.category === 'Meme Coins';
  const isAI = token.category === 'AI & Big Data';
  const buyers = token.buyers24h || 1000;
  const change24h = token.change24h || 0;
  const rawSocial = token.scoreBreakdown?.socialAttention || 15;

  // Điểm Viral Buzz (0 - 100)
  let viralScore = rawSocial * 2.8;
  if (isMeme) viralScore += 22;
  if (isAI) viralScore += 14;
  if (change24h > 15) viralScore += 10;
  else if (change24h > 5) viralScore += 5;
  if (buyers > 50000) viralScore += 12;
  else if (buyers > 10000) viralScore += 7;
  viralScore = Math.min(99, Math.max(32, Math.round(viralScore)));

  // Ước tính tiềm năng nhân vốn (Multiplier) dựa trên vốn hóa và phân hệ
  let multiplierText = 'x2 - x3';
  let multiplierBadge = 'bg-slate-800 text-slate-300 border-slate-700';
  if (mcap < 50000000) {
    multiplierText = '🚀 x15 - x50';
    multiplierBadge = 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-500/60 shadow-sm shadow-fuchsia-950';
  } else if (mcap < 250000000) {
    multiplierText = '🔥 x8 - x20';
    multiplierBadge = 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-sm shadow-amber-950';
  } else if (mcap < 1500000000) {
    multiplierText = '⚡ x4 - x10';
    multiplierBadge = 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-950';
  } else if (mcap < 10000000000) {
    multiplierText = '✨ x2.5 - x5';
    multiplierBadge = 'bg-indigo-950 text-indigo-300 border-indigo-500/60';
  } else {
    multiplierText = '🛡️ x1.5 - x2.5';
    multiplierBadge = 'bg-emerald-950 text-emerald-300 border-emerald-500/60';
  }

  // Nhãn độ nóng mạng xã hội
  let viralLabel = '🔥 Thảo Luận Sôi Nổi';
  let viralBadge = 'bg-amber-950 text-amber-300 border-amber-500/50';
  if (viralScore >= 88) {
    viralLabel = '🔥🔥🔥 Viral Bùng Nổ';
    viralBadge = 'bg-rose-950 text-rose-300 border-rose-500/60 shadow-sm shadow-rose-950 animate-pulse';
  } else if (viralScore >= 75) {
    viralLabel = '🔥🔥 Top Thịnh Hành';
    viralBadge = 'bg-amber-950 text-amber-300 border-amber-500/50';
  } else if (viralScore >= 60) {
    viralLabel = '🔥 Quan Tâm Tăng Cao';
    viralBadge = 'bg-cyan-950 text-cyan-300 border-cyan-500/50';
  } else {
    viralLabel = '⚡ Chớm Có Sóng';
    viralBadge = 'bg-purple-950 text-purple-300 border-purple-500/50';
  }

  // Đánh giá sóng
  let waveRating = 'THEO DÕI SÓNG';
  if (viralScore >= 85 && (isMeme || isAI)) {
    waveRating = 'SĂN GEM MOONSHOT';
  } else if (change24h > 20) {
    waveRating = 'SÓNG FOMO MẠNH';
  } else if (buyers > 100000) {
    waveRating = 'DÒNG TIỀN ĐỔ VÀO';
  } else if (mcap < 100000000) {
    waveRating = 'GEM TIỀM NĂNG';
  }

  return {
    viralScore,
    multiplierText,
    multiplierBadge,
    viralLabel: translateViralLabel(viralLabel, lang),
    viralBadge,
    waveRating: translateWaveRating(waveRating, lang),
  };
}

export default function OverviewView({
  tokens,
  selectedToken,
  setSelectedToken,
  alerts,
  onOpenExitRadar,
  onOpenRiskScanner,
}) {
  const { lang, t } = useLanguage();
  const [modalToken, setModalToken] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);
  
  // 3 TAB BẢNG XẾP HẠNG CHÍNH:
  // 1. 'opportunity': Top Điểm Cơ Hội
  // 2. 'safe-hold': Hold & Tích Lũy An Toàn
  // 3. 'viral-moonshot': Hot MXH Real-Time & Săn Coin Ví Tỷ Đô Nắm Giữ
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState('opportunity');

  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterChain, setFilterChain] = useState('ALL');
  const [filterLimit, setFilterLimit] = useState(50);
  const [filterTier1, setFilterTier1] = useState(false);
  const [filterBillionWhale, setFilterBillionWhale] = useState(false);
  const [filterRealtimeSurge, setFilterRealtimeSurge] = useState(false);
  const [hideStable, setHideStable] = useState(true);
  const [tableSearch, setTableSearch] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'marketCap', 'volume24h', 'change24h', 'realtimeSurge', 'whaleHoldings'

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Tính toán chỉ số mở rộng & Lọc + Xếp hạng
  const rankedTokens = useMemo(() => {
    const enhanced = tokens.map((token) => {
      const v = calculateViralAndMultiplier(token, lang);
      const whaleSocial = analyzeWhaleAndRealtimeSocial(token);
      return {
        ...token,
        ...whaleSocial,
        viralScore: v.viralScore,
        multiplierText: v.multiplierText,
        multiplierBadge: v.multiplierBadge,
        viralLabel: v.viralLabel,
        viralBadge: v.viralBadge,
        waveRating: v.waveRating,
      };
    });

    return enhanced
      .filter((t) => {
        if (hideStable && t.category === 'Stablecoin') return false;
        if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
        if (filterBillionWhale && !t.hasBillionDollarBacker) return false;
        if (filterRealtimeSurge && !t.isRealtimeSpike) return false;

        const q = tableSearch.toLowerCase();
        const matchesSearch =
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q) ||
          t.chain.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          t.contractAddress.toLowerCase().includes(q) ||
          (t.topBackers && t.topBackers.some((b) => b.toLowerCase().includes(q))) ||
          (t.exchanges && t.exchanges.some((ex) => ex.toLowerCase().includes(q)));

        const matchesChain =
          filterChain === 'ALL' || t.chain.toLowerCase() === filterChain.toLowerCase();

        const matchesTier1 = !filterTier1 || t.isTier1Listed;

        return matchesSearch && matchesChain && matchesTier1;
      })
      .sort((a, b) => {
        // Sort theo tab tương ứng nếu chọn default
        if (sortBy === 'default') {
          if (activeLeaderboardTab === 'safe-hold') {
            return (a.holdRank || 999) - (b.holdRank || 999);
          }
          if (activeLeaderboardTab === 'viral-moonshot') {
            // Tab 3: Mặc định ưu tiên TỐC ĐỘ BÙNG NỔ MXH THỜI GIAN THỰC (1H GẦN NHẤT) & VÍ TỶ ĐÔ
            return (b.realtimeSurgePercent || 0) - (a.realtimeSurgePercent || 0);
          }
          // Tab opportunity
          return (b.opportunityScore || 0) - (a.opportunityScore || 0);
        }

        // Tùy chọn sắp xếp khác
        if (sortBy === 'realtimeSurge') return (b.realtimeSurgePercent || 0) - (a.realtimeSurgePercent || 0);
        if (sortBy === 'whaleHoldings') return (b.whaleHoldingsUsd || 0) - (a.whaleHoldingsUsd || 0);
        if (sortBy === 'opportunityScore') return (b.opportunityScore || 0) - (a.opportunityScore || 0);
        if (sortBy === 'holdRank') return (a.holdRank || 999) - (b.holdRank || 999);
        if (sortBy === 'viralScore') return (b.viralScore || 0) - (a.viralScore || 0);
        if (sortBy === 'marketCap') return (b.marketCap || b.fdv || 0) - (a.marketCap || a.fdv || 0);
        if (sortBy === 'volume24h') return (b.volume24h || 0) - (a.volume24h || 0);
        if (sortBy === 'change24h') return (b.change24h || 0) - (a.change24h || 0);
        if (sortBy === 'buyers24h') return (b.buyers24h || 0) - (a.buyers24h || 0);

        return 0;
      });
  }, [tokens, tableSearch, filterCategory, filterChain, filterTier1, filterBillionWhale, filterRealtimeSurge, hideStable, sortBy, activeLeaderboardTab]);

  const displayedTokens = rankedTokens.slice(0, filterLimit);

  // Quick stats
  const totalTokens = tokens.length;
  const topOppCount = tokens.filter((t) => t.opportunityScore >= 80).length || 24;
  const reserveCount = tokens.filter((t) => t.holdRecommendation === 'RẤT NÊN TÍCH LŨY').length || 2;
  const billionWhaleCount = tokens.filter((t) => {
    const w = analyzeWhaleAndRealtimeSocial(t);
    return w.hasBillionDollarBacker;
  }).length || 42;
  const tier1TotalCount = tokens.filter((t) => t.isTier1Listed).length;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Symbol',
      'Name',
      'Category',
      'Blockchain',
      'Market_Cap_USD',
      'Price_USD',
      'Change_24h_Percent',
      'Volume_24h_USD',
      'Opportunity_Score',
      'Hold_Safety_Score',
      'Viral_Score',
      'Tiem_Nang_X_Lan',
      'Khuyen_Nghi',
      'Contract_Address',
    ];

    const rows = rankedTokens.map((c, idx) => [
      idx + 1,
      c.symbol,
      `"${c.name}"`,
      `"${c.category || 'Layer 1'}"`,
      c.chain,
      c.marketCap || c.fdv || 0,
      c.priceUsd,
      c.change24h,
      c.volume24h,
      c.opportunityScore || 50,
      c.holdSafetyScore || 50,
      c.viralScore || 50,
      `"${c.multiplierText || 'x2'}"`,
      `"${c.holdRecommendation || c.tradeRecommendation || 'CÂN NHẮC'}"`,
      c.contractAddress,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_Xep_Hang_${activeLeaderboardTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. THẺ THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-3 shadow-lg">
          <div className="text-[11px] text-slate-400 font-medium">{t('statTotalAssets')}</div>
          <div className="text-xl font-extrabold text-white mt-0.5">{totalTokens} {lang === 'en' ? 'Tokens' : 'Token'}</div>
          <div className="text-[10px] text-cyan-400 mt-0.5 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
            <span>{t('statMcap10m')}</span>
          </div>
        </div>

        <div className="bg-[#0b1021]/80 border border-purple-500/40 rounded-xl p-3 shadow-lg bg-gradient-to-br from-purple-950/30 to-[#0b1021]">
          <div className="text-[11px] text-purple-300 font-bold flex items-center justify-between">
            <span>🎯 {lang === 'en' ? 'Top Opportunity' : 'Top Điểm Cơ Hội'}</span>
            <Target className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white mt-0.5">{topOppCount} {t('statGoldenOpp')}</div>
          <div className="text-[10px] text-purple-300 mt-0.5">{t('statMoneyFlowMomentum')}</div>
        </div>

        <div className="bg-[#0b1021]/80 border border-emerald-500/40 rounded-xl p-3 shadow-lg bg-gradient-to-br from-emerald-950/30 to-[#0b1021]">
          <div className="text-[11px] text-emerald-300 font-bold flex items-center justify-between">
            <span>🛡️ {t('tabSafeHold').replace('🛡️ ', '')}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white mt-0.5">{reserveCount} {t('statPillarsBluechip')}</div>
          <div className="text-[10px] text-emerald-300 mt-0.5">BTC, ETH, SOL, BNB, LINK...</div>
        </div>

        <div className="bg-[#0b1021]/80 border border-rose-500/40 rounded-xl p-3 shadow-lg bg-gradient-to-br from-rose-950/30 to-[#0b1021]">
          <div className="text-[11px] text-rose-300 font-bold flex items-center justify-between">
            <span>🔥 {t('tabViralMoonshot').replace('🔥 ', '')}</span>
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          </div>
          <div className="text-xl font-black text-white mt-0.5">{billionWhaleCount} {t('statWhaleBacked')}</div>
          <div className="text-[10px] text-rose-300 mt-0.5">BlackRock, a16z, Binance + Live 1h Surge</div>
        </div>
      </div>

      {/* 2. HOẠT ĐỘNG DÒNG TIỀN ĐA BLOCKCHAIN */}
      <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t('multiChainFlow')}</h3>
          </div>
          <div className="flex items-center space-x-1 text-xs">
            {['ALL', 'Solana', 'Ethereum', 'Base', 'BNB Chain'].map((chain) => (
              <button
                key={chain}
                onClick={() => setFilterChain(chain)}
                className={`px-2 py-0.5 rounded-lg transition-colors font-medium text-xs ${
                  filterChain === chain
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b36]'
                }`}
              >
                {chain === 'ALL' ? t('catAll') : chain}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { chain: 'Solana', flow: '$1.42B', change: '+38.5%', status: t('statusSolana') },
            { chain: 'Ethereum', flow: '$2.15B', change: '+12.4%', status: t('statusEthereum') },
            { chain: 'Base', flow: '$485M', change: '+24.1%', status: t('statusBase') },
            { chain: 'BNB Chain', flow: '$310M', change: '+14.2%', status: t('statusBnb') },
            { chain: 'Arbitrum', flow: '$145M', change: '+6.8%', status: t('statusArbitrum') },
          ].map((item) => (
            <div key={item.chain} className="bg-[#0e142b] p-2.5 rounded-lg border border-[#192348]">
              <div className="flex items-center space-x-1.5 mb-0.5">
                <ChainIcon chain={item.chain} className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold text-slate-200">{item.chain}</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">{item.flow}</div>
              <div className="flex items-center justify-between text-[10px] mt-0.5">
                <span className="text-emerald-400 font-semibold">{item.change}</span>
                <span className="text-slate-500 truncate max-w-[85px]">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. KHU VỰC BẢNG XẾP HẠNG CHÍNH VỚI 3 TAB RIÊNG BIỆT */}
      <div className="bg-[#0b1021]/90 border border-[#192345] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* ========================================================= */}
        {/* BỘ 3 TAB CHUYỂN ĐỔI BẢNG XẾP HẠNG THEO YÊU CẦU CỦA USER */}
        {/* ========================================================= */}
        <div className="p-2 bg-[#080d1e] border-b border-[#182142] grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Tab 1: Top Điểm Cơ Hội */}
          <button
            onClick={() => {
              setActiveLeaderboardTab('opportunity');
              setSortBy('default');
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-black text-xs transition-all ${
              activeLeaderboardTab === 'opportunity'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-900/50 ring-2 ring-purple-400'
                : 'bg-[#0e152f] text-slate-400 hover:text-white hover:bg-[#141d40]'
            }`}
          >
            <Target className="w-4 h-4 text-amber-300" />
            <span className="tracking-wide">1. {t('tabOpportunity').replace('🎯 ', '')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-purple-200 font-mono">{t('badgeRadarMua')}</span>
          </button>

          {/* Tab 2: Hold Tích Lũy An Toàn */}
          <button
            onClick={() => {
              setActiveLeaderboardTab('safe-hold');
              setSortBy('default');
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-black text-xs transition-all ${
              activeLeaderboardTab === 'safe-hold'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-900/50 ring-2 ring-emerald-400'
                : 'bg-[#0e152f] text-slate-400 hover:text-white hover:bg-[#141d40]'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-300" />
            <span className="tracking-wide">2. {t('tabSafeHold').replace('🛡️ ', '')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-emerald-200 font-mono">{t('badgeDaiHan')}</span>
          </button>

          {/* Tab 3: Hot Mạng Xã Hội Real-Time & Săn Coin Ví Tỷ Đô Nắm Giữ */}
          <button
            onClick={() => {
              setActiveLeaderboardTab('viral-moonshot');
              setSortBy('default');
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-black text-xs transition-all ${
              activeLeaderboardTab === 'viral-moonshot'
                ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white shadow-lg shadow-rose-900/50 ring-2 ring-rose-400'
                : 'bg-[#0e152f] text-slate-400 hover:text-white hover:bg-[#141d40]'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="tracking-wide">3. {t('tabViralMoonshot').replace('🔥 ', '')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-amber-200 font-mono">{t('badgeRealtime')}</span>
          </button>
        </div>

        {/* Header mô tả tiêu chí của Tab hiện tại */}
        <div className="px-4 py-2.5 border-b border-[#182142] flex flex-wrap items-center justify-between gap-2.5 bg-[#0a0f24]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center space-x-1.5 truncate">
                <span>
                  {activeLeaderboardTab === 'opportunity' && t('tabOpportunity')}
                  {activeLeaderboardTab === 'safe-hold' && t('tabSafeHold')}
                  {activeLeaderboardTab === 'viral-moonshot' && t('tabViralMoonshot')}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#141d40] text-cyan-300 border border-cyan-500/40 font-mono">
                  {rankedTokens.length}
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-2xl">
              {activeLeaderboardTab === 'opportunity' && t('tabOpportunitySub')}
              {activeLeaderboardTab === 'safe-hold' && t('tabSafeHoldSub')}
              {activeLeaderboardTab === 'viral-moonshot' && t('tabViralMoonshotSub')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs flex-shrink-0">
            {/* Quick Limit */}
            <div className="flex items-center space-x-0.5 bg-[#090d1c] p-0.5 rounded-lg border border-[#1b2545]">
              {[
                { label: t('filterTop10'), val: 10 },
                { label: t('filterTop30'), val: 30 },
                { label: t('filterTop50'), val: 50 },
                { label: t('filterTop100'), val: 100 },
                { label: `${t('filterAll')} (${rankedTokens.length})`, val: 500 },
              ].map((lim) => (
                <button
                  key={lim.val}
                  onClick={() => setFilterLimit(lim.val)}
                  className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-colors ${
                    filterLimit === lim.val
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lim.label}
                </button>
              ))}
            </div>

            {/* Toggle Stablecoin */}
            <button
              onClick={() => setHideStable(!hideStable)}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                hideStable
                  ? 'bg-slate-800 text-slate-300 border-slate-600'
                  : 'bg-indigo-950 text-indigo-300 border-indigo-500'
              }`}
            >
              {hideStable ? t('hideStable') : t('showStable')}
            </button>

            {/* Toggle Tier 1 CEX */}
            <button
              onClick={() => setFilterTier1(!filterTier1)}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                filterTier1
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950/50'
                  : 'bg-[#141b38] text-slate-400 border-[#232f5a] hover:text-white'
              }`}
            >
              {t('tier1Cex')}
            </button>

            {/* Toggle Ví Tỷ Đô */}
            <button
              onClick={() => setFilterBillionWhale(!filterBillionWhale)}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                filterBillionWhale
                  ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                  : 'bg-[#141b38] text-slate-400 border-[#232f5a] hover:text-white'
              }`}
              title={lang === 'en' ? 'Show tokens backed by billion-dollar funds or mega whales' : 'Chỉ hiện các đồng coin có quỹ vài tỷ đô hoặc ví cá voi khổng lồ nắm giữ'}
            >
              {t('billionWhales')}
            </button>

            {/* Toggle Realtime Surge */}
            <button
              onClick={() => setFilterRealtimeSurge(!filterRealtimeSurge)}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                filterRealtimeSurge
                  ? 'bg-gradient-to-r from-rose-950 to-amber-950 text-rose-300 border-rose-400 shadow-md shadow-rose-950/60 ring-1 ring-rose-400/50 animate-pulse'
                  : 'bg-[#141b38] text-slate-400 border-[#232f5a] hover:text-white'
              }`}
              title={lang === 'en' ? 'Show tokens surging in 1-hour social discussions' : 'Chỉ hiện các token đang bùng nổ thảo luận mạng xã hội trong 1 giờ qua'}
            >
              {t('realtimeSurge')}
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-600/50 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>{t('exportCsv')}</span>
            </button>
          </div>
        </div>

        {/* Phân hệ Navigation Filter */}
        <div className="px-4 py-2 bg-[#0d132b] border-b border-[#182142] flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wide">{t('categoryLabel')}</span>
          {[
            { id: 'ALL', label: t('catAll') },
            { id: 'Layer 1 / L2', label: t('catL1L2') },
            { id: 'DeFi', label: t('catDefi') },
            { id: 'AI & Big Data', label: t('catAiData') },
            { id: 'RWA & Hạ tầng', label: t('catRwa') },
            { id: 'Gaming & NFT', label: t('catGaming') },
            { id: 'Meme Coins', label: t('catMeme') },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs ${
                filterCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow ring-1 ring-purple-400'
                  : 'bg-[#121936] text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Thanh tìm kiếm & Tùy chọn sắp xếp linh hoạt theo Tab */}
        <div className="px-4 py-2 bg-[#090d1c]/70 border-b border-[#182142] flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center space-x-2 flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('tableSearchPlaceholder')}
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 text-slate-400 text-xs pr-1">
            <span>{t('sortBy')}</span>
            
            {activeLeaderboardTab === 'opportunity' && (
              <>
                <button
                  onClick={() => setSortBy('default')}
                  className={`transition-colors ${sortBy === 'default' || sortBy === 'opportunityScore' ? 'text-purple-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortOpportunity')}
                </button>
                <button
                  onClick={() => setSortBy('volume24h')}
                  className={`transition-colors ${sortBy === 'volume24h' ? 'text-purple-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortVolume24h')}
                </button>
                <button
                  onClick={() => setSortBy('change24h')}
                  className={`transition-colors ${sortBy === 'change24h' ? 'text-purple-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortGain24h')}
                </button>
                <button
                  onClick={() => setSortBy('marketCap')}
                  className={`transition-colors ${sortBy === 'marketCap' ? 'text-purple-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortMarketCap')}
                </button>
              </>
            )}

            {activeLeaderboardTab === 'safe-hold' && (
              <>
                <button
                  onClick={() => setSortBy('default')}
                  className={`transition-colors ${sortBy === 'default' || sortBy === 'holdRank' ? 'text-emerald-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortBestHold')}
                </button>
                <button
                  onClick={() => setSortBy('marketCap')}
                  className={`transition-colors ${sortBy === 'marketCap' ? 'text-emerald-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortMarketCap')}
                </button>
                <button
                  onClick={() => setSortBy('volume24h')}
                  className={`transition-colors ${sortBy === 'volume24h' ? 'text-emerald-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortVolume24h')}
                </button>
                <button
                  onClick={() => setSortBy('change24h')}
                  className={`transition-colors ${sortBy === 'change24h' ? 'text-emerald-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortGain24h')}
                </button>
              </>
            )}

            {activeLeaderboardTab === 'viral-moonshot' && (
              <>
                <button
                  onClick={() => setSortBy('default')}
                  className={`transition-colors ${sortBy === 'default' || sortBy === 'realtimeSurge' ? 'text-rose-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortLiveSurge')}
                </button>
                <button
                  onClick={() => setSortBy('whaleHoldings')}
                  className={`transition-colors ${sortBy === 'whaleHoldings' ? 'text-cyan-300 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortBillionWhale')}
                </button>
                <button
                  onClick={() => setSortBy('buyers24h')}
                  className={`transition-colors ${sortBy === 'buyers24h' ? 'text-rose-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortNewBuyers')}
                </button>
                <button
                  onClick={() => setSortBy('change24h')}
                  className={`transition-colors ${sortBy === 'change24h' ? 'text-rose-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortGain24h')}
                </button>
                <button
                  onClick={() => setSortBy('marketCap')}
                  className={`transition-colors ${sortBy === 'marketCap' ? 'text-rose-400 font-bold underline' : 'hover:text-white'}`}
                >
                  {t('sortLowCap')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* NỘI DUNG BẢNG: ĐÃ ĐƯỢC TỐI ƯU CỰC KỲ GỌN GÀNG, KHÔNG BAO GIỜ BỊ CẮT XÉN */}
        {/* CỘT HÀNH ĐỘNG STICKY RIGHT GHIM CHẶT BÊN PHẢI MÀN HÌNH */}
        {/* ========================================================= */}
        <div className="w-full overflow-x-auto relative">
          <table className="w-full text-left text-xs text-slate-300 table-auto min-w-[760px]">
            
            {/* ---------------------------------------------------- */}
            {/* THEAD THEO TAB */}
            {/* ---------------------------------------------------- */}
            <thead className="bg-[#0e142a] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#182142]">
              <tr>
                <th className="py-2.5 px-2 text-center w-10">{t('colRank')}</th>
                <th className="py-2.5 px-2.5 min-w-[140px]">{t('colAsset')}</th>
                <th className="py-2.5 px-2 font-mono min-w-[90px]">{t('colPrice')}</th>
                <th className="py-2.5 px-2.5 font-mono min-w-[105px]">{t('colMcapVol')}</th>

                {/* Tab 1 Columns: Top Điểm Cơ Hội */}
                {activeLeaderboardTab === 'opportunity' && (
                  <>
                    <th className="py-2.5 px-2 min-w-[110px]">{lang === 'en' ? 'EXCHANGES' : 'Sàn Niêm Yết'}</th>
                    <th className="py-2.5 px-2 text-center min-w-[95px]">{lang === 'en' ? 'SCORE & RISK' : 'Điểm & Rủi Ro'}</th>
                    <th className="py-2.5 px-2 text-center min-w-[120px]">{t('colTradeVerdict')}</th>
                  </>
                )}

                {/* Tab 2 Columns: Hold Tích Lũy An Toàn */}
                {activeLeaderboardTab === 'safe-hold' && (
                  <>
                    <th className="py-2.5 px-2 text-center min-w-[125px]">{t('colCyclePosition')}</th>
                    <th className="py-2.5 px-2 text-center min-w-[155px]">{t('colHoldRecommendation')}</th>
                    <th className="py-2.5 px-2 text-center min-w-[90px]">{t('colAllocation')}</th>
                  </>
                )}

                {/* Tab 3 Columns: Hot MXH Thời Gian Thực & Ví Tỷ Đô */}
                {activeLeaderboardTab === 'viral-moonshot' && (
                  <>
                    <th className="py-2.5 px-2 text-center min-w-[150px]">{t('colHotSocial')}</th>
                    <th className="py-2.5 px-2.5 min-w-[170px]">{t('colWhalesHold')}</th>
                    <th className="py-2.5 px-2 text-center min-w-[105px]">{t('colMultiplier')}</th>
                  </>
                )}

                {/* Cột Kế Hoạch Gom / Lướt: STICKY RIGHT ghim chặt ở mép phải */}
                <th className="py-2.5 px-2 text-center w-20 sticky right-0 bg-[#0e142a] z-20 shadow-[-6px_0_10px_rgba(0,0,0,0.4)] whitespace-nowrap">
                  {t('colPlan')}
                </th>
              </tr>
            </thead>

            {/* ---------------------------------------------------- */}
            {/* TBODY THEO TAB */}
            {/* ---------------------------------------------------- */}
            <tbody className="divide-y divide-[#141b36]">
              {displayedTokens.map((token, index) => {
                const isSelected = selectedToken?.id === token.id;
                const rankNum = index + 1;
                const isTop1 = rankNum === 1;
                const isTop2 = rankNum === 2;
                const isTop3 = rankNum === 3;
                const mcap = token.marketCap || token.fdv || 0;
                const mcapFormatted = mcap >= 1e9 ? `$${(mcap / 1e9).toFixed(1)}B` : `$${(mcap / 1e6).toFixed(1)}M`;
                const buyRatio = token.buyVolumeRatio || 0.52;

                return (
                  <tr
                    key={token.id}
                    onClick={() => {
                      setSelectedToken(token);
                      setModalToken(token);
                    }}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-purple-950/50 border-l-4 border-purple-500'
                        : isTop1
                        ? 'bg-amber-950/20 hover:bg-[#151c38]'
                        : isTop2
                        ? 'bg-slate-800/20 hover:bg-[#151c38]'
                        : 'hover:bg-[#121833]'
                    }`}
                  >
                    {/* 1. Hạng # */}
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-black text-[11px] ${
                          isTop1
                            ? 'bg-amber-400 text-black shadow-sm ring-1 ring-amber-300'
                            : isTop2
                            ? 'bg-slate-200 text-black shadow ring-1 ring-slate-300'
                            : isTop3
                            ? 'bg-amber-700 text-white shadow ring-1 ring-amber-600'
                            : rankNum <= 10
                            ? 'bg-purple-950 text-purple-300 border border-purple-500/50 font-bold'
                            : 'text-slate-500 font-mono'
                        }`}
                      >
                        {rankNum}
                      </span>
                    </td>

                    {/* 2. Token & Phân Hệ */}
                    <td className="py-2 px-2.5">
                      <div className="flex items-center space-x-2">
                        {token.image ? (
                          <img
                            src={token.image}
                            alt={token.symbol}
                            className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shadow flex-shrink-0">
                            {token.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-white text-xs tracking-tight flex items-center space-x-1">
                            <span>{token.symbol}</span>
                            {token.category && (
                              <span className={`text-[8.5px] font-semibold px-1 py-0.1 rounded ${
                                token.category === 'Meme Coins'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-700/40'
                                  : token.category === 'Layer 1 / L2'
                                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/40'
                                  : token.category === 'DeFi'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-700/40'
                                  : token.category === 'RWA & Hạ tầng'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                                  : 'bg-purple-950 text-purple-300 border border-purple-700/40'
                              }`}>
                                {token.category === 'Layer 1 / L2' ? 'L1/L2' : token.category === 'AI & Big Data' ? 'AI' : token.category}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                            {token.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Giá USD & % 24h */}
                    <td className="py-2 px-2 font-mono whitespace-nowrap">
                      <div className="font-bold text-white text-xs">
                        ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(token.priceUsd > 100 ? 2 : 4)}
                      </div>
                      <div className={`text-[9.5px] font-semibold ${token.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {token.change24h > 0 ? `+${token.change24h}%` : `${token.change24h}%`}
                      </div>
                    </td>

                    {/* 4. Vốn Hóa & Vol 24h Gộp Chung */}
                    <td className="py-2 px-2.5 font-mono whitespace-nowrap">
                      <div className="font-extrabold text-emerald-400 text-xs">{mcapFormatted}</div>
                      <div className="text-[9.5px] text-slate-400">Vol: ${(token.volume24h / 1e6).toFixed(1)}M</div>
                    </td>

                    {/* ========================================================= */}
                    {/* TAB 1: TOP ĐIỂM CƠ HỘI */}
                    {/* ========================================================= */}
                    {activeLeaderboardTab === 'opportunity' && (
                      <>
                        {/* Sàn Niêm Yết CEX */}
                        <td className="py-2 px-2">
                          <div className="flex flex-wrap items-center gap-1 max-w-[120px]">
                            {(token.exchanges || ['Binance', 'OKX']).slice(0, 2).map((ex, i) => (
                              <span key={i} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#141b38] text-cyan-300 border border-cyan-800/40">
                                {ex}
                              </span>
                            ))}
                            {(token.exchanges?.length || 0) > 2 && (
                              <span className="text-[9px] text-slate-400 bg-slate-800 px-1 rounded">
                                +{(token.exchanges?.length || 0) - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Điểm & Rủi Ro */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full font-mono text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                            <span>{token.opportunityScore}{t('ptsUnit')}</span>
                            <span className="text-[9px] text-slate-400">• RR:{token.riskScore}</span>
                          </span>
                        </td>

                        {/* Đánh Giá Cơ Hội */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <span className={`inline-block text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight border ${
                            token.opportunityScore >= 80
                              ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500'
                              : token.opportunityScore >= 70
                              ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500'
                              : 'bg-purple-900/60 text-purple-300 border border-purple-500'
                          }`}>
                            {translateTradeVerdict(token.tradeRecommendation, lang)}
                          </span>
                        </td>
                      </>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 2: HOLD TÍCH LŨY AN TOÀN */}
                    {/* ========================================================= */}
                    {activeLeaderboardTab === 'safe-hold' && (
                      <>
                        {/* Vị Thế Chu Kỳ (Đỉnh/Đáy) */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                            (token.cyclePosition || '').includes('Đáy') || (token.cyclePosition || '').includes('Dự Trữ')
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                              : (token.cyclePosition || '').includes('Đầu Sóng') || (token.cyclePosition || '').includes('L1')
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                              : (token.cyclePosition || '').includes('Đỉnh')
                              ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                              : 'bg-purple-950 text-purple-300 border-purple-500/50'
                          }`}>
                            {translateCyclePosition(token.cyclePosition, lang)}
                          </span>
                        </td>

                        {/* Khuyến Nghị & Điểm An Toàn Hold Gộp Chung */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight border ${
                            token.holdRecommendation === 'RẤT NÊN TÍCH LŨY'
                              ? 'bg-gradient-to-r from-emerald-950 to-teal-950 text-emerald-300 border-emerald-400 shadow ring-1 ring-emerald-400/40'
                              : token.holdRecommendation === 'NÊN TÍCH LŨY'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/70'
                              : token.holdRecommendation === 'CÂN NHẮC (5-10% VỐN)'
                              ? 'bg-amber-950/70 text-amber-300 border-amber-500/60'
                              : token.holdRecommendation === 'THEO DÕI THÊM'
                              ? 'bg-orange-950/70 text-orange-300 border-orange-500/60'
                              : 'bg-rose-950/80 text-rose-300 border-rose-600/70'
                          }`}>
                            <span>
                              {token.holdRecommendation === 'RẤT NÊN TÍCH LŨY' ? '💎 ' : token.holdRecommendation === 'NÊN TÍCH LŨY' ? '🟢 ' : token.holdRecommendation === 'CÂN NHẮC (5-10% VỐN)' ? '🟡 ' : token.holdRecommendation === 'THEO DÕI THÊM' ? '🟠 ' : '🔴 '}
                              {translateHoldRecommendation(token.holdRecommendation, lang)}
                            </span>
                            <span className="font-mono text-[9px] opacity-75 border-l border-white/20 pl-1">
                              {token.holdSafetyScore || 50}{t('ptsUnit')}
                            </span>
                          </span>
                        </td>

                        {/* Phân Bổ Vốn Gọn Gàng */}
                        <td className="py-2 px-2 text-center font-mono font-bold text-xs whitespace-nowrap">
                          <span className={(token.holdAllocationPercent || '').startsWith('40') || (token.holdAllocationPercent || '').startsWith('25') ? 'text-cyan-300' : (token.holdAllocationPercent || '').startsWith('10') ? 'text-purple-300' : (token.holdAllocationPercent || '').startsWith('0') ? 'text-rose-400' : 'text-slate-300'}>
                            {translateHoldAllocation(token.holdAllocationPercent, lang)}
                          </span>
                        </td>
                      </>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 3: HOT MXH THỜI GIAN THỰC & VÍ TỶ ĐÔ HOLD */}
                    {/* ========================================================= */}
                    {activeLeaderboardTab === 'viral-moonshot' && (
                      <>
                        {/* Độ Hot MXH Thời Gian Thực (1h Surge - Không phải quá khứ) */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${token.socialTrendBadge}`}>
                            {token.isRealtimeSpike && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block animate-ping"></span>}
                            <span>{translateSocialTrend(token.socialTrendLabel, lang)}</span>
                          </span>
                          <div className="text-[10px] font-mono font-bold text-amber-300 mt-0.5">
                            {token.realtimeSurgePercent > 0 ? `+${token.realtimeSurgePercent}% (${lang === 'en' ? 'past 1h' : '1h qua'})` : `${token.realtimeSurgePercent}% (${lang === 'en' ? '1h' : '1h'})`} • {(token.realtimeHourlyMentions || 1000).toLocaleString()} {lang === 'en' ? 'posts/hr' : 'bài/h'}
                          </div>
                        </td>

                        {/* Nhà Đầu Tư Lớn & Ví Tỷ Đô Đang Nắm Giữ */}
                        <td className="py-2 px-2.5 min-w-[160px] max-w-[220px]">
                          {token.hasBillionDollarBacker ? (
                            <div>
                              <div className="flex items-center space-x-1 text-[11px] font-extrabold text-cyan-300 truncate" title={(token.topBackers || []).join(', ')}>
                                <span className="text-[10px]">🏛️</span>
                                <span className="truncate">{translateBacker(token.topBackersFormatted, lang)}</span>
                              </div>
                              <div className="flex items-center justify-between mt-0.5 text-[9.5px]">
                                <span className="text-slate-400 font-mono">
                                  {t('holdPercentLabel')}: <strong className="text-white">{token.whaleSupplyPercent}%</strong> ({formatWhaleHoldings(token.whaleHoldingsUsdFormatted, lang)})
                                </span>
                                <span className={`px-1.5 py-0.2 rounded font-bold border text-[8.5px] ${token.whaleActionBadge}`}>
                                  {translateWhaleAction(token.whaleActionLabel, lang)}
                                </span>
                              </div>
                              {token.fundAvgPrice && (
                                <div className="mt-1 flex items-center justify-between text-[9px] pt-0.5 border-t border-[#1b254d]/60">
                                  <span className="text-slate-400 font-mono truncate mr-1" title={translateFundRound(token.fundRound || '', lang)}>
                                    {t('fundCostLabel')}: <strong className="text-amber-300 font-bold">{token.fundAvgPriceFormatted}</strong>
                                  </span>
                                  <span className={`px-1 rounded text-[8.5px] font-bold border whitespace-nowrap ${token.fundProfitBadge}`}>
                                    {translatePriceVsFund(token.priceVsFundLabel, lang)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-[9.5px] px-2 py-0.5 rounded bg-[#101633] text-slate-500 border border-[#1b254d]">
                                {t('communityRetail')}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Tiềm năng nhân vốn chu kỳ (x Lần) */}
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <span className={`inline-block font-mono font-black text-xs px-2 py-0.5 rounded-full border ${token.multiplierBadge}`}>
                            {token.multiplierText}
                          </span>
                        </td>
                      </>
                    )}

                    {/* CỘT NÚT KẾ HOẠCH: STICKY RIGHT GHIM CHẶT BÊN PHẢI MÀN HÌNH */}
                    <td className="py-2 px-2 text-center whitespace-nowrap w-20 sticky right-0 bg-[#0b1021] group-hover:bg-[#121833] z-10 shadow-[-6px_0_10px_rgba(0,0,0,0.4)]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedToken(token);
                          setModalToken(token);
                        }}
                        className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10.5px] shadow-sm shadow-purple-900/40 transition-all flex items-center justify-center space-x-1 mx-auto"
                        title={lang === 'en' ? 'Open Detailed Analysis & DCA Plan' : 'Mở Kế Hoạch Soi Kèo & Chia Vốn Đỉnh Đáy'}
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>{t('btnPlan')}</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PANEL PHÂN TÍCH CHI TIẾT TÀI SẢN ĐƯỢC CHỌN */}
      {selectedToken && (
        <div className="bg-[#0b1021]/90 border border-[#192345] rounded-2xl p-4 shadow-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#182142]">
            <div className="flex items-center space-x-3">
              {selectedToken.image ? (
                <img
                  src={selectedToken.image}
                  alt={selectedToken.symbol}
                  className="w-10 h-10 rounded-full bg-slate-800 shadow ring-2 ring-purple-500/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow">
                  {selectedToken.symbol.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-extrabold text-white">{selectedToken.name}</span>
                  <span className="text-xs text-purple-400 font-mono">({selectedToken.symbol})</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#141b38] border border-[#232f5a] text-slate-300 flex items-center space-x-1">
                    <ChainIcon chain={selectedToken.chain} className="w-3 h-3" />
                    <span>{selectedToken.chain}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-600/50">
                    Hạng #{selectedToken.holdRank || selectedToken.tradeWorthinessRank || 1}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex flex-wrap items-center space-x-2 mt-0.5">
                  <span className="font-mono">CA: {selectedToken.contractAddress}</span>
                  <span className="text-slate-600">•</span>
                  <span>Vốn Hóa: <strong className="text-emerald-400">${((selectedToken.marketCap || selectedToken.fdv || 0) / 1e6).toFixed(1)}M</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Volume 24h: <strong className="text-slate-200">${(selectedToken.volume24h / 1e6).toFixed(1)}M</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setModalToken(selectedToken)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 transition-all flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Soi Kèo & Chia Vốn</span>
              </button>
              <button
                onClick={() => onOpenExitRadar(selectedToken)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/50 hover:bg-amber-900/50 text-amber-300 border border-amber-600/40 transition-colors flex items-center space-x-1"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Kiểm tra Exit Radar</span>
              </button>
              <button
                onClick={() => onOpenRiskScanner(selectedToken)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-600/40 transition-colors flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Soi Rủi Ro Hợp Đồng</span>
              </button>
            </div>
          </div>

          {/* Breakdown 4 cột */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#080d1e] p-3 rounded-xl border border-[#17203d]">
            <div>
              <div className="text-[11px] text-slate-400">1. Dòng tiền & Giao dịch</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {selectedToken.scoreBreakdown?.moneyFlow || 25} / 30 điểm
              </div>
              <div className="text-[10px] text-slate-500">Tỷ lệ mua {(selectedToken.buyVolumeRatio * 100).toFixed(0)}%</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">2. Mức độ chú ý</div>
              <div className="text-sm font-bold text-purple-400 mt-0.5">
                {selectedToken.scoreBreakdown?.socialAttention || 20} / 25 điểm
              </div>
              <div className="text-[10px] text-slate-500">{(selectedToken.buyers24h || 1000).toLocaleString()} ví tham gia</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">3. Độ sâu Thanh khoản</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">
                {selectedToken.scoreBreakdown?.liquidityDepth || 22} / 25 điểm
              </div>
              <div className="text-[10px] text-slate-500">Pool ${((selectedToken.liquidityUsd || 1000000) / 1e6).toFixed(1)}M USD</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">4. Động lượng giá</div>
              <div className="text-sm font-bold text-indigo-400 mt-0.5">
                {selectedToken.scoreBreakdown?.priceMomentum || 18} / 20 điểm
              </div>
              <div className="text-[10px] text-slate-500">Biến động 24h: {selectedToken.change24h}%</div>
            </div>
          </div>

          {/* MiniChart & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-7 bg-[#080d1e] rounded-xl p-3 border border-[#17203d]">
              <MiniChart tokenSymbol={selectedToken.symbol} />
            </div>

            <div className="lg:col-span-5 bg-[#080d1e] rounded-xl p-3 border border-[#17203d] flex flex-col justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Căn cứ tín hiệu & phân bổ vốn</span>
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-start space-x-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Khuyến nghị: <strong className="text-emerald-300">{selectedToken.holdRecommendation || selectedToken.tradeRecommendation || 'THEO DÕI'}</strong></span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Phân bổ an toàn: <strong className="text-cyan-300">{selectedToken.holdAllocationPercent || '5% - 10% Vốn'}</strong></span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>Vị thế chu kỳ: <strong className="text-amber-300">{selectedToken.cyclePosition || 'Tích Lũy Nền Giá'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#141b36] text-[10px] text-slate-500 italic">
                * Bấm vào nút "Kế Hoạch" để mở chiến lược vào lệnh DCA 3 đợt và tín hiệu Long/Short chi tiết.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP SOI KÈO & CHIA VỐN THEO CHU KỲ ĐỈNH ĐÁY */}
      {modalToken && (
        <CoinDetailModal
          token={modalToken}
          onClose={() => setModalToken(null)}
          onOpenExitRadar={onOpenExitRadar}
          onOpenRiskScanner={onOpenRiskScanner}
        />
      )}
    </div>
  );
}
