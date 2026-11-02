import React, { useState } from 'react';
import {
  History,
  Play,
  RotateCcw,
  BarChart2,
  TrendingUp,
  Percent,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { runRealisticBacktest } from '../modules/backtestEngine';
import ChainIcon from '../components/ChainIcon';
import { useLanguage } from '../i18n/LanguageContext';

export default function BacktestView() {
  const { lang, t } = useLanguage();
  const [chain, setChain] = useState('Solana');
  const [sampleTokens, setSampleTokens] = useState(250);
  const [minScore, setMinScore] = useState(75);
  const [trailingStop, setTrailingStop] = useState(15);
  const [takeProfit, setTakeProfit] = useState(100);
  const [slippage, setSlippage] = useState(1.5);

  const [isRunning, setIsRunning] = useState(false);
  const [activeResult, setActiveResult] = useState(() =>
    runRealisticBacktest({
      chain: 'Solana',
      sampleTokensCount: 250,
      minOpportunityScore: 75,
      trailingStopPct: 15,
      takeProfitPct: 100,
      slippagePct: 1.5,
      tradingFeePct: 0.5,
    })
  );

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runRealisticBacktest({
        chain,
        sampleTokensCount: Number(sampleTokens),
        minOpportunityScore: Number(minScore),
        trailingStopPct: Number(trailingStop),
        takeProfitPct: Number(takeProfit),
        slippagePct: Number(slippage),
        tradingFeePct: 0.5,
      });
      setActiveResult(res);
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-[#131a38] to-[#0b1021] border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Backtesting Strategy Engine (Phase 8 & 9)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Historical replay, slippage & fee simulation, false-positive auditing, and look-ahead bias elimination.'
                : 'Phát lại dữ liệu lịch sử, tính trượt giá & phí sàn, đo tỷ lệ cảnh báo giả và loại trừ Look-ahead/Survivorship Bias.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-purple-900/30 flex items-center space-x-2 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isRunning ? (lang === 'en' ? 'Simulating...' : 'Đang chạy mô phỏng...') : (lang === 'en' ? 'Run Backtest Simulation' : 'Chạy Kiểm Thử Backtest')}</span>
        </button>
      </div>

      {/* Control Panel Parameters */}
      <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-4 shadow-xl">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>{lang === 'en' ? 'Strategy Backtest Parameters' : 'Tham Số Kiểm Thử Chiến Lược'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">{lang === 'en' ? 'Blockchain' : 'Mạng Blockchain'}</label>
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-2.5 py-1.5 text-white outline-none"
            >
              <option value="Solana">Solana</option>
              <option value="Base">Base</option>
              <option value="Ethereum">Ethereum</option>
              <option value="BNB Chain">BNB Chain</option>
              <option value="Arbitrum">Arbitrum</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">{lang === 'en' ? 'Sample Size' : 'Mẫu Token Quét'}</label>
            <select
              value={sampleTokens}
              onChange={(e) => setSampleTokens(Number(e.target.value))}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-2.5 py-1.5 text-white outline-none"
            >
              <option value="100">100 Tokens</option>
              <option value="250">250 Tokens</option>
              <option value="500">500 Tokens</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">{lang === 'en' ? 'Radar Trigger Score' : 'Điểm Radar Kích Hoạt'}</label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-2.5 py-1.5 text-white outline-none"
            >
              <option value="70">&gt;= 70 {lang === 'en' ? 'pts' : 'điểm'}</option>
              <option value="75">&gt;= 75 {lang === 'en' ? 'pts' : 'điểm'}</option>
              <option value="85">&gt;= 85 {lang === 'en' ? 'pts' : 'điểm'}</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Trailing Stop (%)</label>
            <select
              value={trailingStop}
              onChange={(e) => setTrailingStop(Number(e.target.value))}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-2.5 py-1.5 text-white outline-none"
            >
              <option value="10">-10% {lang === 'en' ? 'from peak' : 'từ đỉnh'}</option>
              <option value="15">-15% {lang === 'en' ? 'from peak' : 'từ đỉnh'}</option>
              <option value="20">-20% {lang === 'en' ? 'from peak' : 'từ đỉnh'}</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">{lang === 'en' ? 'TP Target (%)' : 'Mục Tiêu TP (%)'}</label>
            <select
              value={takeProfit}
              onChange={(e) => setTakeProfit(Number(e.target.value))}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-2.5 py-1.5 text-white outline-none"
            >
              <option value="50">+50% (TP1)</option>
              <option value="100">+100% (TP2)</option>
              <option value="200">+200% (TP3)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">{lang === 'en' ? 'Simulated Slippage' : 'Trượt giá Giả Định (%)'}</label>
            <select
              value={slippage}
              onChange={(e) => setSlippage(Number(e.target.value))}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-2.5 py-1.5 text-white outline-none"
            >
              <option value="1.0">1.0%</option>
              <option value="1.5">1.5%</option>
              <option value="3.0">3.0% ({lang === 'en' ? 'Meme Volatility' : 'Meme biến động'})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Thẻ Kết Quả Đánh Giá Tổng Hợp */}
      {activeResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-4 shadow-lg">
              <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Win Rate Ratio' : 'Tỷ lệ Lệnh Có Lãi (Win Rate)'}</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {activeResult.winRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {activeResult.totalAlertsTriggered} {lang === 'en' ? 'triggers from' : 'lệnh kích hoạt từ'} {activeResult.totalTokensAnalyzed} {lang === 'en' ? 'samples' : 'mẫu'}
              </div>
            </div>

            <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-4 shadow-lg">
              <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'False Positive Rate' : 'Tỷ lệ Cảnh Báo Giả (False Positive)'}</span>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">
                {activeResult.falsePositiveRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {lang === 'en' ? 'Hit stop-loss or negative slippage' : 'Bị cắt lỗ hoặc trượt giá âm'}
              </div>
            </div>

            <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-4 shadow-lg">
              <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Avg Net Return / Trade' : 'Lợi Nhuận Ròng TB / Lệnh'}</span>
              <div className="text-2xl font-extrabold text-cyan-400 mt-1">
                +{activeResult.avgNetReturn}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {lang === 'en' ? 'After 2x slippage & DEX fees' : 'Đã trừ 2x trượt giá & phí DEX'}
              </div>
            </div>

            <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-4 shadow-lg">
              <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Max Drawdown' : 'Mức Giảm Tối Đa (Max Drawdown)'}</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                -{activeResult.maxDrawdown}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {lang === 'en' ? 'Avg latency:' : 'Độ trễ trung bình:'} {activeResult.avgLatencyMs} ms
              </div>
            </div>
          </div>

          {/* Ghi chú Triệt Tiêu Bias */}
          <div className="bg-[#0b1021]/90 border border-purple-900/30 rounded-2xl p-4 shadow-xl">
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'en' ? 'Data Bias Mitigation Checklist' : 'Biện Pháp Triệt Tiêu Thiên Lệch Dữ Liệu (Bias Mitigation)'}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-300">
              {activeResult.biasMitigationNotes.map((note, idx) => (
                <div key={idx} className="bg-[#080d1e] p-2.5 rounded-xl border border-[#161f3d]">
                  ✓ {note}
                </div>
              ))}
            </div>
          </div>

          {/* Bảng Chi Tiết Các Lệnh Giả Lập Mẫu */}
          <div className="bg-[#0b1021]/90 border border-[#192345] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#182142] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === 'en' ? 'Simulated Positions Log' : 'Nhật Ký Các Vị Thế Trong Mẫu Backtest'}
              </span>
              <span className="text-xs text-slate-400">{lang === 'en' ? 'Showing 15 random sample executions' : 'Hiển thị 15 lệnh mẫu ngẫu nhiên'}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e142a]/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#182142]">
                  <tr>
                    <th className="py-2.5 px-4">{lang === 'en' ? 'TOKEN' : 'Token'}</th>
                    <th className="py-2.5 px-3">CHAIN</th>
                    <th className="py-2.5 px-3">{lang === 'en' ? 'ENTRY' : 'Giá Vào (Entry)'}</th>
                    <th className="py-2.5 px-3">{lang === 'en' ? 'EXIT' : 'Giá Ra (Exit)'}</th>
                    <th className="py-2.5 px-3">{lang === 'en' ? 'EXIT REASON' : 'Lý do Thoát'}</th>
                    <th className="py-2.5 px-3">{lang === 'en' ? 'HOLD DURATION' : 'Thời gian Nắm'}</th>
                    <th className="py-2.5 px-3 font-mono">MAX DRAWDOWN</th>
                    <th className="py-2.5 px-4 text-right">{lang === 'en' ? 'NET PNL' : 'PnL Ròng Thực'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141b36]">
                  {activeResult.trades.map((t, i) => (
                    <tr key={i} className="hover:bg-[#121833] transition-colors">
                      <td className="py-2.5 px-4 font-bold text-white">{t.tokenSymbol}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-1.5">
                          <ChainIcon chain={t.chain} className="w-3 h-3" />
                          <span>{t.chain}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">${t.entryPrice}</td>
                      <td className="py-2.5 px-3 font-mono">${t.exitPrice}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.exitReason === 'TAKE_PROFIT'
                            ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                            : t.exitReason === 'TRAILING_STOP'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                            : 'bg-rose-950 text-rose-300 border border-rose-600/50'
                        }`}>
                          {t.exitReason}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{t.holdingTimeHours} {lang === 'en' ? 'hrs' : 'giờ'}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-400">-{t.maxDrawdownDuringTrade}%</td>
                      <td className={`py-2.5 px-4 font-mono font-bold text-right ${
                        t.pnlNetPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {t.pnlNetPercent >= 0 ? `+${t.pnlNetPercent}%` : `${t.pnlNetPercent}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
