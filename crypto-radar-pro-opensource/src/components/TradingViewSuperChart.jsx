import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Target,
  Maximize2,
  Minimize2,
  Search,
  ChevronDown,
  Shield,
  Flame,
  ArrowRight
} from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import CanvasSuperChart from './CanvasSuperChart';
import ChainIcon from './ChainIcon';
import { useLanguage } from '../i18n/LanguageContext';

export default function TradingViewSuperChart({
  token,
  allTokens = [],
  onSelectToken,
  onOpenModal,
  height = '100%',
}) {
  const { lang, t } = useLanguage();
  const [chartMode, setChartMode] = useState('tradingview'); // 'tradingview' | 'canvas'
  const [timeframe, setTimeframe] = useState('60'); // '1', '5', '15', '60', '240', 'D'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentToken = token || (allTokens && allTokens[0]) || {
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

  const filteredTokens = (allTokens || []).filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  const price = currentToken.priceUsd || 1;
  const change = currentToken.change24h || 0;
  const isUp = change >= 0;

  return (
    <div
      className={`flex flex-col bg-[#070b1c] rounded-2xl border border-[#1b254a] shadow-2xl overflow-hidden transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-2 z-50 bg-[#070b1c]/98 backdrop-blur-2xl ring-2 ring-purple-500'
          : 'w-full h-full min-h-[480px]'
      }`}
      style={{ height: isFullscreen ? 'calc(100vh - 16px)' : height }}
    >
      {/* 1. TOP HEADER & CONTROLS BAR (TỐI ƯU CỰC KỲ GỌN GÀNG, KHÔNG BỊ LẸM) */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#0a0f26] via-[#0d1433] to-[#0a0f26] border-b border-[#182348] flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
        
        {/* Token Selector & Info */}
        <div className="flex items-center space-x-3 relative">
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-[#12193b] hover:bg-[#1a2350] border border-[#233160] transition-colors"
            >
              <ChainIcon chain={currentToken.chain} className="w-4 h-4 flex-shrink-0" />
              <span className="font-extrabold text-sm text-white tracking-wide">{currentToken.symbol}</span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">/ USDT</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Quick Token Dropdown Picker */}
            {searchOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#090e24] border border-[#223060] rounded-xl shadow-2xl p-2 z-50 space-y-2 animate-fadeIn">
                <div className="flex items-center space-x-1.5 bg-[#0e1638] px-2 py-1 rounded-lg border border-[#1b2752]">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'Search token (BTC, SOL, PEPE...)' : 'Tìm coin (BTC, SOL, PEPE...)'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-xs text-white outline-none placeholder-slate-500"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredTokens.map((t) => (
                    <button
                      key={t.id || t.symbol}
                      onClick={() => {
                        if (onSelectToken) onSelectToken(t);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#152047] text-left text-xs transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white font-mono">{t.symbol}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{t.name}</span>
                      </div>
                      <span className={`font-mono text-[11px] font-semibold ${t.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.change24h >= 0 ? `+${t.change24h}%` : `${t.change24h}%`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Coin Quick-Select Badges */}
          <div className="hidden md:flex items-center space-x-1">
            {['BTC', 'ETH', 'SOL', 'NEAR', 'PEPE', 'ENA', 'SUI'].map((sym) => {
              const isActive = currentToken.symbol.toUpperCase() === sym;
              return (
                <button
                  key={sym}
                  onClick={() => {
                    const match = (allTokens || []).find((t) => t.symbol.toUpperCase() === sym);
                    if (match && onSelectToken) onSelectToken(match);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow shadow-purple-900/60'
                      : 'bg-[#101736] text-slate-400 hover:text-white hover:bg-[#162047]'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>

          {/* Live Price Tag */}
          <div className="flex items-baseline space-x-2 pl-2 border-l border-[#1a254d]">
            <span className="text-base sm:text-lg font-black text-white font-mono">
              ${price < 0.01 ? price.toFixed(6) : price < 1 ? price.toFixed(4) : price.toLocaleString()}
            </span>
            <span className={`text-xs font-bold font-mono flex items-center ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {isUp ? `+${change}%` : `${change}%`}
            </span>
          </div>
        </div>

        {/* Right Actions: Switch Modes, Open Modal, Fullscreen */}
        <div className="flex items-center space-x-2 flex-wrap text-xs">
          {/* Dual Mode Switcher: TradingView vs AI Radar Canvas */}
          <div className="flex items-center bg-[#090d20] p-0.5 rounded-xl border border-[#1b264e]">
            <button
              onClick={() => setChartMode('tradingview')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center space-x-1 ${
                chartMode === 'tradingview'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow shadow-blue-900/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={lang === 'en' ? 'Original TradingView chart with 100+ drawing tools and indicators' : 'Đồ thị TradingView gốc với đầy đủ 100+ công cụ vẽ và chỉ báo kỹ thuật'}
            >
              <span>📊 TradingView Pro</span>
            </button>
            <button
              onClick={() => setChartMode('canvas')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center space-x-1 ${
                chartMode === 'canvas'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow shadow-purple-900/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={lang === 'en' ? 'Ultra-smooth internal canvas chart with pre-drawn Long/Short, TP1, TP2, Stop Loss' : 'Đồ thị nến nội bộ siêu mượt có vẽ sẵn Kèo Long/Short, TP1, TP2, Stop Loss'}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{lang === 'en' ? '🎯 AI Radar Signals' : '🎯 Kèo AI Radar'}</span>
            </button>
          </div>

          {/* Quick Action to open modal */}
          {onOpenModal && (
            <button
              onClick={() => onOpenModal(currentToken)}
              className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/70 text-purple-300 border border-purple-500/50 font-bold text-[11px] transition-colors flex items-center space-x-1"
              title={lang === 'en' ? 'Open DCA capital allocation and detailed trade plan' : 'Mở bảng tính chia vốn DCA và kế hoạch Long/Short chi tiết'}
            >
              <span>{lang === 'en' ? 'DCA Plan' : 'Kế Hoạch Chia Vốn'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-[#12193b] hover:bg-[#1a2350] text-slate-400 hover:text-white border border-[#212d59] transition-colors"
            title={isFullscreen ? (lang === 'en' ? 'Exit fullscreen' : 'Thu nhỏ lại') : (lang === 'en' ? 'Fullscreen' : 'Mở toàn màn hình')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. SUPER CHART BODY (CHUẨN FULL CHIỀU CAO, KHÔNG BỊ TRÀN VIỀN / LẸM) */}
      <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden bg-[#080c1d]">
        {chartMode === 'tradingview' ? (
          <TradingViewWidget
            symbol={currentToken.symbol}
            interval={timeframe}
            theme="dark"
          />
        ) : (
          <CanvasSuperChart
            token={currentToken}
            timeframe={timeframe === 'D' ? '1D' : timeframe === '240' ? '4h' : timeframe === '60' ? '1h' : timeframe === '15' ? '15m' : '5m'}
            onTimeframeChange={(tf) => {
              const mapped = tf === '1D' ? 'D' : tf === '4h' ? '240' : tf === '1h' ? '60' : tf === '15m' ? '15' : '5';
              setTimeframe(mapped);
            }}
          />
        )}
      </div>

      {/* 3. BOTTOM QUICK STATS FOOTER BAR */}
      <div className="px-3.5 py-2 bg-[#080c1e] border-t border-[#182348] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 flex-shrink-0">
        <div className="flex items-center space-x-3 font-mono">
          <span>{lang === 'en' ? '24h Vol:' : '24h Vol:'} <strong className="text-white">${((currentToken.volume24h || 50000000) / 1e6).toFixed(1)}M</strong></span>
          <span>{lang === 'en' ? 'Market Cap:' : 'Vốn hóa:'} <strong className="text-cyan-300">${((currentToken.marketCap || 1000000000) / 1e6).toFixed(0)}M</strong></span>
          <span className="hidden sm:inline">24h High: <strong className="text-emerald-400">${(currentToken.high24h || price * 1.05).toFixed(price < 0.01 ? 6 : 4)}</strong></span>
          <span className="hidden sm:inline">24h Low: <strong className="text-rose-400">${(currentToken.low24h || price * 0.95).toFixed(price < 0.01 ? 6 : 4)}</strong></span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span className="text-[10px] text-slate-300">
            {chartMode === 'tradingview'
              ? (lang === 'en' ? 'Verified TradingView Real-Time CEX Feed' : 'Khớp dữ liệu TradingView Real-Time CEX Feed')
              : (lang === 'en' ? 'AI Radar Engine: Pre-computed Entry, TP1, TP2, Stop Loss' : 'AI Radar Engine: Đã vẽ sẵn các vùng Entry, TP1, TP2, Stop Loss')}
          </span>
        </div>
      </div>
    </div>
  );
}
