import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { initialPublicWallets } from '../data/comprehensiveData';
import ChainIcon from '../components/ChainIcon';
import { getAdapter } from '../adapters';
import { useLanguage } from '../i18n/LanguageContext';

export default function WalletTrackerView() {
  const { lang, t } = useLanguage();
  const [wallets, setWallets] = useState(initialPublicWallets);
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newChain, setNewChain] = useState('Solana');
  const [copied, setCopied] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(txt);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAddWallet = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newAddress.trim()) {
      setErrorMessage(lang === 'en' ? 'Please enter a public wallet address.' : 'Vui lòng nhập địa chỉ ví công khai.');
      return;
    }

    const adapter = getAdapter(newChain);
    if (!adapter.validateAddress(newAddress.trim())) {
      setErrorMessage(lang === 'en' ? `Invalid wallet address for ${newChain}. Please check again.` : `Địa chỉ ví không hợp lệ cho mạng ${newChain}. Vui lòng kiểm tra lại.`);
      return;
    }

    const newEntry = {
      id: `wal-${Date.now()}`,
      walletAddress: newAddress.trim(),
      walletLabel: newLabel.trim() || `${newChain} Wallet #${wallets.length + 1}`,
      chain: newChain,
      tokenSymbol: 'DOGE2.0',
      tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      balance: 1000000,
      estimatedBuyPrice: 0.0003,
      currentPrice: 0.000432,
      unrealizedPnlUsd: 132,
      unrealizedPnlPercent: 44.0,
      entryDate: new Date().toISOString().split('T')[0],
      lastActivity: lang === 'en' ? 'Just added' : 'Vừa thêm',
      activityType: 'BUY',
      isEstimate: true,
    };

    setWallets([newEntry, ...wallets]);
    setNewAddress('');
    setNewLabel('');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-[#101938] to-[#0b1021] border border-blue-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Public Wallet Tracker</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Track balances, transactions, and holdings of public addresses (Smart Money / Whales).'
                : 'Theo dõi giao dịch, số dư và biến động vị thế từ các địa chỉ ví công khai (Smart Money / Whales).'}
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-600/40 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>{lang === 'en' ? 'Read-Only Mode: 100% Secure, No Private Keys Needed' : 'Chế độ Read-Only: 100% An toàn, Không yêu cầu Private Key'}</span>
        </div>
      </div>

      {/* Form thêm ví công khai */}
      <form onSubmit={handleAddWallet} className="bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Plus className="w-4 h-4 text-purple-400" />
          <span>{lang === 'en' ? 'Add Public Wallet Address to Watchlist' : 'Thêm địa chỉ ví công khai cần theo dõi'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-3">
            <select
              value={newChain}
              onChange={(e) => setNewChain(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
            >
              <option value="Solana">Solana</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Base">Base</option>
              <option value="BNB Chain">BNB Chain</option>
              <option value="Arbitrum">Arbitrum</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder={lang === 'en' ? 'Wallet label (e.g. Solana Whale 01)' : 'Nhãn ví (vd: Cá voi Solana, Smart Money 01)'}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder={lang === 'en' ? 'Public address (Solana Base58 or EVM 0x...)' : 'Địa chỉ ví công khai (Solana Base58 hoặc EVM 0x...)'}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'Add Wallet' : 'Thêm Ví'}</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="text-xs text-rose-400 flex items-center space-x-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {/* Bảng danh sách ví đang theo dõi */}
      <div className="bg-[#0b1021]/90 border border-[#192345] rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#182142] flex items-center justify-between">
          <div className="text-sm font-bold text-white">{lang === 'en' ? 'Watched Wallets & Holdings' : 'Danh Sách Ví & Vị Thế Nắm Giữ'}</div>
          <div className="text-xs text-slate-400">{lang === 'en' ? 'Tracking:' : 'Đang theo dõi:'} {wallets.length} {lang === 'en' ? 'wallets' : 'ví'}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e142a]/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#182142]">
              <tr>
                <th className="py-3 px-4">{lang === 'en' ? 'LABEL & CHAIN' : 'Nhãn Ví & Chain'}</th>
                <th className="py-3 px-3">{lang === 'en' ? 'ADDRESS' : 'Địa chỉ ví'}</th>
                <th className="py-3 px-3">{lang === 'en' ? 'HOLDINGS' : 'Token nắm giữ'}</th>
                <th className="py-3 px-3">{lang === 'en' ? 'AMOUNT' : 'Số lượng'}</th>
                <th className="py-3 px-3">{lang === 'en' ? 'EST. COST' : 'Giá vốn ước tính'}</th>
                <th className="py-3 px-3">{lang === 'en' ? 'CURRENT PRICE' : 'Giá hiện tại'}</th>
                <th className="py-3 px-3">{lang === 'en' ? 'UNREALIZED PNL' : 'PnL Chưa thực hiện'}</th>
                <th className="py-3 px-3">{lang === 'en' ? 'LAST ACTIVITY' : 'Hoạt động gần nhất'}</th>
                <th className="py-3 px-3 text-center">{lang === 'en' ? 'ACTION' : 'Loại lệnh'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141b36]">
              {wallets.map((w) => {
                const adapter = getAdapter(w.chain);
                return (
                  <tr key={w.id} className="hover:bg-[#121833] transition-colors">
                    {/* Label & Chain */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{w.walletLabel}</div>
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5">
                        <ChainIcon chain={w.chain} className="w-3 h-3" />
                        <span>{w.chain}</span>
                      </div>
                    </td>

                    {/* Address with copy & explorer */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-300 bg-[#090d1c] px-2 py-0.5 rounded border border-[#1b2545] w-fit">
                        <span>{adapter.formatAddress(w.walletAddress)}</span>
                        <button
                          onClick={() => copyText(w.walletAddress)}
                          className="text-slate-400 hover:text-white"
                          title={lang === 'en' ? 'Copy address' : 'Sao chép địa chỉ'}
                        >
                          {copied === w.walletAddress ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={adapter.getExplorerAddressUrl(w.walletAddress)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-cyan-400"
                          title="Open explorer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    {/* Token */}
                    <td className="py-3 px-3 font-bold text-purple-300">
                      ${w.tokenSymbol}
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {w.balance.toLocaleString()}
                    </td>

                    {/* Estimated Buy Price */}
                    <td className="py-3 px-3 font-mono text-slate-400">
                      ${w.estimatedBuyPrice}{' '}
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded ml-1">
                        {lang === 'en' ? 'Est.' : 'Ước tính'}
                      </span>
                    </td>

                    {/* Current Price */}
                    <td className="py-3 px-3 font-mono text-white font-semibold">
                      ${w.currentPrice}
                    </td>

                    {/* Unrealized PnL */}
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-emerald-400">
                        +${w.unrealizedPnlUsd.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        +{w.unrealizedPnlPercent.toFixed(1)}%
                      </div>
                    </td>

                    {/* Last Activity */}
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {w.lastActivity}
                    </td>

                    {/* Activity Type */}
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        w.activityType === 'BUY'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                          : w.activityType === 'SELL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                          : 'bg-blue-950 text-blue-300 border border-blue-600/50'
                      }`}>
                        {w.activityType === 'TRANSFER_IN' ? (lang === 'en' ? 'TRANSFER (IN)' : 'CHUYỂN VÍ (IN)') : w.activityType}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
