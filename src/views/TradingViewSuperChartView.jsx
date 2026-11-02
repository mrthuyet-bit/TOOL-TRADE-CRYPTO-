import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Flame,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import TradingViewSuperChart from '../components/TradingViewSuperChart';
import CoinDetailModal from '../components/CoinDetailModal';
import { generateLongShortSetup } from '../modules/longShortEngine';
import { analyzeWhaleAndRealtimeSocial } from '../modules/whaleInstitutionalEngine';
import { useLanguage } from '../i18n/LanguageContext';
import { translateBacker } from '../i18n/translations';

export default function TradingViewSuperChartView({
  tokens = [],
  selectedToken,
  setSelectedToken,
  onOpenExitRadar,
  onOpenRiskScanner,
}) {
  const { lang, t } = useLanguage();
  const [modalToken, setModalToken] = useState(null);

  const currentToken = selectedToken || (tokens && tokens[0]) || {
    id: 'tok-btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    priceUsd: 77500,
    change24h: 1.25,
    high24h: 78200,
    low24h: 76400,
    volume24h: 850000000,
    marketCap: 1550000000000,
    chain: 'Bitcoin',
  };

  const futuresSetup = generateLongShortSetup(currentToken);
  const whaleInfo = analyzeWhaleAndRealtimeSocial(currentToken);

  return (
    <div className="h-full w-full flex flex-col space-y-3 p-1 min-h-0 overflow-hidden animate-fadeIn">
      
      {/* 1. TOP STATS BAR (TỐI ƯU CỰC KỲ GỌN GÀNG, KHÔNG BỊ TRÀN HAY LẸM) */}
      <div className="p-3 bg-[#0a0e24] border border-[#1a254d] rounded-2xl flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-lg font-black text-white shadow-md flex-shrink-0">
            {currentToken.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-white tracking-tight">{currentToken.name}</h2>
              <span className="text-xs font-mono font-bold text-purple-300">({currentToken.symbol})</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12193b] text-cyan-300 border border-cyan-500/40">
                {currentToken.chain}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
              <span>{lang === 'en' ? 'Signal Rank:' : 'Hạng tín hiệu:'} <strong className="text-amber-300">#{currentToken.tradeScore || 90} {lang === 'en' ? 'Trade Score' : 'Đáng Giao Dịch'}</strong></span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span>🏛️</span>
                <span className="text-slate-300 truncate max-w-[200px]">{translateBacker(whaleInfo.topBackersFormatted, lang)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Signal Pill */}
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${
            futuresSetup.direction === 'LONG'
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
              : 'bg-rose-950/70 text-rose-300 border-rose-500/50'
          }`}>
            <Zap className="w-4 h-4" />
            <div className="text-xs font-black">
              {futuresSetup.direction === 'LONG' ? (lang === 'en' ? '🟢 LONG SETUP' : '🟢 KÈO LONG') : (lang === 'en' ? '🔴 SHORT SETUP' : '🔴 KÈO SHORT')} ({futuresSetup.recommendedLeverage})
            </div>
            <span className="text-[10px] font-mono opacity-80 border-l border-white/20 pl-1.5">
              R:R {futuresSetup.riskRewardRatio}
            </span>
          </div>

          <button
            onClick={() => setModalToken(currentToken)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-900/40 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'en' ? 'DCA Plan & Analysis' : 'Kế Hoạch Chia Vốn & Soi Kèo'}</span>
          </button>
        </div>
      </div>

      {/* 2. SIÊU ĐỒ THỊ TRADINGVIEW (CHIẾM TRỌN DIỆN TÍCH, KHÔNG BỊ LẸM) */}
      <div className="flex-1 w-full min-h-0 relative rounded-2xl overflow-hidden shadow-2xl border border-[#1b254a]">
        <TradingViewSuperChart
          token={currentToken}
          allTokens={tokens}
          onSelectToken={(t) => {
            if (setSelectedToken) setSelectedToken(t);
          }}
          onOpenModal={(t) => setModalToken(t)}
          height="100%"
        />
      </div>

      {/* MODAL CHI TIẾT KHI BẤM NÚT */}
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
