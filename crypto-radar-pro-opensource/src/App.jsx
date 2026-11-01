import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Radar,
  Compass,
  Wallet,
  ShieldAlert,
  Bell,
  History,
  Sliders,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronDown,
  RefreshCw,
  Award,
  Zap,
  Shield,
  CandlestickChart,
} from 'lucide-react';

// Data & Modules
import { initialDetailedTokens, initialSecurityAlerts } from './data/comprehensiveData';
import { AlertManager } from './modules/alertManager';
import { syncLiveMarketData } from './modules/liveMarketEngine';

// Views
import OverviewView from './views/OverviewView';
import LongShortRadarView from './views/LongShortRadarView';
import TradingViewSuperChartView from './views/TradingViewSuperChartView';
import MemeCoinRadarView from './views/MemeCoinRadarView';
import AIExitRadarView from './views/AIExitRadarView';
import WalletTrackerView from './views/WalletTrackerView';
import RiskScannerView from './views/RiskScannerView';
import AlertCenterView from './views/AlertCenterView';
import BacktestView from './views/BacktestView';
import SettingsView from './views/SettingsView';

// Components
import ChainIcon from './components/ChainIcon';
import { useLanguage } from './i18n/LanguageContext';

export default function App() {
  const { lang, toggleLang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [tokens, setTokens] = useState(initialDetailedTokens);
  const [selectedToken, setSelectedToken] = useState(initialDetailedTokens[0]);
  const [alerts, setAlerts] = useState(initialSecurityAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const alertManagerRef = useRef(new AlertManager(initialSecurityAlerts));

  // Live Clock updater (UTC+7 format)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const vnTime = new Date(utc + 3600000 * 7);
      const hours = String(vnTime.getHours()).padStart(2, '0');
      const minutes = String(vnTime.getMinutes()).padStart(2, '0');
      const seconds = String(vnTime.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds} (UTC+7)`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    showToast('Đang kết nối DEX Screener & GoPlus Security quét dữ liệu trực tiếp...');
    try {
      const updated = await syncLiveMarketData(tokens, (newAlert) => {
        const added = alertManagerRef.current.addAlert(newAlert);
        if (added) {
          setAlerts(alertManagerRef.current.getAllAlerts());
          showToast(`🔔 Cảnh báo mới: ${newAlert.tokenSymbol} - ${newAlert.alertType}`);
        }
      });
      setTokens(updated);
      showToast('✅ Đã cập nhật giá và thứ hạng mới nhất từ on-chain!');
    } catch (e) {
      showToast('⚠️ Không thể cập nhật trực tiếp. Đang sử dụng dữ liệu bộ đệm.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Periodic background check every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      syncLiveMarketData(tokens, (newAlert) => {
        const added = alertManagerRef.current.addAlert(newAlert);
        if (added) {
          setAlerts(alertManagerRef.current.getAllAlerts());
        }
      }).then((updated) => {
        if (updated) setTokens(updated);
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [tokens]);

  const handleOpenExitRadar = (token) => {
    setSelectedToken(token);
    setActiveTab('exit-radar');
  };

  const handleOpenRiskScanner = (token) => {
    setSelectedToken(token);
    setActiveTab('risk-scanner');
  };

  // Filter tokens based on global search input
  const filteredTokens = tokens.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.chain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contractAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.exchanges && t.exchanges.some((ex) => ex.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#070913] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-sm font-medium animate-bounce border border-purple-400/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER (FIXED TOP PINNED) */}
      <header className="h-16 flex-shrink-0 px-5 border-b border-[#141b33] bg-[#090d1c] z-30 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 min-w-[240px]">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0d1224] rounded-[10px] flex items-center justify-center">
              <span className="text-xl">🐱</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#090d1c] animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#090d1c]" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent leading-none">
              {t('appName')}
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
              {t('appSubtitle')}
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-[#10162e] border border-[#1d274b] group-focus-within:border-purple-500/70 group-focus-within:ring-2 group-focus-within:ring-purple-500/20 rounded-xl pl-10 pr-10 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Header Right Status */}
        <div className="flex items-center space-x-3 text-sm">
          {/* Language Switcher Pill */}
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#12193b] hover:bg-[#1a2552] border border-[#233166] hover:border-cyan-500/50 text-xs font-bold transition-all shadow-sm cursor-pointer ring-1 ring-cyan-500/20"
            title={lang === 'vi' ? 'Switch to English interface' : 'Chuyển sang giao diện Tiếng Việt'}
          >
            <span className="text-sm">{lang === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
            <span className="font-mono text-[11px] text-cyan-300 font-black">{lang === 'vi' ? 'VI' : 'EN'}</span>
          </button>

          {/* Live Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 transition-all shadow-sm disabled:opacity-50"
            title="Làm mới trực tiếp từ Binance & CoinGecko"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isSyncing ? t('scanning') : t('liveScan')}</span>
          </button>

          {/* Market Status */}
          <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live DEX Engine</span>
          </div>

          {/* Clock */}
          <div className="hidden sm:block text-xs font-mono font-medium text-slate-400">
            {currentTime || '14:32:17 (UTC+7)'}
          </div>

          {/* Alert Quick Counter */}
          <button
            onClick={() => setActiveTab('alert-center')}
            className="relative cursor-pointer text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
            title="Trung tâm cảnh báo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[#090d1c]">
              {alerts.length}
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'text-purple-400 bg-purple-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Cài đặt hệ thống"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER: 2 PHÂN VÙNG RIÊNG BIỆT (INDEPENDENT SPLIT PANELS) */}
      <div className="flex-1 flex overflow-hidden min-h-0 h-[calc(100vh-4rem)]">
        {/* ========================================================= */}
        {/* PANEL TRÁI: SIDEBAR CỐ ĐỊNH, CUỘN ĐỘC LẬP RIÊNG BIỆT */}
        {/* ========================================================= */}
        <aside className="w-64 flex-shrink-0 h-full bg-[#090d1c] border-r border-[#141b33] p-4 flex flex-col justify-between overflow-y-auto z-10 shadow-xl">
          <div className="space-y-6">
            <nav className="space-y-1">
              {[
                { id: 'overview', label: t('navSafeHold'), icon: Shield, badge: 'Top Hold' },
                { id: 'tradingview', label: t('navTradingView'), icon: CandlestickChart, badge: 'TV Pro' },
                { id: 'long-short-radar', label: t('navLongShort'), icon: Zap, badge: 'Scalp 24h' },
                { id: 'meme-radar', label: t('navMemeRadar'), icon: Radar, badge: 'Meme' },
                { id: 'exit-radar', label: t('navExitRadar'), icon: Compass, badge: lang === 'en' ? 'Exit' : 'Thoát' },
                { id: 'wallet-tracker', label: t('navWalletTracker'), icon: Wallet, badge: lang === 'en' ? 'Whale' : 'Ví' },
                { id: 'risk-scanner', label: t('navRiskScanner'), icon: ShieldAlert, badge: null },
                { id: 'alert-center', label: t('navAlertCenter'), icon: Bell, badge: `${alerts.length}` },
                { id: 'backtest', label: t('navBacktest'), icon: History, badge: null },
                { id: 'settings', label: t('navSettings'), icon: Sliders, badge: null },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-900/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#121833]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.id === 'overview'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                          : item.id === 'tradingview'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-950 animate-pulse'
                          : item.badge === 'Thoát'
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                          : item.badge === 'Mới'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50'
                          : 'bg-rose-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Blockchains Network Status */}
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('supportedBlockchains')}
              </div>
              <div className="space-y-1">
                {[
                  { name: 'Solana', active: true },
                  { name: 'Ethereum', active: true },
                  { name: 'Base', active: true },
                  { name: 'BNB Chain', active: true },
                  { name: 'Arbitrum', active: true },
                ].map((chain) => (
                  <div
                    key={chain.name}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#121833] transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <ChainIcon chain={chain.name} className="w-3.5 h-3.5" />
                      <span>{chain.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                      <span>{t('onlineStatus')}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Banner Card */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-[#1a1236] via-[#101533] to-[#0a1126] border border-purple-600/30 shadow-xl">
            <div className="flex items-center space-x-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-bold uppercase text-purple-400">
                AI Powered Radar
              </span>
            </div>
            <div className="text-xs font-bold text-white mb-1">{t('riskRulesTitle')}</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('riskRulesDesc')}
            </p>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* PANEL PHẢI: NỘI DUNG CUỘN ĐỘC LẬP (KHÔNG ẢNH HƯỞNG BÊN TRÁI) */}
        {/* ========================================================= */}
        <main className="flex-1 h-full min-h-0 p-5 overflow-y-auto bg-[#060813]">
          {activeTab === 'overview' && (
            <OverviewView
              tokens={filteredTokens}
              selectedToken={selectedToken}
              setSelectedToken={setSelectedToken}
              alerts={alerts}
              onOpenExitRadar={handleOpenExitRadar}
              onOpenRiskScanner={handleOpenRiskScanner}
            />
          )}

          {activeTab === 'tradingview' && (
            <TradingViewSuperChartView
              tokens={filteredTokens}
              selectedToken={selectedToken}
              setSelectedToken={setSelectedToken}
              onOpenExitRadar={handleOpenExitRadar}
              onOpenRiskScanner={handleOpenRiskScanner}
            />
          )}

          {activeTab === 'long-short-radar' && (
            <LongShortRadarView
              tokens={filteredTokens}
              onSelectToken={(t) => {
                setSelectedToken(t);
              }}
            />
          )}

          {activeTab === 'meme-radar' && (
            <MemeCoinRadarView
              tokens={filteredTokens}
              onSelectToken={(t) => {
                setSelectedToken(t);
                setActiveTab('overview');
              }}
            />
          )}

          {activeTab === 'exit-radar' && (
            <AIExitRadarView
              tokens={tokens}
              initialSelectedToken={selectedToken}
            />
          )}

          {activeTab === 'wallet-tracker' && <WalletTrackerView />}

          {activeTab === 'risk-scanner' && (
            <RiskScannerView
              tokens={tokens}
              initialSelectedToken={selectedToken}
            />
          )}

          {activeTab === 'alert-center' && <AlertCenterView alerts={alerts} />}

          {activeTab === 'backtest' && <BacktestView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
