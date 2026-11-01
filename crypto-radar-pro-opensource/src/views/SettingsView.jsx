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
  Globe
} from 'lucide-react';
import { globalCache } from '../modules/cacheManager';
import { sendTelegramNotification } from '../modules/telegramNotifier';
import { useLanguage } from '../i18n/LanguageContext';

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

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', geminiApiKey);
    localStorage.setItem('telegram_bot_token', telegramBotToken);
    localStorage.setItem('telegram_chat_id', telegramChatId);
    localStorage.setItem('solana_rpc', solanaRpc);
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
                  onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                  className="w-24 bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-white font-mono outline-none"
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
