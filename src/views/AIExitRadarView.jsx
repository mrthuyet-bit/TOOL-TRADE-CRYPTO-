import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Calculator,
  Compass,
  CheckCircle2,
  Sliders,
  DollarSign
} from 'lucide-react';
import { evaluateExitStrategy } from '../modules/aiExitRadar';
import { useLanguage } from '../i18n/LanguageContext';

export default function AIExitRadarView({ tokens, initialSelectedToken }) {
  const { lang, t } = useLanguage();
  const [selectedToken, setSelectedToken] = useState(initialSelectedToken || tokens[0]);
  const [entryPrice, setEntryPrice] = useState(selectedToken ? selectedToken.priceUsd * 0.7 : 0.0002);
  const [highestPrice, setHighestPrice] = useState(selectedToken ? selectedToken.priceUsd * 1.2 : 0.0005);
  const [trailingStopPct, setTrailingStopPct] = useState(15);

  const evaluation = selectedToken
    ? evaluateExitStrategy({
        token: selectedToken,
        entryPrice: Number(entryPrice),
        highestPriceSeen: Number(highestPrice),
        trailingStopPercentage: Number(trailingStopPct),
      })
    : null;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-[#16122b] to-[#0b1021] border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-amber-300">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">AI Exit Radar Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Capital preservation and profit maximization: Take Profit, Trailing Stop, Sell Pressure & Emergency Exit.'
                : 'Chiến lược bảo vệ vốn và tối đa hóa lợi nhuận: Take Profit, Trailing Stop, Sell Pressure & Thoát Khẩn Cấp.'}
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50">
          {lang === 'en' ? 'Analysis & Alert Only - Never Executes Autonomous Trades' : 'Chỉ phân tích & Cảnh báo - Tuyệt đối không tự động bán'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form cấu hình vị thế */}
        <div className="lg:col-span-5 bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#182142]">
            <Calculator className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === 'en' ? 'Configure Position Parameters' : 'Thiết Lập Vị Thế Cần Quét Thoát'}
            </h3>
          </div>

          {/* Chọn Token */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {lang === 'en' ? 'Select Monitored Token' : 'Chọn Token theo dõi'}
            </label>
            <select
              value={selectedToken?.id}
              onChange={(e) => {
                const tok = tokens.find((t) => t.id === e.target.value);
                if (tok) {
                  setSelectedToken(tok);
                  setEntryPrice(tok.priceUsd * 0.7);
                  setHighestPrice(tok.priceUsd * 1.2);
                }
              }}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
            >
              {tokens.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.symbol} - {t.name} ({t.chain}) - {lang === 'en' ? 'Live Price:' : 'Giá hiện tại:'} ${t.priceUsd}
                </option>
              ))}
            </select>
          </div>

          {/* Giá vốn (Entry Price) */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {lang === 'en' ? 'Entry Price (USD)' : 'Giá vốn mua vào (Entry Price USD)'}
            </label>
            <input
              type="number"
              step="any"
              value={entryPrice}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Đỉnh giá cao nhất từng đạt (Peak Price) */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {lang === 'en' ? 'Highest Price Seen (Peak USD)' : 'Đỉnh giá cao nhất kể từ lúc mua (Peak USD)'}
            </label>
            <input
              type="number"
              step="any"
              value={highestPrice}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setHighestPrice(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Ngưỡng Trailing Stop % */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{lang === 'en' ? 'Trailing Stop Distance from Peak:' : 'Ngưỡng Trailing Stop từ đỉnh:'}</span>
              <span className="text-amber-400 font-bold">-{trailingStopPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              value={trailingStopPct}
              onChange={(e) => setTrailingStopPct(e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>-5% ({lang === 'en' ? 'Tight' : 'Chặt chẽ'})</span>
              <span>-15% ({lang === 'en' ? 'Standard' : 'Chuẩn Meme'})</span>
              <span>-35% ({lang === 'en' ? 'Wide' : 'Rộng'})</span>
            </div>
          </div>
        </div>

        {/* Right Column: Kết quả phân tích Exit Radar */}
        <div className="lg:col-span-7 bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#182142]">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {lang === 'en' ? 'Exit Radar Signal Assessment' : 'Đánh Giá Tín Hiệu Thoát Vị Thế'}
                </h3>
              </div>

              {evaluation?.alertType && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  evaluation.alertType === 'EMERGENCY_EXIT'
                    ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-bounce'
                    : evaluation.alertType === 'TRAILING_STOP'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                }`}>
                  {evaluation.alertType}
                </span>
              )}
            </div>

            {/* Alert Headline Card */}
            <div className={`my-4 p-4 rounded-xl border ${
              evaluation?.hasSignal
                ? evaluation.alertType === 'EMERGENCY_EXIT'
                  ? 'bg-rose-950/40 border-rose-600/50'
                  : 'bg-amber-950/40 border-amber-600/50'
                : 'bg-[#0e142b] border-[#192348]'
            }`}>
              <div className="text-sm font-bold text-white mb-1.5 flex items-center space-x-2">
                <span>{evaluation?.headline}</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-medium">
                {lang === 'en' ? 'Recommendation:' : 'Khuyến nghị:'} {evaluation?.recommendedAction}
              </div>
              {evaluation?.suggestedSellPercentage && (
                <div className="mt-2 text-xs font-bold text-amber-400">
                  {lang === 'en'
                    ? `Suggested Sell Ratio: ${evaluation.suggestedSellPercentage}% of position.`
                    : `Tỷ lệ chốt đề xuất: ${evaluation.suggestedSellPercentage}% khối lượng.`}
                </div>
              )}
            </div>

            {/* Rationale Checklist */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'en' ? 'Rationale & Supporting Evidence:' : 'Lý do & Dữ liệu căn cứ:'}
              </div>
              {evaluation?.rationale.map((r, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Nguyên tắc cốt lõi theo Section VII */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#182142] text-[11px] text-slate-400">
            <div className="bg-[#080d1e] p-2.5 rounded-xl border border-[#161f3d]">
              <span className="text-white font-semibold block mb-0.5">
                {lang === 'en' ? 'A. Staggered Take Profit' : 'A. Take Profit Bậc Thang'}
              </span>
              {lang === 'en'
                ? 'Scale out in tranches (TP1, TP2, TP3), never forced to exit 100% at once.'
                : 'Chốt lời từng phần (TP1, TP2, TP3), không bắt buộc bán toàn bộ.'}
            </div>
            <div className="bg-[#080d1e] p-2.5 rounded-xl border border-[#161f3d]">
              <span className="text-white font-semibold block mb-0.5">
                {lang === 'en' ? 'B. One-Way Trailing Stop' : 'B. Trailing Stop 1 Chiều'}
              </span>
              {lang === 'en'
                ? 'Only raise stop when higher highs form; never lower stop on pullbacks.'
                : 'Chỉ nâng ngưỡng khi có đỉnh mới, không hạ ngưỡng khi giá giảm.'}
            </div>
            <div className="bg-[#080d1e] p-2.5 rounded-xl border border-[#161f3d]">
              <span className="text-white font-semibold block mb-0.5">
                {lang === 'en' ? 'C. Selling Pressure & Distribution' : 'C. Áp Lực Bán & Phân Phối'}
              </span>
              {lang === 'en'
                ? 'Warns when whales deposit to pools or buyer flow decays rapidly.'
                : 'Cảnh báo khi ví lớn nạp token vào pool hoặc người mua mới suy giảm.'}
            </div>
            <div className="bg-[#080d1e] p-2.5 rounded-xl border border-[#161f3d]">
              <span className="text-rose-400 font-semibold block mb-0.5">
                {lang === 'en' ? 'D. Emergency Exit' : 'D. Thoát Khẩn Cấp'}
              </span>
              {lang === 'en'
                ? 'Immediate high-priority alert on rug-pulls or drained liquidity.'
                : 'Thanh khoản bị rút, honeypot - ưu tiên tối cao không bị cooldown chặn.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
