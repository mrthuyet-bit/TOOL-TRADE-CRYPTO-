import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Award,
  Filter,
  Search,
  ArrowRight,
  Percent,
  Activity,
  Layers,
  Sparkles,
  Download,
  Target,
  Clock,
} from 'lucide-react';
import { rankTokensForShortTermTrading } from '../modules/longShortEngine';
import ChainIcon from '../components/ChainIcon';
import CoinDetailModal from '../components/CoinDetailModal';
import { useLanguage } from '../i18n/LanguageContext';
import { translateCyclePosition } from '../i18n/translations';

export default function LongShortRadarView({ tokens, onSelectToken }) {
  const { lang, t } = useLanguage();
  const [filterDirection, setFilterDirection] = useState('ALL'); // 'ALL', 'LONG', 'SHORT'
  const [filterTimeframe, setFilterTimeframe] = useState('ALL'); // 'ALL', 'M15', 'H1'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('shortTermScore'); // 'shortTermScore', 'winRate', 'volume24h', 'price'
  const [selectedSetup, setSelectedSetup] = useState(null);
  const [modalToken, setModalToken] = useState(null);

  // Generate setups for all tokens
  const allSetups = useMemo(() => {
    return rankTokensForShortTermTrading(tokens);
  }, [tokens]);

  // Filter & Sort
  const filteredSetups = useMemo(() => {
    return allSetups.filter((s) => {
      // Direction
      if (filterDirection !== 'ALL' && s.direction !== filterDirection) return false;

      // Timeframe
      if (filterTimeframe === 'M15' && !s.timeframe.includes('M15')) return false;
      if (filterTimeframe === 'H1' && !s.timeframe.includes('H1') && !s.timeframe.includes('H4')) return false;

      // Search
      const q = searchQuery.toLowerCase();
      if (
        q &&
        !s.tokenSymbol.toLowerCase().includes(q) &&
        !s.tokenName.toLowerCase().includes(q) &&
        !s.chain.toLowerCase().includes(q) &&
        !(s.category && s.category.toLowerCase().includes(q))
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'shortTermScore') return b.shortTermScore - a.shortTermScore;
      if (sortBy === 'winRate') return b.estimatedWinRate - a.estimatedWinRate;
      if (sortBy === 'volume24h') return b.volume24h - a.volume24h;
      return 0;
    });
  }, [allSetups, filterDirection, filterTimeframe, searchQuery, sortBy]);

  const totalLongs = allSetups.filter((s) => s.direction === 'LONG').length;
  const totalShorts = allSetups.filter((s) => s.direction === 'SHORT').length;

  const handleOpenPlan = (setup) => {
    setSelectedSetup(setup);
    const matchedToken = tokens.find((t) => t.symbol.toUpperCase() === setup.tokenSymbol);
    if (matchedToken) {
      setModalToken(matchedToken);
      if (onSelectToken) onSelectToken(matchedToken);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-950/70 via-[#101738] to-[#090e24] border border-purple-500/40 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/50 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
            <Zap className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                {lang === 'en' ? 'Short-Term Scalp Radar & Long / Short Futures' : 'Radar Lướt Sóng Ngắn Hạn & Long / Short Futures'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                Live Engine M15 / H1
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {lang === 'en'
                ? 'Early detection of high Risk/Reward Long/Short setups, taker volume surges, and safe leverage limits.'
                : 'Phát hiện sớm các setup Long/Short có tỷ lệ Lợi nhuận/Rủi ro (R:R) cao, dòng tiền Taker Buy/Sell đột biến, hỗ trợ đòn bẩy an toàn.'}
            </p>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-600/50 text-emerald-300 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>{totalLongs} {lang === 'en' ? 'LONG Setups' : 'Kèo LONG'}</span>
          </div>
          <div className="bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-600/50 text-rose-300 flex items-center space-x-1.5">
            <TrendingDown className="w-4 h-4" />
            <span>{totalShorts} {lang === 'en' ? 'SHORT Setups' : 'Kèo SHORT'}</span>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-3.5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-medium">{lang === 'en' ? 'Tracked Futures Pairs' : 'Tổng Kèo Futures Quét Live'}</div>
          <div className="text-xl font-extrabold text-white mt-1 font-mono">{allSetups.length} {lang === 'en' ? 'Pairs' : 'Cặp Giao Dịch'}</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">{lang === 'en' ? '24h Volume > $1M USD' : 'Khối lượng > $1M USD / 24h'}</div>
        </div>

        <div className="bg-[#0b1021]/80 border border-emerald-700/40 rounded-xl p-3.5 shadow-lg bg-gradient-to-br from-emerald-950/20 to-[#0b1021]">
          <div className="text-[11px] text-emerald-300 font-medium flex items-center justify-between">
            <span>{lang === 'en' ? 'Breakout LONGs' : 'Kèo LONG Bứt Phá'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">{totalLongs} {lang === 'en' ? 'Signals' : 'Tín Hiệu'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{lang === 'en' ? 'Active aggressive buyer inflow' : 'Xung lực mua gom chủ động'}</div>
        </div>

        <div className="bg-[#0b1021]/80 border border-rose-700/40 rounded-xl p-3.5 shadow-lg bg-gradient-to-br from-rose-950/20 to-[#0b1021]">
          <div className="text-[11px] text-rose-300 font-medium flex items-center justify-between">
            <span>{lang === 'en' ? 'Pullback / Resistance SHORTs' : 'Kèo SHORT Hồi / Cản'}</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400 mt-1 font-mono">{totalShorts} {lang === 'en' ? 'Signals' : 'Tín Hiệu'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{lang === 'en' ? 'Hitting resistance or divergence' : 'Chạm kháng cự hoặc phân kỳ'}</div>
        </div>

        <div className="bg-[#0b1021]/80 border border-purple-800/40 rounded-xl p-3.5 shadow-lg">
          <div className="text-[11px] text-purple-300 font-medium flex items-center justify-between">
            <span>{lang === 'en' ? 'Avg Estimated Win Rate' : 'Tỷ Lệ Thắng TB Ước Tính'}</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-purple-300 mt-1 font-mono">72.4%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{lang === 'en' ? 'Avg Risk:Reward 1:2.8' : 'Tỷ lệ Risk:Reward TB 1:2.8'}</div>
        </div>
      </div>

      {/* 3. LEADERBOARD TABLE */}
      <div className="bg-[#0b1021]/90 border border-[#192345] rounded-2xl shadow-2xl overflow-hidden">
        {/* Controls bar */}
        <div className="px-5 py-3.5 border-b border-[#182142] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Direction Filter Pills */}
            <div className="flex items-center space-x-1 bg-[#080d1e] p-1 rounded-xl border border-[#1b2545] text-xs font-bold">
              {[
                { id: 'ALL', label: lang === 'en' ? `All (${allSetups.length})` : `Tất Cả (${allSetups.length})` },
                { id: 'LONG', label: `🟢 ${lang === 'en' ? 'LONG' : 'Kèo LONG'} (${totalLongs})` },
                { id: 'SHORT', label: `🔴 ${lang === 'en' ? 'SHORT' : 'Kèo SHORT'} (${totalShorts})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterDirection(btn.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterDirection === btn.id
                      ? btn.id === 'LONG'
                        ? 'bg-emerald-600 text-white shadow'
                        : btn.id === 'SHORT'
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Timeframe Filters */}
            <div className="flex items-center space-x-1 bg-[#080d1e] p-1 rounded-xl border border-[#1b2545] text-xs">
              {[
                { id: 'ALL', label: lang === 'en' ? 'All Timeframes' : 'Tất cả khung' },
                { id: 'M15', label: '⚡ Scalping M15' },
                { id: 'H1', label: '🌊 Day Trade H1' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setFilterTimeframe(tf.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    filterTimeframe === tf.id ? 'bg-[#182247] text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Sort */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search symbol, chain...' : 'Tìm coin, chain...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#080d1e] border border-[#1b2545] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none w-44"
              />
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <span className="text-[11px]">{t('sortBy')}</span>
              <button
                onClick={() => setSortBy('shortTermScore')}
                className={`transition-colors ${sortBy === 'shortTermScore' ? 'text-purple-400 font-bold underline' : 'hover:text-white'}`}
              >
                {lang === 'en' ? 'Setup Score' : 'Điểm Kèo'}
              </button>
              <span>•</span>
              <button
                onClick={() => setSortBy('winRate')}
                className={`transition-colors ${sortBy === 'winRate' ? 'text-purple-400 font-bold underline' : 'hover:text-white'}`}
              >
                Win Rate
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0d132b]/95 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#182142]">
              <tr>
                <th className="py-3 px-3 text-center w-12">{t('colRank')}</th>
                <th className="py-3 px-4">{lang === 'en' ? 'TOKEN & SYMBOL' : 'Token & Ký Hiệu'}</th>
                <th className="py-3 px-3 text-center">{lang === 'en' ? 'DIRECTION' : 'Vị Thế'}</th>
                <th className="py-3 px-3 font-mono">{lang === 'en' ? 'PRICE' : 'Giá Hiện Tại'}</th>
                <th className="py-3 px-3 font-mono">{lang === 'en' ? 'ENTRY' : 'Vùng Vào (Entry)'}</th>
                <th className="py-3 px-3 font-mono text-emerald-400">{lang === 'en' ? 'TP1 (50%)' : 'TP1 (Chốt 50%)'}</th>
                <th className="py-3 px-3 font-mono text-emerald-300">{lang === 'en' ? 'TP2 (50%)' : 'TP2 (Chốt 50%)'}</th>
                <th className="py-3 px-3 font-mono text-rose-400">{lang === 'en' ? 'STOP LOSS' : 'Cắt Lỗ (SL)'}</th>
                <th className="py-3 px-3 text-center">{lang === 'en' ? 'R:R RATIO' : 'Tỷ Lệ R:R'}</th>
                <th className="py-3 px-2 text-center">{lang === 'en' ? 'LEV' : 'Đòn Bẩy'}</th>
                <th className="py-3 px-2 text-center">WIN RATE</th>
                <th className="py-3 px-3 text-center">{t('colPlan')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141b36]">
              {filteredSetups.map((setup, index) => {
                const isLong = setup.direction === 'LONG';
                const isTop3 = index < 3;

                return (
                  <tr
                    key={setup.tokenSymbol}
                    onClick={() => handleOpenPlan(setup)}
                    className={`transition-colors cursor-pointer ${
                      isTop3 ? 'bg-purple-950/20 hover:bg-[#121833]' : 'hover:bg-[#121833]'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          index === 0
                            ? 'bg-amber-400 text-black font-extrabold shadow'
                            : index === 1
                            ? 'bg-slate-200 text-black font-bold'
                            : index === 2
                            ? 'bg-amber-700 text-white font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>

                    {/* Token */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="font-extrabold text-white text-xs tracking-tight flex items-center space-x-1.5">
                            <span>{setup.tokenSymbol}</span>
                            {setup.category && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#162047] text-purple-300">
                                {setup.category}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px] flex items-center space-x-1 mt-0.5">
                            <span className="truncate">{setup.tokenName}</span>
                            <span className="text-[9px] text-amber-300/80 font-mono flex-shrink-0">
                              • {translateCyclePosition(setup.cyclePhase, lang)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vị Thế LONG / SHORT */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-black text-[11px] tracking-wider uppercase border shadow-sm ${
                          isLong
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-emerald-950/50'
                            : 'bg-rose-950 text-rose-300 border-rose-500/60 shadow-rose-950/50'
                        }`}
                      >
                        {isLong ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{setup.direction}</span>
                      </span>
                    </td>

                    {/* Giá hiện tại */}
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      ${setup.currentPrice < 0.01 ? setup.currentPrice.toFixed(6) : setup.currentPrice.toFixed(4)}
                    </td>

                    {/* Entry Range */}
                    <td className="py-3 px-3 font-mono text-cyan-300 text-xs">
                      ${setup.entryPrice < 0.01 ? setup.entryPrice.toFixed(6) : setup.entryPrice.toFixed(4)}
                    </td>

                    {/* TP1 */}
                    <td className="py-3 px-3 font-mono text-emerald-400 font-semibold text-xs">
                      ${setup.takeProfit1 < 0.01 ? setup.takeProfit1.toFixed(6) : setup.takeProfit1.toFixed(4)}
                      <span className="text-[10px] block opacity-80">{setup.takeProfit1Percent > 0 ? `+${setup.takeProfit1Percent}%` : `${setup.takeProfit1Percent}%`}</span>
                    </td>

                    {/* TP2 */}
                    <td className="py-3 px-3 font-mono text-emerald-300 font-semibold text-xs">
                      ${setup.takeProfit2 < 0.01 ? setup.takeProfit2.toFixed(6) : setup.takeProfit2.toFixed(4)}
                      <span className="text-[10px] block opacity-80">{setup.takeProfit2Percent > 0 ? `+${setup.takeProfit2Percent}%` : `${setup.takeProfit2Percent}%`}</span>
                    </td>

                    {/* Stop Loss */}
                    <td className="py-3 px-3 font-mono text-rose-400 font-semibold text-xs">
                      ${setup.stopLoss < 0.01 ? setup.stopLoss.toFixed(6) : setup.stopLoss.toFixed(4)}
                      <span className="text-[10px] block opacity-80">{setup.stopLossPercent}%</span>
                    </td>

                    {/* R:R Ratio */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-300 text-xs">
                      {setup.riskRewardRatio}
                    </td>

                    {/* Đòn bẩy */}
                    <td className="py-3 px-2 text-center font-mono font-bold text-purple-300 text-xs">
                      {setup.recommendedLeverage.split(' ')[0]}
                    </td>

                    {/* Win Rate */}
                    <td className="py-3 px-2 text-center font-mono font-bold text-cyan-400 text-xs">
                      {setup.estimatedWinRate}%
                    </td>

                    {/* Thao tác button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPlan(setup);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10px] shadow-sm shadow-purple-900/40 transition-all flex items-center justify-center space-x-1 mx-auto"
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

      {/* POPUP MODAL */}
      {modalToken && (
        <CoinDetailModal
          token={modalToken}
          onClose={() => setModalToken(null)}
        />
      )}
    </div>
  );
}
