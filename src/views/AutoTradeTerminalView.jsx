import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
  RotateCcw,
  Play,
  Pause,
  DollarSign,
  Award,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Power,
  RefreshCw,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  loadDemoAccount,
  saveDemoAccount,
  resetDemoAccount,
  openDemoPosition,
  closeDemoPosition,
  updateDemoPositionsWithLivePrices,
  runDemoAutoTradeScanner,
  updateDemoBotSettings,
} from '../modules/demoTradingEngine';
import {
  loadExchangeConfigs,
  saveExchangeConfigs,
  testExchangeConnection,
  emergencyKillSwitchAllExchanges,
  loadTradeExecutionHistory,
} from '../modules/tier1ExchangeTrader';
import { generateLongShortSetup } from '../modules/longShortEngine';

export default function AutoTradeTerminalView({ tokens, onSelectToken }) {
  const { lang, t } = useLanguage();
  const [tradingMode, setTradingMode] = useState('demo'); // 'demo' | 'live'
  
  // DEMO ACCOUNT STATE
  const [demoState, setDemoState] = useState(() => loadDemoAccount());
  const [botNotification, setBotNotification] = useState(null);
  const [showBotSettings, setShowBotSettings] = useState(true);
  const [botMarginInput, setBotMarginInput] = useState(demoState.botMaxMarginPerTrade || 200);

  useEffect(() => {
    setBotMarginInput(demoState.botMaxMarginPerTrade || 200);
  }, [demoState.botMaxMarginPerTrade]);

  const handleUpdateBotSetting = (field, value) => {
    setDemoState((prev) => {
      const updated = updateDemoBotSettings(prev, { [field]: value });
      return updated;
    });
  };

  // MANUAL DEMO TRADE STATE
  const [manualSymbol, setManualSymbol] = useState(tokens[0]?.symbol || 'ENA');
  const [manualDirection, setManualDirection] = useState('LONG');
  const [manualMargin, setManualMargin] = useState(200);
  const [manualLeverage, setManualLeverage] = useState(5);
  const [manualFeedback, setManualFeedback] = useState(null);

  // TOKEN ĐANG CHỌN & SETUP TÍN HIỆU RADAR THỜI GIAN THỰC
  const selectedManualToken = tokens.find((t) => t.symbol.toUpperCase() === manualSymbol.toUpperCase()) || tokens[0];
  const currentRadarSetup = React.useMemo(() => {
    if (!selectedManualToken) return null;
    try {
      return generateLongShortSetup(selectedManualToken);
    } catch {
      return null;
    }
  }, [selectedManualToken]);

  // TỰ ĐỘNG ĐỒNG BỘ HƯỚNG ĐÁNH (LONG/SHORT) THEO TÍN HIỆU RADAR KHI CHỌN HOẶC ĐỔI COIN
  useEffect(() => {
    if (currentRadarSetup && (currentRadarSetup.direction === 'LONG' || currentRadarSetup.direction === 'SHORT')) {
      setManualDirection(currentRadarSetup.direction);
    }
  }, [manualSymbol]);

  // LIVE TIER-1 EXCHANGES STATE
  const [exchangeConfigs, setExchangeConfigs] = useState(() => loadExchangeConfigs());
  const [activeExTab, setActiveExTab] = useState('binance');
  const [isTestingEx, setIsTestingEx] = useState(false);
  const [testExResult, setTestExResult] = useState(null);
  const [liveTradeLogs, setLiveTradeLogs] = useState(() => loadTradeExecutionHistory());
  const [killSwitchLogs, setKillSwitchLogs] = useState(null);

  // CẬP NHẬT GIÁ LIVE VÀ TỰ ĐỘNG CHỐT LỜI/CẮT LỖ CHO CÁC VỊ THẾ DEMO
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoState((prev) => {
        // Cập nhật giá & kiểm tra TP/SL
        const { state: updatedWithPrices, triggeredAlerts } = updateDemoPositionsWithLivePrices(prev, tokens);
        
        // Nếu Bot Auto-Trade đang bật thì quét tìm kèo mới
        let finalState = updatedWithPrices;
        if (updatedWithPrices.autoTradeBotActive) {
          const { state: updatedWithBot, newPositionsOpened } = runDemoAutoTradeScanner(updatedWithPrices, tokens);
          finalState = updatedWithBot;
          if (newPositionsOpened.length > 0) {
            setBotNotification(newPositionsOpened[0]);
            setTimeout(() => setBotNotification(null), 5000);
          }
        }

        if (triggeredAlerts.length > 0) {
          setBotNotification(triggeredAlerts[0]);
          setTimeout(() => setBotNotification(null), 5000);
        }

        return finalState;
      });
    }, 2500); // Quét mỗi 2.5s

    return () => clearInterval(interval);
  }, [tokens]);

  // TOGGLE BOT AUTO-TRADE DEMO
  const handleToggleDemoBot = () => {
    setDemoState((prev) => {
      const nextActive = !prev.autoTradeBotActive;
      const updated = { ...prev, autoTradeBotActive: nextActive };
      saveDemoAccount(updated);
      setBotNotification(
        nextActive
          ? `🤖 Bot Auto-Trade Demo đã BẬT: Đang tự động quét kèo Win Rate ≥ ${updated.botMinWinRate}% (Ký quỹ $${updated.botMaxMarginPerTrade} USD/lệnh, đòn bẩy ${updated.botMaxLeverage || 5}x)!`
          : '⚪ Bot Auto-Trade Demo đã TẮT.'
      );
      setTimeout(() => setBotNotification(null), 4000);
      return updated;
    });
  };

  // RESET VỐN ẢO DEMO VỀ $10,000
  const handleResetDemo = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm mới và nạp lại $10,000 USD vốn ảo ban đầu không?')) {
      const fresh = resetDemoAccount();
      setDemoState(fresh);
      setBotNotification('✅ Đã nạp lại $10,000.00 USD vốn Demo ảo!');
      setTimeout(() => setBotNotification(null), 3000);
    }
  };

  // ĐÓNG TẤT CẢ VỊ THẾ DEMO
  const handleCloseAllDemo = () => {
    if (demoState.positions.length === 0) return;
    if (window.confirm('Đóng toàn bộ các vị thế Demo đang mở?')) {
      let cur = { ...demoState };
      demoState.positions.forEach((p) => {
        const res = closeDemoPosition(cur, p.id, p.currentPrice, 'EMERGENCY_KILL');
        cur = res.state;
      });
      setDemoState(cur);
      setBotNotification('✅ Đã đóng toàn bộ vị thế Demo thành công!');
      setTimeout(() => setBotNotification(null), 3000);
    }
  };

  // MỞ LỆNH DEMO THỦ CÔNG
  const handleOpenManualDemo = () => {
    const targetToken = tokens.find((t) => t.symbol.toUpperCase() === manualSymbol.toUpperCase()) || tokens[0];
    const price = targetToken.priceUsd;
    const isLong = manualDirection === 'LONG';
    
    let sl = isLong ? price * 0.98 : price * 1.02;
    let tp1 = isLong ? price * 1.05 : price * 0.95;
    let tp2 = isLong ? price * 1.12 : price * 0.88;
    let winRate = 75;
    let timeframe = 'M15';
    let reason = 'Khớp lệnh thủ công nhanh qua Auto-Trade Demo Terminal';

    try {
      const setup = generateLongShortSetup(targetToken);
      if (setup) {
        sl = setup.stopLoss;
        tp1 = setup.takeProfit1;
        tp2 = setup.takeProfit2;
        winRate = setup.estimatedWinRate;
        timeframe = setup.timeframe.split(' ')[0];
        reason = `Tín hiệu ${setup.direction} (${setup.riskRewardRatio} R:R) - ${setup.reason}`;
      }
    } catch (e) {}

    const marginAmount = Number(manualMargin) || 100;

    const res = openDemoPosition(demoState, {
      tokenSymbol: targetToken.symbol,
      tokenName: targetToken.name,
      direction: manualDirection,
      entryPrice: price,
      leverage: manualLeverage,
      marginUsd: marginAmount,
      stopLossPrice: sl,
      takeProfit1Price: tp1,
      takeProfit2Price: tp2,
      winRate: winRate,
      timeframe: timeframe,
      reason: reason,
    });

    setDemoState(res.state);
    setManualFeedback(res.message);
    setTimeout(() => setManualFeedback(null), 4000);
  };

  // LIVE EXCHANGES HANDLERS
  const handleUpdateExConfig = (field, value) => {
    setExchangeConfigs((prev) => {
      const updated = {
        ...prev,
        [activeExTab]: {
          ...prev[activeExTab],
          [field]: value,
        },
      };
      saveExchangeConfigs(updated);
      return updated;
    });
  };

  const handleTestExchange = async () => {
    const currentCfg = exchangeConfigs[activeExTab];
    setIsTestingEx(true);
    setTestExResult(null);
    try {
      const res = await testExchangeConnection(currentCfg);
      setTestExResult(res);
    } catch (e) {
      setTestExResult({
        exchange: activeExTab,
        connected: false,
        balanceUsdt: 0,
        availableMarginUsdt: 0,
        unrealizedPnlUsdt: 0,
        latencyMs: 0,
        error: e.message || 'Lỗi kết nối',
      });
    } finally {
      setIsTestingEx(false);
    }
  };

  const handleLiveKillSwitch = async () => {
    if (window.confirm('HÀNH ĐỘNG KHẨN CẤP: Hủy toàn bộ lệnh và đóng các vị thế trên sàn thật?')) {
      const logs = await emergencyKillSwitchAllExchanges(exchangeConfigs);
      setKillSwitchLogs(logs);
      setLiveTradeLogs(loadTradeExecutionHistory());
      setTimeout(() => setKillSwitchLogs(null), 6000);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. HEADER BANNER VỚI NÚT CHUYỂN ĐỔI CHẾ ĐỘ DEMO / LIVE */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-[#0e163b] to-[#090d20] border border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 border border-cyan-400/50 flex items-center justify-center text-white shadow-xl shadow-cyan-900/40">
            <Cpu className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {lang === 'en' ? 'Auto-Trade Terminal & Demo Futures' : 'Trung Tâm Auto-Trade & Đánh Demo Không Cần Tài Khoản'}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                tradingMode === 'demo'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                  : 'bg-amber-950 text-amber-300 border-amber-500/60'
              }`}>
                {tradingMode === 'demo' ? '🧪 DEMO $10K VỐN ẢO' : '⚡ SÀN THẬT TIER-1'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {tradingMode === 'demo'
                ? 'Giao dịch phái sinh mô phỏng với dữ liệu giá on-chain thực tế. 100% không cần tài khoản, không cần API Key, không sợ mất tiền.'
                : 'Kết nối API trực tiếp tới Binance, Bybit, OKX, Bitget để mở vị thế Long/Short tự động theo thuật toán Radar.'}
            </p>
          </div>
        </div>

        {/* BỘ CHUYỂN ĐỔI CHẾ ĐỘ GIAO DỊCH (DEMO vs LIVE) */}
        <div className="flex items-center p-1 bg-[#060914] rounded-xl border border-[#1d2954] shadow-inner">
          <button
            type="button"
            onClick={() => setTradingMode('demo')}
            className={`px-3.5 py-1.5 rounded-lg font-black text-xs transition-all flex items-center space-x-1.5 ${
              tradingMode === 'demo'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🧪</span>
            <span>Trade Demo (Không Cần Nick)</span>
          </button>

          <button
            type="button"
            onClick={() => setTradingMode('live')}
            className={`px-3.5 py-1.5 rounded-lg font-black text-xs transition-all flex items-center space-x-1.5 ${
              tradingMode === 'live'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>Live Sàn Thật (API Key)</span>
          </button>
        </div>
      </div>

      {/* THÔNG BÁO TỪ BOT AUTO-TRADE */}
      {botNotification && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border border-cyan-400/60 text-cyan-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>{botNotification}</span>
          </div>
          <button onClick={() => setBotNotification(null)} className="text-slate-400 hover:text-white text-xs px-2">✕</button>
        </div>
      )}

      {/* ========================================================= */}
      {/* PHÂN VÙNG 1: CHẾ ĐỘ DEMO (KHÔNG CẦN TÀI KHOẢN, $10,000 ẢO) */}
      {/* ========================================================= */}
      {tradingMode === 'demo' && (
        <div className="space-y-4">
          {/* 4 Thẻ thống kê tài khoản Demo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-3.5 shadow-lg bg-gradient-to-br from-indigo-950/20 to-[#0b1021]">
              <div className="text-[11px] text-slate-400 font-medium">Tổng Tài Sản Demo (Equity)</div>
              <div className="text-xl font-black text-white mt-0.5 font-mono">
                ${demoState.equityUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Vốn ảo ban đầu: $10,000.00 USD</div>
            </div>

            <div className="bg-[#0b1021]/80 border border-emerald-500/30 rounded-xl p-3.5 shadow-lg bg-gradient-to-br from-emerald-950/20 to-[#0b1021]">
              <div className="text-[11px] text-emerald-300 font-medium">Tiền Mặt Khả Dụng (Available)</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5 font-mono">
                ${demoState.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Đang ký quỹ: ${demoState.usedMarginUsd} USD</div>
            </div>

            <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-3.5 shadow-lg">
              <div className="text-[11px] text-slate-400 font-medium">Lãi/Lỗ Thực Tế (Realized PnL)</div>
              <div className={`text-xl font-black mt-0.5 font-mono ${demoState.totalRealizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {demoState.totalRealizedPnlUsd >= 0 ? '+' : ''}${demoState.totalRealizedPnlUsd.toFixed(2)} USD
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">PnL thả nổi (Unrealized): {demoState.totalUnrealizedPnlUsd >= 0 ? '+' : ''}${demoState.totalUnrealizedPnlUsd.toFixed(2)}</div>
            </div>

            <div className="bg-[#0b1021]/80 border border-purple-500/30 rounded-xl p-3.5 shadow-lg bg-gradient-to-br from-purple-950/20 to-[#0b1021]">
              <div className="text-[11px] text-purple-300 font-medium">Tỷ Lệ Thắng (Win Rate)</div>
              <div className="text-xl font-black text-purple-300 mt-0.5 font-mono">
                {demoState.winRatePercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {demoState.winningTradesCount} Thắng / {demoState.losingTradesCount} Thua ({demoState.totalTradesCount} Lệnh)
              </div>
            </div>
          </div>

          {/* Thanh công cụ Bot Demo & Điều khiển Vốn */}
          <div className="bg-[#090d1e] border border-[#17203d] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleDemoBot}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg flex items-center space-x-2 ${
                  demoState.autoTradeBotActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-950/60 ring-2 ring-emerald-400'
                    : 'bg-[#12193b] text-slate-400 border border-[#212e5e] hover:text-white'
                }`}
              >
                {demoState.autoTradeBotActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{demoState.autoTradeBotActive ? '🤖 BOT AUTO-TRADE: ĐANG CHẠY' : '🤖 BẬT BOT AUTO-TRADE DEMO'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBotSettings(!showBotSettings)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                  showBotSettings
                    ? 'bg-purple-950/80 text-purple-300 border-purple-500/60 shadow-lg ring-1 ring-purple-500/30'
                    : 'bg-[#141b38] hover:bg-[#1a2550] text-slate-300 border-[#222f5e]'
                }`}
                title="Mở hoặc thu gọn bảng cài đặt thông số Auto-Trade"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Cài Đặt Bot Auto-Trade</span>
                <span className="text-[10px] text-purple-300/80 bg-purple-900/50 px-1.5 py-0.5 rounded font-mono">
                  {showBotSettings ? '▲ Đóng' : '▼ Sửa Win Rate / Số Tiền'}
                </span>
              </button>

              <div className="text-xs text-slate-400 hidden xl:flex items-center space-x-2 bg-[#060a1a] px-3 py-1.5 rounded-xl border border-[#162044]">
                <span>Quét:</span>
                <span className="text-emerald-400 font-bold">Win Rate ≥ {demoState.botMinWinRate}%</span>
                <span>•</span>
                <span className="text-amber-300 font-bold">${demoState.botMaxMarginPerTrade} USD/lệnh</span>
                <span>•</span>
                <span className="text-cyan-300 font-bold">{demoState.botMaxLeverage || 5}x</span>
                <span>•</span>
                <span className="text-purple-300 font-bold">Tối đa {demoState.botMaxOpenPositions || 3} lệnh</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetDemo}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#141b38] hover:bg-[#1a2550] text-cyan-300 border border-cyan-800/40 transition-colors flex items-center space-x-1"
                title="Làm mới lại số dư về $10,000 USD ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nạp Lại $10,000 Vốn Ảo</span>
              </button>

              <button
                type="button"
                onClick={handleCloseAllDemo}
                disabled={demoState.positions.length === 0}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors flex items-center space-x-1 disabled:opacity-40"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Đóng Tất Cả Lệnh Demo</span>
              </button>
            </div>
          </div>

          {/* BẢNG CÀI ĐẶT CẤU HÌNH AUTO-TRADE (BOT PARAMETERS SETUP) */}
          {showBotSettings && (
            <div className="bg-gradient-to-br from-[#0c132c] via-[#090f24] to-[#070b1a] border border-purple-900/50 rounded-2xl p-4 shadow-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1b2650]">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-500/30">
                    <Sliders className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <span>Cài Đặt Cấu Hình Bot Auto-Trade (Parameters Setup)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Tùy chỉnh số tiền ký quỹ, ngưỡng Win Rate tối thiểu, đòn bẩy và điều kiện quét lệnh tự động.
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800/40 font-semibold">
                  ⚡ Thông số lưu tự động & áp dụng ngay cho Bot
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {/* 1. SỐ TIỀN VÀO MỖI LỆNH (MARGIN USD) */}
                <div className="space-y-1.5 bg-[#060918] p-3 rounded-xl border border-[#172147]">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">Tiền Ký Quỹ / Lệnh</label>
                    <span className="text-amber-400 font-mono font-bold">${demoState.botMaxMarginPerTrade} USD</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      min="10"
                      step="50"
                      value={botMarginInput}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setBotMarginInput('');
                        } else {
                          const n = parseFloat(val);
                          setBotMarginInput(isNaN(n) ? '' : n);
                          if (!isNaN(n) && n > 0) {
                            handleUpdateBotSetting('botMaxMarginPerTrade', n);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (botMarginInput === '' || Number(botMarginInput) <= 0) {
                          setBotMarginInput(200);
                          handleUpdateBotSetting('botMaxMarginPerTrade', 200);
                        }
                      }}
                      className="w-full bg-[#090e24] border border-[#1d2955] rounded-xl pl-6 pr-2 py-1.5 text-white font-mono font-bold outline-none focus:border-purple-500 transition-colors"
                      placeholder="200"
                    />
                  </div>
                  {/* Phím chọn nhanh */}
                  <div className="flex items-center space-x-1 pt-0.5">
                    {[50, 100, 200, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setBotMarginInput(amt);
                          handleUpdateBotSetting('botMaxMarginPerTrade', amt);
                        }}
                        className={`flex-1 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                          demoState.botMaxMarginPerTrade === amt
                            ? 'bg-purple-600 text-white shadow ring-1 ring-purple-300'
                            : 'bg-[#101738] text-slate-400 hover:text-white'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. NGƯỠNG WIN RATE TỐI THIỂU */}
                <div className="space-y-1.5 bg-[#060918] p-3 rounded-xl border border-[#172147]">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">Ngưỡng Win Rate</label>
                    <span className="text-emerald-400 font-mono font-bold">≥ {demoState.botMinWinRate}%</span>
                  </div>
                  <select
                    value={demoState.botMinWinRate}
                    onChange={(e) => handleUpdateBotSetting('botMinWinRate', Number(e.target.value))}
                    className="w-full bg-[#090e24] border border-[#1d2955] rounded-xl px-2.5 py-1.5 text-white font-mono outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="65">≥ 65% (Nhiều tín hiệu hơn)</option>
                    <option value="70">≥ 70% (Chuẩn mực)</option>
                    <option value="75">≥ 75% (Khuyên dùng - Chọn lọc)</option>
                    <option value="80">≥ 80% (Siêu khắt khe)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Chỉ vào lệnh khi Radar ước tính xác suất thắng đạt ngưỡng này.
                  </p>
                </div>

                {/* 3. KHÓA ĐÒN BẨY TỐI ĐA */}
                <div className="space-y-1.5 bg-[#060918] p-3 rounded-xl border border-[#172147]">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">Đòn Bẩy Tối Đa</label>
                    <span className="text-cyan-300 font-mono font-bold">{demoState.botMaxLeverage || 5}x</span>
                  </div>
                  <select
                    value={demoState.botMaxLeverage || 5}
                    onChange={(e) => handleUpdateBotSetting('botMaxLeverage', Number(e.target.value))}
                    className="w-full bg-[#090e24] border border-[#1d2955] rounded-xl px-2.5 py-1.5 text-white font-mono outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="2">2x (Cực an toàn)</option>
                    <option value="3">3x (Khuyên dùng)</option>
                    <option value="5">5x (Tiêu chuẩn)</option>
                    <option value="10">10x (Biến động nhanh)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Giới hạn đòn bẩy tối đa để kiểm soát rủi ro thanh lý vốn.
                  </p>
                </div>

                {/* 4. SỐ VỊ THẾ MỞ TỐI ĐA CÙNG LÚC */}
                <div className="space-y-1.5 bg-[#060918] p-3 rounded-xl border border-[#172147]">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">Số Lệnh Tối Đa</label>
                    <span className="text-purple-300 font-mono font-bold">{demoState.botMaxOpenPositions || 3} Lệnh</span>
                  </div>
                  <select
                    value={demoState.botMaxOpenPositions || 3}
                    onChange={(e) => handleUpdateBotSetting('botMaxOpenPositions', Number(e.target.value))}
                    className="w-full bg-[#090e24] border border-[#1d2955] rounded-xl px-2.5 py-1.5 text-white font-mono outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="1">1 lệnh (Quản trị tập trung)</option>
                    <option value="2">2 lệnh</option>
                    <option value="3">3 lệnh (Tiêu chuẩn)</option>
                    <option value="5">5 lệnh (Đa dạng hóa danh mục)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Khi đạt số lượng này, bot sẽ dừng mở thêm để chờ chốt lệnh cũ.
                  </p>
                </div>

                {/* 5. BỘ LỌC HƯỚNG ĐÁNH */}
                <div className="space-y-1.5 bg-[#060918] p-3 rounded-xl border border-[#172147]">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">Bộ Lọc Hướng Đánh</label>
                    <span className="text-white font-mono font-bold text-[10px]">
                      {demoState.botDirectionFilter === 'LONG_ONLY' ? 'Chỉ Long' : demoState.botDirectionFilter === 'SHORT_ONLY' ? 'Chỉ Short' : 'Long & Short'}
                    </span>
                  </div>
                  <select
                    value={demoState.botDirectionFilter || 'ALL'}
                    onChange={(e) => handleUpdateBotSetting('botDirectionFilter', e.target.value)}
                    className="w-full bg-[#090e24] border border-[#1d2955] rounded-xl px-2.5 py-1.5 text-white font-mono outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="ALL">⚡ Cả Long & Short (Khuyên dùng)</option>
                    <option value="LONG_ONLY">🟢 Chỉ Long (Bắt sóng tăng)</option>
                    <option value="SHORT_ONLY">🔴 Chỉ Short (Bắt sóng giảm)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Lọc chỉ bắt kèo theo đúng xu hướng thị trường bạn muốn.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VỊ THẾ DEMO ĐANG MỞ (LIVE POSITIONS TRACKER) */}
          <div className="bg-[#0b1021]/90 border border-[#192345] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#182142] flex items-center justify-between bg-[#0a0f24]">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Vị Thế Đang Mở Thời Gian Thực ({demoState.positions.length} Vị Thế)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Tự động chốt lời TP & cắt lỗ SL theo giá thực</span>
            </div>

            {demoState.positions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-1">
                <div>Chưa có vị thế Demo nào đang mở.</div>
                <div className="text-[11px] text-slate-600">
                  Hãy bật nút <strong>"BẬT BOT AUTO-TRADE DEMO"</strong> ở trên hoặc chọn coin bên dưới để tự mở lệnh thử nghiệm!
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0e142a] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#182142]">
                    <tr>
                      <th className="py-2.5 px-3">TÀI SẢN</th>
                      <th className="py-2.5 px-3">HƯỚNG & ĐÒN BẨY</th>
                      <th className="py-2.5 px-3 font-mono">GIÁ VÀO (ENTRY)</th>
                      <th className="py-2.5 px-3 font-mono">GIÁ HIỆN TẠI</th>
                      <th className="py-2.5 px-3 font-mono">KÝ QUỸ (MARGIN)</th>
                      <th className="py-2.5 px-3 font-mono">TP1 / SL CÀI SẴN</th>
                      <th className="py-2.5 px-3 font-mono text-right">LÃI / LỖ (PNL & ROE)</th>
                      <th className="py-2.5 px-3 text-center">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161f3d]">
                    {demoState.positions.map((pos) => {
                      const isProfit = pos.unrealizedPnlUsd >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-[#121833] transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-white">{pos.tokenSymbol}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[90px]">{pos.tokenName}</div>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              pos.direction === 'LONG'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                                : 'bg-rose-950 text-rose-300 border-rose-600'
                            }`}>
                              {pos.direction} {pos.leverage}x
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-white">
                            ${pos.entryPrice < 0.01 ? pos.entryPrice.toFixed(6) : pos.entryPrice.toFixed(4)}
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                            ${pos.currentPrice < 0.01 ? pos.currentPrice.toFixed(6) : pos.currentPrice.toFixed(4)}
                          </td>

                          <td className="py-3 px-3 font-mono text-slate-200">
                            ${pos.marginUsd} USD
                          </td>

                          <td className="py-3 px-3 font-mono text-[11px]">
                            <div className="text-emerald-400">TP: ${pos.takeProfit1Price < 0.01 ? pos.takeProfit1Price.toFixed(6) : pos.takeProfit1Price.toFixed(4)}</div>
                            <div className="text-rose-400 text-[10px]">SL: ${pos.stopLossPrice < 0.01 ? pos.stopLossPrice.toFixed(6) : pos.stopLossPrice.toFixed(4)}</div>
                          </td>

                          <td className="py-3 px-3 font-mono text-right font-black">
                            <div className={`text-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfit ? '+' : ''}${pos.unrealizedPnlUsd.toFixed(2)} USD
                            </div>
                            <div className={`text-[10px] ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfit ? '+' : ''}{pos.unrealizedRoePercent.toFixed(1)}% ROE
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const res = closeDemoPosition(demoState, pos.id, pos.currentPrice, 'MANUAL_CLOSE');
                                setDemoState(res.state);
                                setBotNotification(res.message);
                                setTimeout(() => setBotNotification(null), 3500);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                              Đóng Lệnh
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ĐẶT LỆNH DEMO THỦ CÔNG NHANH */}
          <div className="bg-[#090d1e] border border-[#17203d] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#141b36]">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              <span>Thử Nghiệm Mở Vị Thế Demo Thủ Công (Tùy Chọn Coin)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Chọn Token</label>
                <select
                  value={manualSymbol}
                  onChange={(e) => {
                    const sym = e.target.value;
                    setManualSymbol(sym);
                    const tok = tokens.find((t) => t.symbol.toUpperCase() === sym.toUpperCase());
                    if (tok) {
                      try {
                        const s = generateLongShortSetup(tok);
                        if (s && (s.direction === 'LONG' || s.direction === 'SHORT')) {
                          setManualDirection(s.direction);
                        }
                      } catch (err) {}
                    }
                  }}
                  className="w-full bg-[#060914] border border-[#1b2545] rounded-xl px-2.5 py-1.5 text-white font-mono outline-none"
                >
                  {tokens.slice(0, 40).map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} - ${t.priceUsd < 0.01 ? t.priceUsd.toFixed(6) : t.priceUsd.toFixed(3)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">Hướng Đánh</label>
                  {currentRadarSetup && (
                    <button
                      type="button"
                      onClick={() => setManualDirection(currentRadarSetup.direction)}
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded transition-all flex items-center space-x-1 ${
                        currentRadarSetup.direction === 'LONG'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/40 hover:bg-rose-900'
                      }`}
                      title="Nhấn để đặt theo tín hiệu Radar tự động"
                    >
                      <span>🎯 {currentRadarSetup.direction} ({currentRadarSetup.estimatedWinRate}%)</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setManualDirection('LONG')}
                    className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all ${
                      manualDirection === 'LONG'
                        ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400/50'
                        : 'bg-[#060914] text-slate-400 hover:text-white'
                    }`}
                  >
                    LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualDirection('SHORT')}
                    className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all ${
                      manualDirection === 'SHORT'
                        ? 'bg-rose-600 text-white shadow ring-2 ring-rose-400/50'
                        : 'bg-[#060914] text-slate-400 hover:text-white'
                    }`}
                  >
                    SHORT
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tiền Margin (USD Ảo)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    step="50"
                    value={manualMargin}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setManualMargin('');
                      } else {
                        const n = parseFloat(val);
                        setManualMargin(isNaN(n) ? '' : n);
                      }
                    }}
                    onBlur={() => {
                      if (manualMargin === '' || Number(manualMargin) <= 0) {
                        setManualMargin(100);
                      }
                    }}
                    className="w-full bg-[#060914] border border-[#1b2545] rounded-xl pl-6 pr-2 py-1.5 text-white font-mono font-bold outline-none focus:border-purple-500 transition-colors"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Đòn Bẩy (Leverage)</label>
                <select
                  value={manualLeverage}
                  onChange={(e) => setManualLeverage(Number(e.target.value))}
                  className="w-full bg-[#060914] border border-[#1b2545] rounded-xl px-2.5 py-1.5 text-white font-mono outline-none"
                >
                  <option value="2">2x</option>
                  <option value="3">3x</option>
                  <option value="5">5x (Tiêu chuẩn)</option>
                  <option value="10">10x</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleOpenManualDemo}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-1"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Vào Lệnh Demo</span>
                </button>
              </div>
            </div>

            {manualFeedback && (
              <div className="text-xs font-semibold text-emerald-300 p-2 rounded-lg bg-emerald-950/50 border border-emerald-600/40">
                {manualFeedback}
              </div>
            )}
          </div>

          {/* NHẬT KÝ LỆNH DEMO ĐÃ ĐÓNG (HISTORY) */}
          {demoState.history.length > 0 && (
            <div className="bg-[#0b1021]/80 border border-[#192345] rounded-2xl p-4 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-[#141b36]">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Nhật Ký Các Lệnh Demo Đã Đóng ({demoState.history.length} Lệnh)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Lịch sử kết toán PnL</span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {demoState.history.slice(0, 15).map((h, i) => {
                  const isProfit = h.realizedPnlUsd >= 0;
                  return (
                    <div key={i} className="p-2.5 rounded-xl bg-[#080d1e] border border-[#151e3b] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.2 rounded font-black text-[10px] ${
                          h.direction === 'LONG' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-rose-950 text-rose-300 border border-rose-600'
                        }`}>
                          {h.direction} {h.leverage}x
                        </span>
                        <span className="font-bold text-white font-sans">{h.tokenSymbol}</span>
                        <span className="text-slate-400 text-[10px]">
                          Vào: ${h.entryPrice < 0.01 ? h.entryPrice.toFixed(6) : h.entryPrice.toFixed(4)} ➔ Thoát: ${h.exitPrice < 0.01 ? h.exitPrice.toFixed(6) : h.exitPrice.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="text-slate-400">Margin: ${h.marginUsd}</span>
                        <span className={`font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}${h.realizedPnlUsd.toFixed(2)} USD ({isProfit ? '+' : ''}{h.realizedRoePercent.toFixed(1)}%)
                        </span>
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-black/40 text-slate-400">
                          {h.closeReason === 'TAKE_PROFIT_1' ? '🎯 TP1' : h.closeReason === 'STOP_LOSS' ? '🛑 SL' : 'Đóng tay'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* PHÂN VÙNG 2: CHẾ ĐỘ LIVE SÀN THẬT (API KEY TIER-1) */}
      {/* ========================================================= */}
      {tradingMode === 'live' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start space-x-2.5 text-xs text-amber-200/90 leading-relaxed">
            <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>BẢO MẬT TÀI SẢN:</strong> Kết nối qua cổng API chính thức của sàn. Chỉ bật quyền <strong>"Đọc"</strong> và <strong>"Kích hoạt Futures"</strong>. <strong>TUYỆT ĐỐI KHÔNG BẬT QUYỀN RÚT TIỀN (Withdrawals)</strong>. Tiền của bạn luôn nằm an toàn 100% trên sàn.
            </div>
          </div>

          {/* 4 Tabs Sàn Tier-1 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'binance', label: 'Binance Futures', icon: '🟡', badge: 'USDT-M' },
              { id: 'bybit', label: 'Bybit V5', icon: '🟠', badge: 'Linear' },
              { id: 'okx', label: 'OKX V5', icon: '🔵', badge: 'Swap' },
              { id: 'bitget', label: 'Bitget V2', icon: '🔷', badge: 'Mix' },
            ].map((tab) => {
              const isSelected = activeExTab === tab.id;
              const cfg = exchangeConfigs[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveExTab(tab.id);
                    setTestExResult(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#141b38] border-amber-500 shadow-md shadow-amber-950/50 ring-1 ring-amber-500/50'
                      : 'bg-[#090d1c] border-[#1b2545] text-slate-400 hover:text-white hover:bg-[#10162e]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center space-x-1.5">
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </span>
                    <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-amber-300">{tab.badge}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className={cfg.autoTradeEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {cfg.autoTradeEnabled ? '🟢 Đang Bật Live' : '⚪ Tắt Auto'}
                    </span>
                    <span className={cfg.apiKey ? 'text-cyan-400 font-mono' : 'text-slate-600'}>
                      {cfg.apiKey ? '✓ Đã có Key' : 'Chưa có Key'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cấu hình chi tiết sàn được chọn */}
          {(() => {
            const currentCfg = exchangeConfigs[activeExTab];
            return (
              <div className="bg-[#090d1e] border border-[#17203d] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#141b36]">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                      <span>Cấu hình {currentCfg.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#121938] border border-cyan-800/40 text-cyan-300 font-mono">
                        {currentCfg.isTestnet ? 'Testnet' : 'Live Production'}
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentCfg.autoTradeEnabled}
                        onChange={(e) => handleUpdateExConfig('autoTradeEnabled', e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className={currentCfg.autoTradeEnabled ? 'text-emerald-400 font-black' : 'text-slate-400'}>
                        Kích Hoạt Auto-Trade Sàn Thật
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleLiveKillSwitch}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/50 transition-colors flex items-center space-x-1"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Kill-Switch</span>
                    </button>
                  </div>
                </div>

                {killSwitchLogs && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl space-y-1 text-xs text-rose-200">
                    <div className="font-bold">⚠️ Trạng thái ngắt khẩn cấp:</div>
                    {killSwitchLogs.map((log, i) => (
                      <div key={i} className="font-mono text-[11px]">• {log}</div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">{currentCfg.name} API Key</label>
                    <input
                      type="text"
                      placeholder="Dán API Key..."
                      value={currentCfg.apiKey}
                      onChange={(e) => handleUpdateExConfig('apiKey', e.target.value.trim())}
                      className="w-full bg-[#060914] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white placeholder-slate-600 outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">API Secret Key</label>
                    <input
                      type="password"
                      placeholder="Dán Secret Key bí mật..."
                      value={currentCfg.secretKey}
                      onChange={(e) => handleUpdateExConfig('secretKey', e.target.value.trim())}
                      className="w-full bg-[#060914] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white placeholder-slate-600 outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  {(activeExTab === 'okx' || activeExTab === 'bitget') && (
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">Passphrase (Mật khẩu API)</label>
                      <input
                        type="password"
                        placeholder="Mật khẩu bạn đặt lúc tạo API..."
                        value={currentCfg.passphrase || ''}
                        onChange={(e) => handleUpdateExConfig('passphrase', e.target.value.trim())}
                        className="w-full bg-[#060914] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white placeholder-slate-600 outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Môi Trường</label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateExConfig('isTestnet', false)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex-1 ${
                          !currentCfg.isTestnet
                            ? 'bg-amber-500 text-black font-extrabold shadow'
                            : 'bg-[#10162e] text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚡ Live Production (Tài khoản thật)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateExConfig('isTestnet', true)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex-1 ${
                          currentCfg.isTestnet
                            ? 'bg-indigo-600 text-white font-extrabold shadow'
                            : 'bg-[#10162e] text-slate-400 hover:text-white'
                        }`}
                      >
                        🧪 Testnet
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quản lý vốn sàn thật */}
                <div className="p-3 bg-[#060914] rounded-xl border border-[#161f3d] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Ký Quỹ Tối Đa / Lệnh</label>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-500 font-bold">$</span>
                      <input
                        type="number"
                        min="1"
                        step="10"
                        value={currentCfg.maxMarginPerTradeUsd}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateExConfig('maxMarginPerTradeUsd', val === '' ? '' : (isNaN(parseFloat(val)) ? '' : parseFloat(val)));
                        }}
                        onBlur={() => {
                          if (!currentCfg.maxMarginPerTradeUsd || Number(currentCfg.maxMarginPerTradeUsd) <= 0) {
                            handleUpdateExConfig('maxMarginPerTradeUsd', 100);
                          }
                        }}
                        className="w-full bg-[#090d1e] border border-[#1b2545] rounded-lg px-2 py-1 text-white font-mono outline-none focus:border-amber-500 transition-colors"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Khóa Đòn Bẩy Tối Đa</label>
                    <select
                      value={currentCfg.maxLeverage}
                      onChange={(e) => handleUpdateExConfig('maxLeverage', Number(e.target.value))}
                      className="w-full bg-[#090d1e] border border-[#1b2545] rounded-lg px-2 py-1 text-white font-mono"
                    >
                      <option value="2">2x (Cực an toàn)</option>
                      <option value="3">3x (Khuyên dùng)</option>
                      <option value="5">5x (Tiêu chuẩn)</option>
                      <option value="10">10x</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Ngưỡng Win Rate</label>
                    <select
                      value={currentCfg.minWinRateThreshold}
                      onChange={(e) => handleUpdateExConfig('minWinRateThreshold', Number(e.target.value))}
                      className="w-full bg-[#090d1e] border border-[#1b2545] rounded-lg px-2 py-1 text-white font-mono"
                    >
                      <option value="70">≥ 70%</option>
                      <option value="75">≥ 75% (Chọn lọc cao)</option>
                      <option value="80">≥ 80%</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Số Vị Thế Tối Đa</label>
                    <select
                      value={currentCfg.maxConcurrentPositions}
                      onChange={(e) => handleUpdateExConfig('maxConcurrentPositions', Number(e.target.value))}
                      className="w-full bg-[#090d1e] border border-[#1b2545] rounded-lg px-2 py-1 text-white font-mono"
                    >
                      <option value="1">1 vị thế</option>
                      <option value="2">2 vị thế</option>
                      <option value="3">3 vị thế</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleTestExchange}
                    disabled={isTestingEx}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingEx ? 'animate-spin' : ''}`} />
                    <span>{isTestingEx ? 'Đang kiểm tra kết nối...' : `Kiểm Tra Kết Nối & Số Dư ${currentCfg.name}`}</span>
                  </button>

                  {testExResult && (
                    <div className="text-xs">
                      {testExResult.connected ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono font-bold flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Đã kết nối! Số dư: <strong>${testExResult.balanceUsdt.toLocaleString()} USDT</strong> (Khả dụng: ${testExResult.availableMarginUsdt.toLocaleString()} • {testExResult.latencyMs}ms)</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 font-mono text-[11px] flex items-center space-x-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>{testExResult.error || 'Kết nối thất bại'}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Lịch sử lệnh sàn thật */}
          {liveTradeLogs.length > 0 && (
            <div className="bg-[#090d1e] border border-[#17203d] rounded-2xl p-4 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-[#141b36]">
                <span className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nhật Ký Các Lệnh Đã Thực Thi Trên Sàn Thật ({liveTradeLogs.length} Lệnh)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Tự động cập nhật</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {liveTradeLogs.slice(0, 10).map((trade, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#060914] border border-[#161f38] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.2 rounded font-black text-[10px] ${
                        trade.direction === 'LONG' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-rose-950 text-rose-300 border border-rose-600'
                      }`}>
                        {trade.direction}
                      </span>
                      <span className="font-bold text-white font-sans">{trade.tokenSymbol}</span>
                      <span className="text-amber-400 text-[10px] uppercase font-bold">[{trade.exchange}]</span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px]">
                      <span className="text-slate-300">${trade.marginUsedUsd} USD ({trade.leverage}x)</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        trade.status === 'FILLED' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {trade.status}
                      </span>
                      <span className="text-slate-500 text-[10px]">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
