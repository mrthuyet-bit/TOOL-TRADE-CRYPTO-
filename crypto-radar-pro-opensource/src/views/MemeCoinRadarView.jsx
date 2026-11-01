import React, { useState } from 'react';
import { Radar, Filter, TrendingUp, Flame, ShieldAlert, ArrowUpDown, ExternalLink, Award, Sparkles } from 'lucide-react';
import ChainIcon from '../components/ChainIcon';
import CoinDetailModal from '../components/CoinDetailModal';
import { getAdapter } from '../adapters';
import { useLanguage } from '../i18n/LanguageContext';
import { translateTradeVerdict } from '../i18n/translations';

export default function MemeCoinRadarView({ tokens, onSelectToken }) {
  const { lang, t } = useLanguage();
  const [modalToken, setModalToken] = useState(null);
  const [selectedChain, setSelectedChain] = useState('ALL');
  const [minOpportunityScore, setMinOpportunityScore] = useState(70);
  const [sortBy, setSortBy] = useState('tradeWorthinessRank'); // tradeWorthinessRank, opportunityScore, volume24h

  const filtered = tokens
    .filter((t) => selectedChain === 'ALL' || t.chain.toLowerCase() === selectedChain.toLowerCase())
    .filter((t) => t.opportunityScore >= minOpportunityScore)
    .sort((a, b) => {
      if (sortBy === 'tradeWorthinessRank') {
        return (a.tradeWorthinessRank || 999) - (b.tradeWorthinessRank || 999);
      }
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-[#0b1021] border border-purple-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
            <Radar className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <span>Meme Coin Radar Engine</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-600/50">
                {tokens.filter(t => t.category === 'Meme Coins').length || 124}+ {lang === 'en' ? 'Meme Coins Mcap >= $10M' : 'Meme Coins Vốn Hóa >= $10M'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Early detection of tokens with exploding liquidity, dominant buy ratios, and top trade rank.'
                : 'Phát hiện sớm coin có dòng tiền bùng nổ, tỷ lệ mua áp đảo và xếp hạng con nào đáng giao dịch nhất.'}
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 bg-[#090d1c] p-1 rounded-xl border border-[#1b2545] text-xs">
            {['ALL', 'Solana', 'Ethereum', 'Base', 'BNB Chain'].map((chain) => (
              <button
                key={chain}
                onClick={() => setSelectedChain(chain)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedChain === chain
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {chain === 'ALL' ? (lang === 'en' ? 'All' : 'Tất Cả') : chain}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-300 bg-[#090d1c] px-3 py-1.5 rounded-xl border border-[#1b2545]">
            <span>{lang === 'en' ? 'Min Opp Score:' : 'Lọc điểm:'} &gt;={minOpportunityScore}</span>
            <input
              type="range"
              min="60"
              max="90"
              value={minOpportunityScore}
              onChange={(e) => setMinOpportunityScore(Number(e.target.value))}
              className="w-20 accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Grid danh sách Token theo tín hiệu Radar xếp hạng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((token) => {
          const adapter = getAdapter(token.chain);
          const rank = token.tradeWorthinessRank || 99;

          return (
            <div
              key={token.id}
              onClick={() => {
                if (onSelectToken) onSelectToken(token);
                setModalToken(token);
              }}
              className="bg-[#0b1021]/80 hover:bg-[#0f162e] border border-[#1a2347] hover:border-purple-500/50 rounded-2xl p-4 shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {token.image ? (
                      <img src={token.image} alt={token.symbol} className="w-5 h-5 rounded-full" />
                    ) : (
                      <ChainIcon chain={token.chain} className="w-4 h-4" />
                    )}
                    <span className="text-sm font-extrabold text-white group-hover:text-purple-300 transition-colors">
                      {token.symbol}
                    </span>
                    <span className="text-xs text-slate-400">({token.name})</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                    rank <= 3
                      ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-sm'
                      : rank <= 10
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {lang === 'en' ? `Rank #${rank}` : `Hạng #${rank}`}
                  </span>
                </div>

                <div className="flex items-baseline justify-between py-1">
                  <div className="text-lg font-extrabold text-white font-mono">
                    ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(4)}
                  </div>
                  <div className={`text-xs font-bold font-mono ${token.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {token.change24h > 0 ? `+${token.change24h}%` : `${token.change24h}%`} (24h)
                  </div>
                </div>

                {/* Sàn Niêm Yết Tags */}
                <div className="flex flex-wrap items-center gap-1 my-1.5">
                  {(token.exchanges || []).slice(0, 3).map((ex, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#141b38] text-slate-300 border border-[#222e52]"
                    >
                      {ex}
                    </span>
                  ))}
                  {(token.exchanges?.length || 0) > 3 && (
                    <span className="text-[9px] text-slate-500">
                      +{(token.exchanges?.length || 0) - 3} {lang === 'en' ? 'more' : 'sàn'}
                    </span>
                  )}
                </div>

                {/* Score breakdown bar */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{lang === 'en' ? 'Opp Score:' : 'Điểm Cơ Hội:'} {token.opportunityScore}/100</span>
                    <span className="text-emerald-400 font-semibold">{translateTradeVerdict(token.tradeRecommendation, lang)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#141b38] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                      style={{ width: `${token.opportunityScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#141b36] text-[11px] text-slate-400">
                <span>{lang === 'en' ? 'Market Cap:' : 'Vốn Hóa:'} ${((token.marketCap || token.fdv || 0) / 1e6).toFixed(1)}M</span>
                <span className="text-purple-300 group-hover:underline">{lang === 'en' ? 'View Details →' : 'Soi chi tiết →'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP CHI TIẾT & CHIA VỐN THEO CHU KỲ */}
      {modalToken && (
        <CoinDetailModal
          token={modalToken}
          onClose={() => setModalToken(null)}
        />
      )}
    </div>
  );
}
