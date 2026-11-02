import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Key,
  Database,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Send,
  Bell,
  Globe,
  Zap,
  Activity,
  DollarSign,
  TrendingUp,
  Cpu,
  Power,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Heart
} from 'lucide-react';
import { globalCache } from '../modules/cacheManager';
import { sendTelegramNotification } from '../modules/telegramNotifier';
import { useLanguage } from '../i18n/LanguageContext';
import {
  loadExchangeConfigs,
  saveExchangeConfigs,
  testExchangeConnection,
  emergencyKillSwitchAllExchanges,
  loadTradeExecutionHistory,
} from '../modules/tier1ExchangeTrader';

export default function SettingsView() {
  const { lang, setLang, t } = useLanguage();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [solanaRpc, setSolanaRpc] = useState('https://api.mainnet-beta.solana.com');
  const [baseRpc, setBaseRpc] = useState('https://mainnet.base.org');
  const [ethRpc, setEthRpc] = useState('https://eth.llamarpc.com');
  const [cooldownMinutes, setCooldownMinutes] = useState(5);
  const [rateLimitProtection, setRateLimitProtection] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState(null);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const DONATION_WALLET = 'TEC5upqc42siEWdTQFgn7pBasGVY86dVpj';

  // TIER-1 EXCHANGES STATE
  const [exchangeConfigs, setExchangeConfigs] = useState(() => loadExchangeConfigs());
  const [activeExTab, setActiveExTab] = useState('binance');
  const [isTestingEx, setIsTestingEx] = useState(false);
  const [testExResult, setTestExResult] = useState(null);
  const [tradeLogs, setTradeLogs] = useState(() => loadTradeExecutionHistory());
  const [killSwitchLogs, setKillSwitchLogs] = useState(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setGeminiApiKey(savedKey);

    const savedTgToken = localStorage.getItem('telegram_bot_token');
    if (savedTgToken) setTelegramBotToken(savedTgToken);

    const savedTgChat = localStorage.getItem('telegram_chat_id');
    if (savedTgChat) setTelegramChatId(savedTgChat);

    const savedSolRpc = localStorage.getItem('solana_rpc');
    if (savedSolRpc) setSolanaRpc(savedSolRpc);
  }, []);

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

  const handleEmergencyKillSwitch = async () => {
    const confirmMsg = lang === 'en'
      ? 'EMERGENCY ACTION: Are you sure you want to cancel all open orders across all configured exchanges?'
      : 'HÀNH ĐỘNG KHẨN CẤP: Bạn có chắc chắn muốn hủy toàn bộ lệnh chờ và vị thế trên tất cả các sàn đã cấu hình?';
    if (!window.confirm(confirmMsg)) return;

    const logs = await emergencyKillSwitchAllExchanges(exchangeConfigs);
    setKillSwitchLogs(logs);
    setTradeLogs(loadTradeExecutionHistory());
    setTimeout(() => setKillSwitchLogs(null), 8000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', geminiApiKey);
    localStorage.setItem('telegram_bot_token', telegramBotToken);
    localStorage.setItem('telegram_chat_id', telegramChatId);
    localStorage.setItem('solana_rpc', solanaRpc);
    saveExchangeConfigs(exchangeConfigs);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestTelegram = async () => {
    if (!telegramBotToken || !telegramChatId) {
      alert(lang === 'en' ? 'Please enter both Telegram Bot Token and Chat ID before testing.' : 'Vui lòng nhập đầy đủ Telegram Bot Token và Chat ID trước khi thử gửi.');
      return;
    }
    setTelegramTestStatus(lang === 'en' ? 'Sending test message...' : 'Đang gửi tin nhắn thử nghiệm...');
    const ok = await sendTelegramNotification(
      {
        id: 'test-alert',
        tokenSymbol: '$TEST_DOGE',
        tokenName: 'Test Radar Token',
        chain: 'Solana',
        contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        alertType: 'BUY_OPPORTUNITY',
        severity: 'HIGH',
        opportunityScore: 92,
        riskScore: 18,
        reason: 'Test notification from AI Crypto Market Radar.',
        evidence: [{ metric: 'Test Ping', value: 'OK', threshold: '200 OK' }],
        timestamp: new Date().toISOString(),
        dataSource: 'System Diagnostic Test',
        isVerified: true,
      },
      telegramBotToken,
      telegramChatId
    );

    if (ok) {
      setTelegramTestStatus(lang === 'en' ? '✅ Test alert sent successfully! Check your Telegram.' : '✅ Gửi thử nghiệm thành công! Vui lòng kiểm tra Telegram của bạn.');
    } else {
      setTelegramTestStatus(lang === 'en' ? '❌ Failed to send. Please check your Bot Token and Chat ID.' : '❌ Không thể gửi. Vui lòng kiểm tra lại Bot Token và Chat ID.');
    }
    setTimeout(() => setTelegramTestStatus(null), 5000);
  };

  const handleClearCache = () => {
    globalCache.clear();
    alert(lang === 'en' ? 'In-memory Cache cleared successfully!' : 'Đã xóa sạch bộ đệm Cache trong bộ nhớ!');
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-4xl">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#131a38] to-[#0b1021] border border-slate-700/50 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-300">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {lang === 'en' ? 'System Configuration (Phases 2-9)' : 'Cấu Hình Toàn Diện Hệ Thống (Phases 2-9)'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Multi-chain RPC nodes, Gemini AI API key, instant Telegram alerts, and rate-limit guardrails.'
                : 'Tích hợp RPC đa chuỗi, API Gemini AI, Cảnh báo Telegram bot tức thì và bảo vệ Rate-limit.'}
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="text-xs text-emerald-400 font-bold flex items-center space-x-1.5 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-600/50">
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'en' ? 'Saved successfully!' : 'Đã lưu thành công!'}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Khối Cài Đặt Ngôn Ngữ (Language Selection) */}
        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#182142]">
            <Globe className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">{t('languageSettingTitle')}</h3>
          </div>
          <p className="text-xs text-slate-400">
            {t('languageSettingDesc')}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setLang('vi')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                lang === 'vi'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500 shadow-md shadow-purple-900/50 ring-2 ring-purple-400'
                  : 'bg-[#101633] text-slate-400 border-[#1c2854] hover:text-white'
              }`}
            >
              <span className="text-base">🇻🇳</span>
              <span>{t('langVi')}</span>
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500 shadow-md shadow-purple-900/50 ring-2 ring-purple-400'
                  : 'bg-[#101633] text-slate-400 border-[#1c2854] hover:text-white'
              }`}
            >
              <span className="text-base">🇺🇸</span>
              <span>{t('langEn')}</span>
            </button>
          </div>
        </div>

        {/* Khối Telegram Bot Alerts */}
        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182142]">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">{lang === 'en' ? 'Telegram Bot Alert Channel (Phase 7)' : 'Thông Báo Cảnh Báo Telegram (Phase 7)'}</h3>
            </div>
            <button
              type="button"
              onClick={handleTestTelegram}
              className="px-3 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-600/40 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Send Test Alert' : 'Gửi Tin Nhắn Thử Nghiệm'}</span>
            </button>
          </div>

          {telegramTestStatus && (
            <div className="text-xs text-cyan-300 bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/40">
              {telegramTestStatus}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Telegram Bot Token</label>
              <input
                type="password"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white placeholder-slate-600 outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">{lang === 'en' ? 'Telegram Chat ID (Group or Private)' : 'Telegram Chat ID (Nhóm hoặc Cá nhân)'}</label>
              <input
                type="text"
                placeholder="-100123456789"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white placeholder-slate-600 outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {lang === 'en'
              ? 'EMERGENCY_EXIT and BUY_OPPORTUNITY alerts will be forwarded directly to your Telegram chat.'
              : 'Cảnh báo EMERGENCY_EXIT và BUY_OPPORTUNITY sẽ được đẩy tức thì vào Telegram của bạn.'}
          </span>
        </div>

        {/* ========================================================= */}
        {/* TIER-1 EXCHANGES AUTO-TRADE & FUTURES EXECUTION HUB */}
        {/* ========================================================= */}
        <div className="bg-[#0b1021]/90 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4 bg-gradient-to-br from-amber-950/20 via-[#0b1021] to-[#090d1c]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#182142]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black">
                ⚡
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                  <span>{lang === 'en' ? 'Tier-1 Exchanges Auto-Trade & Execution Hub' : 'Trung Tâm Tự Động Hóa Giao Dịch Sàn Tier-1'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/60 font-mono">
                    Binance • Bybit • OKX • Bitget
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {lang === 'en'
                    ? 'Connect Futures API to execute Long / Short signals automatically with bracket TP & SL.'
                    : 'Kết nối API Futures để tự động mở lệnh Long/Short theo tín hiệu Radar kèm TP & SL tự động.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleEmergencyKillSwitch}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-600/60 shadow-lg shadow-rose-950/50 transition-all flex items-center space-x-1"
                title={lang === 'en' ? 'Cancel all open orders and close positions across all exchanges' : 'Hủy toàn bộ lệnh chờ và đóng các vị thế khẩn cấp'}
              >
                <Power className="w-3.5 h-3.5 text-rose-400" />
                <span>{lang === 'en' ? 'Emergency Kill-Switch' : '🛑 Đóng Lệnh Khẩn Cấp'}</span>
              </button>
            </div>
          </div>

          {killSwitchLogs && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl space-y-1 text-xs text-rose-200 animate-pulse">
              <div className="font-bold">⚠️ Trạng thái ngắt khẩn cấp (Kill-Switch Logs):</div>
              {killSwitchLogs.map((log, i) => (
                <div key={i} className="font-mono text-[11px]">• {log}</div>
              ))}
            </div>
          )}

          {/* Security Notice Banner */}
          <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start space-x-2.5 text-xs text-amber-200/90 leading-relaxed">
            <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>{lang === 'en' ? 'CRITICAL SECURITY RULES:' : 'QUY TẮC BẢO MẬT TUYỆT ĐỐI:'}</strong>{' '}
              {lang === 'en'
                ? 'Only enable "Reading" and "Futures Trading". NEVER enable "Withdrawals". API keys are stored locally on your device.'
                : 'Chỉ bật quyền "Đọc" và "Kích hoạt Futures". TUYỆT ĐỐI KHÔNG BẬT quyền "Cho phép rút tiền" (Enable Withdrawals). API Key được lưu cục bộ trên máy tính của bạn.'}
            </div>
          </div>

          {/* 4 Tier-1 Exchange Tabs */}
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
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#141b38] border-amber-500 shadow-md shadow-amber-950/50 ring-1 ring-amber-500/50'
                      : 'bg-[#090d1c] border-[#1b2545] text-slate-400 hover:text-white hover:bg-[#10162e]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center space-x-1">
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </span>
                    <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-amber-300">{tab.badge}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className={cfg.autoTradeEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {cfg.autoTradeEnabled ? (cfg.paperTradingEnabled ? '🟡 Paper' : '🟢 Live Auto') : '⚪ Tắt Auto'}
                    </span>
                    <span className={cfg.apiKey ? 'text-cyan-400 font-mono' : 'text-slate-600'}>
                      {cfg.apiKey ? '✓ Đã cấu hình' : 'Chưa có Key'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Exchange Configuration Form */}
          {(() => {
            const currentCfg = exchangeConfigs[activeExTab];
            return (
              <div className="bg-[#080d1e] border border-[#17203d] rounded-xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#141b36]">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-white">{currentCfg.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#121938] border border-cyan-800/40 text-cyan-300 font-mono">
                      {currentCfg.isTestnet ? 'Testnet / Demo' : 'Live Production'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentCfg.paperTradingEnabled}
                        onChange={(e) => handleUpdateExConfig('paperTradingEnabled', e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-500 rounded"
                      />
                      <span className="text-amber-300 font-semibold">{lang === 'en' ? 'Paper Trading (Risk-free)' : 'Chế độ Đánh Giả Lập (Không rủi ro)'}</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentCfg.autoTradeEnabled}
                        onChange={(e) => handleUpdateExConfig('autoTradeEnabled', e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded"
                      />
                      <span className={currentCfg.autoTradeEnabled ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {lang === 'en' ? 'Enable Auto-Trade' : 'Bật Tự Động Hóa Trade'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* API Keys Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">{currentCfg.name} API Key</label>
                    <input
                      type="text"
                      placeholder="Nhập API Key từ sàn..."
                      value={currentCfg.apiKey}
                      onChange={(e) => handleUpdateExConfig('apiKey', e.target.value.trim())}
                      className="w-full bg-[#060914] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white placeholder-slate-600 outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">API Secret Key</label>
                    <input
                      type="password"
                      placeholder="Nhập Secret Key bí mật..."
                      value={currentCfg.secretKey}
                      onChange={(e) => handleUpdateExConfig('secretKey', e.target.value.trim())}
                      className="w-full bg-[#060914] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white placeholder-slate-600 outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  {(activeExTab === 'okx' || activeExTab === 'bitget') && (
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">API Passphrase (Mật khẩu API)</label>
                      <input
                        type="password"
                        placeholder="Passphrase bạn đặt lúc tạo API..."
                        value={currentCfg.passphrase || ''}
                        onChange={(e) => handleUpdateExConfig('passphrase', e.target.value.trim())}
                        className="w-full bg-[#060914] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white placeholder-slate-600 outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Môi Trường Kết Nối</label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateExConfig('isTestnet', false)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex-1 ${
                          !currentCfg.isTestnet
                            ? 'bg-amber-500 text-black font-extrabold shadow'
                            : 'bg-[#10162e] text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚡ Live Production (Tài Khoản Thật)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateExConfig('isTestnet', true)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex-1 ${
                          currentCfg.isTestnet
                            ? 'bg-indigo-600 text-white font-extrabold shadow'
                            : 'bg-[#10162e] text-slate-400 hover:text-white'
                        }`}
                      >
                        🧪 Testnet / Demo (Tài Khoản Test)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Risk & Position Sizing Controls */}
                <div className="p-3 bg-[#0a0f24] rounded-xl border border-[#161f3d] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Ký Quỹ Tối Đa / Lệnh (USD)</label>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-500 font-bold">$</span>
                      <input
                        type="number"
                        min="1"
                        max="100000"
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
                        className="w-full bg-[#060914] border border-[#1b2545] rounded-lg px-2.5 py-1 text-white font-mono outline-none focus:border-amber-500 transition-colors"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Khóa Đòn Bẩy Tối Đa</label>
                    <select
                      value={currentCfg.maxLeverage}
                      onChange={(e) => handleUpdateExConfig('maxLeverage', Number(e.target.value))}
                      className="w-full bg-[#060914] border border-[#1b2545] rounded-lg px-2.5 py-1 text-white font-mono outline-none"
                    >
                      <option value="2">2x (Cực kỳ an toàn)</option>
                      <option value="3">3x (Khuyên dùng)</option>
                      <option value="5">5x (Tiêu chuẩn)</option>
                      <option value="10">10x (Biến động nhanh)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Ngưỡng Win Rate Tối Thiểu</label>
                    <select
                      value={currentCfg.minWinRateThreshold}
                      onChange={(e) => handleUpdateExConfig('minWinRateThreshold', Number(e.target.value))}
                      className="w-full bg-[#060914] border border-[#1b2545] rounded-lg px-2.5 py-1 text-white font-mono outline-none"
                    >
                      <option value="65">≥ 65% (Nhiều kèo hơn)</option>
                      <option value="70">≥ 70% (Chuẩn mực)</option>
                      <option value="75">≥ 75% (Chọn lọc cao)</option>
                      <option value="80">≥ 80% (Cực kỳ khắt khe)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Số Lệnh Mở Tối Đa Cùng Lúc</label>
                    <select
                      value={currentCfg.maxConcurrentPositions}
                      onChange={(e) => handleUpdateExConfig('maxConcurrentPositions', Number(e.target.value))}
                      className="w-full bg-[#060914] border border-[#1b2545] rounded-lg px-2.5 py-1 text-white font-mono outline-none"
                    >
                      <option value="1">1 vị thế (Tránh rủi ro)</option>
                      <option value="2">2 vị thế</option>
                      <option value="3">3 vị thế</option>
                      <option value="5">5 vị thế</option>
                    </select>
                  </div>
                </div>

                {/* Connection Test & Balance Result */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleTestExchange}
                    disabled={isTestingEx}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-950 flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingEx ? 'animate-spin' : ''}`} />
                    <span>{isTestingEx ? 'Đang kiểm tra kết nối...' : `Kiểm Tra Kết Nối & Số Dư ${currentCfg.name}`}</span>
                  </button>

                  {testExResult && (
                    <div className="flex items-center space-x-2 text-xs">
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

          {/* Recent Executed Trades Log */}
          {tradeLogs.length > 0 && (
            <div className="bg-[#080d1e] border border-[#161f3d] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1.5 border-b border-[#141b36]">
                <span className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nhật Ký Lệnh Tự Động Gần Nhất ({tradeLogs.length} Lệnh)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Tự động cập nhật</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {tradeLogs.slice(0, 10).map((trade, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-[#060914] border border-[#161f38] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.2 rounded font-extrabold text-[10px] ${
                        trade.direction === 'LONG' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-rose-950 text-rose-300 border border-rose-600'
                      }`}>
                        {trade.direction}
                      </span>
                      <span className="font-bold text-white font-sans">{trade.tokenSymbol}</span>
                      <span className="text-slate-400 text-[10px]">(${trade.executedPrice < 0.01 ? trade.executedPrice.toFixed(6) : trade.executedPrice.toFixed(4)})</span>
                      <span className="text-amber-400 text-[10px] uppercase font-bold">[{trade.exchange}]</span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="text-slate-300">${trade.marginUsedUsd} USD ({trade.leverage}x)</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        trade.status === 'SIMULATED' ? 'bg-amber-950 text-amber-300' : trade.status === 'FILLED' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
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

        {/* Khối AI Gemini API Key */}
        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#182142]">
            <Bot className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">{lang === 'en' ? 'Artificial Intelligence (Gemini AI API)' : 'Cấu Hình Trí Tuệ Nhân Tạo (Gemini AI API)'}</h3>
          </div>
          <div>
            <label className="text-xs text-slate-300 block mb-1">Google Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 outline-none focus:border-purple-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              {lang === 'en'
                ? 'API Key is securely stored locally in your browser storage (LocalStorage).'
                : 'Khóa API được lưu cục bộ an toàn trên máy tính của bạn (LocalStorage).'}
            </span>
          </div>
        </div>

        {/* Khối RPC Blockchains */}
        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#182142]">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">{lang === 'en' ? 'Blockchain RPC Endpoints (Custom Nodes)' : 'Điểm Cuối Blockchain RPC (Custom Nodes)'}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Solana RPC Endpoint</label>
              <input
                type="text"
                value={solanaRpc}
                onChange={(e) => setSolanaRpc(e.target.value)}
                className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Base Mainnet RPC</label>
              <input
                type="text"
                value={baseRpc}
                onChange={(e) => setBaseRpc(e.target.value)}
                className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 font-mono text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Khối Cơ Chế Chống Spam & Rate Limit */}
        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#182142]">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">{lang === 'en' ? 'Quota Protection & Cooldown Throttling' : 'Bảo Vệ Quota & Cooldown Cảnh Báo'}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">{lang === 'en' ? 'Anti-spam alert cooldown duration' : 'Thời gian Cooldown chống spam cảnh báo'}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={cooldownMinutes}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setCooldownMinutes('');
                    } else {
                      const n = parseInt(val, 10);
                      setCooldownMinutes(isNaN(n) ? '' : n);
                    }
                  }}
                  onBlur={() => {
                    if (cooldownMinutes === '' || Number(cooldownMinutes) <= 0) {
                      setCooldownMinutes(5);
                    }
                  }}
                  className="w-24 bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500 transition-colors"
                />
                <span className="text-slate-400">{lang === 'en' ? 'minutes (Exempts Emergency Exit)' : 'phút (Ngoại trừ Emergency Exit)'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#080d1e] rounded-xl border border-[#161f3d]">
              <div>
                <span className="text-white font-semibold block">{lang === 'en' ? 'Memory Cache & Circuit Breaker' : 'Bộ Đệm Cache & Ngắt Mạch Circuit Breaker'}</span>
                <span className="text-[10px] text-slate-400">{lang === 'en' ? 'Prevents API thrashing on 429 rate limits' : 'Tự động chặn gọi dồn dập khi API báo lỗi 429'}</span>
              </div>
              <input
                type="checkbox"
                checked={rateLimitProtection}
                onChange={(e) => setRateLimitProtection(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleClearCache}
              className="px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-xl transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Clear In-Memory Cache' : 'Xóa bộ đệm In-memory Cache'}</span>
            </button>
          </div>
        </div>

        {/* Khối Ủng Hộ Nhà Phát Triển (Donate USDT TRC20) */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-[#0a1329] to-[#070b1a] border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#182645]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400 font-black text-sm">
                ₮
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <span>{lang === 'en' ? 'Support the Open-Source Project (Donate)' : 'Ủng Hộ Nhà Phát Triển & Dự Án Mã Nguồn Mở'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-mono">
                    USDT (TRC20)
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {lang === 'en'
                    ? 'Help maintain server infrastructure, APIs, and keep this tool 100% free and open-source.'
                    : 'Góp phần duy trì server, bản quyền API và giúp công cụ luôn miễn phí 100% cho cộng đồng.'}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              TRON Network (TRX)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#050814] p-3 rounded-xl border border-[#162244]">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                USDT (TRC20) Wallet Address:
              </span>
              <span className="font-mono text-xs sm:text-sm font-black text-emerald-400 break-all select-all">
                {DONATION_WALLET}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(DONATION_WALLET);
                setCopiedWallet(true);
                setTimeout(() => setCopiedWallet(false), 2500);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs transition-all shadow-lg flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer"
            >
              {copiedWallet ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{lang === 'en' ? 'Copied!' : 'Đã Sao Chép!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-100" />
                  <span>{lang === 'en' ? 'Copy TRC20 Address' : 'Sao Chép Địa Chỉ Ví'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-xl shadow-purple-900/30 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'en' ? 'Save All Configurations' : 'Lưu Toàn Bộ Cấu Hình'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
