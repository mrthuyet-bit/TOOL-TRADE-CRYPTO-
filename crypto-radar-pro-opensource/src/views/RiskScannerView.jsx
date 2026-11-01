import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileQuestion,
  ExternalLink,
  Flame,
  Search
} from 'lucide-react';
import { evaluateTokenRisks } from '../modules/riskScanner';
import ChainIcon from '../components/ChainIcon';
import { getAdapter } from '../adapters';
import { useLanguage } from '../i18n/LanguageContext';

export default function RiskScannerView({ tokens, initialSelectedToken }) {
  const { lang, t } = useLanguage();
  const [selectedToken, setSelectedToken] = useState(initialSelectedToken || tokens[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const report = selectedToken ? evaluateTokenRisks(selectedToken) : null;
  const adapter = selectedToken ? getAdapter(selectedToken.chain) : null;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-950/60 via-[#1c122b] to-[#0b1021] border border-rose-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Token Security & Risk Scanner</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Smart contract audit, Honeypot detection, mint/freeze permissions, hidden taxes, and Top Holders concentration.'
                : 'Kiểm tra hợp đồng thông minh, mã độc Honeypot, quyền mint/freeze, thuế ẩn và phân bổ Top Holders.'}
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
          {lang === 'en'
            ? 'Rule: "No risk detected" does not guarantee "100% safe"'
            : 'Quy tắc: "Chưa phát hiện rủi ro" không đồng nghĩa với "Tuyệt đối an toàn"'}
        </div>
      </div>

      {/* Selector Token */}
      <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <span>{lang === 'en' ? 'Select Token to Audit:' : 'Chọn Token quét an toàn:'}</span>
          <select
            value={selectedToken?.id}
            onChange={(e) => {
              const t = tokens.find((tok) => tok.id === e.target.value);
              if (t) setSelectedToken(t);
            }}
            className="bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
          >
            {tokens.map((t) => (
              <option key={t.id} value={t.id}>
                {t.symbol} - {t.name} ({t.chain}) - {lang === 'en' ? 'Risk Score:' : 'Điểm rủi ro:'} {t.riskScore}/100
              </option>
            ))}
          </select>
        </div>

        {selectedToken && adapter && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-mono">
              {lang === 'en' ? 'Contract:' : 'Hợp đồng:'} {adapter.formatAddress(selectedToken.contractAddress)}
            </span>
            <a
              href={adapter.getExplorerAddressUrl(selectedToken.contractAddress)}
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 hover:text-white flex items-center space-x-0.5"
            >
              <span>{lang === 'en' ? 'View on Explorer' : 'Xem trên Explorer'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Báo cáo rủi ro chi tiết */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Tổng quan Điểm rủi ro (4 cột) */}
          <div className="lg:col-span-4 bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {lang === 'en' ? 'Overall Risk Evaluation' : 'Tổng Hợp Đánh Giá Rủi Ro'}
              </div>

              <div className="text-center py-6 bg-[#080d1e] rounded-xl border border-[#17203d] my-3">
                <div className={`text-4xl font-extrabold font-mono ${
                  report.overallRiskScore >= 60
                    ? 'text-rose-400'
                    : report.overallRiskScore >= 35
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {report.overallRiskScore} / 100
                </div>
                <div className="text-xs font-bold uppercase tracking-wider mt-1 text-slate-300">
                  {lang === 'en' ? 'Level:' : 'Mức độ:'} {report.riskLevel}
                </div>
              </div>

              {/* Cảnh báo nghiêm trọng nếu có */}
              {report.criticalWarnings.length > 0 ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/50 space-y-1.5">
                  <div className="text-xs font-bold text-rose-300 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>{lang === 'en' ? 'CRITICAL RISK WARNING' : 'CẢNH BÁO NGUY HIỂM'}</span>
                  </div>
                  {report.criticalWarnings.map((w, i) => (
                    <div key={i} className="text-xs text-rose-200">
                      • {w}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/50 text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'en' ? 'No malicious sell-blocking or excessive minting detected.' : 'Không phát hiện dấu hiệu mã độc chặn bán hoặc mint bừa bãi.'}</span>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-[#182142]">
              {report.disclaimer}
            </div>
          </div>

          {/* Bảng Chi tiết từng hạng mục phân loại theo 4 trạng thái (8 cột) */}
          <div className="lg:col-span-8 bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#182142]">
              <div className="text-sm font-bold text-white">{lang === 'en' ? 'Security & Risk Factors Checklist' : 'Chi Tiết Các Yếu Tố Bảo Mật & Rủi Ro'}</div>
              <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Verified by GoPlus + On-chain Bytecode' : 'Xác minh bởi GoPlus + On-chain Bytecode'}</div>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
              {report.factors.map((item, idx) => {
                const isRisk = item.status === 'RISK_DETECTED';
                const isSafe = item.status === 'NO_RISK_DETECTED';
                const isUnable = item.status === 'UNABLE_TO_VERIFY';

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between space-y-1.5 transition-colors ${
                      isRisk
                        ? 'bg-rose-950/20 border-rose-800/40'
                        : isSafe
                        ? 'bg-emerald-950/20 border-emerald-800/40'
                        : 'bg-amber-950/20 border-amber-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isRisk ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        ) : isSafe ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="text-xs font-bold text-white">{item.category}</span>
                      </div>

                      {/* 4 Trạng thái chuẩn mực */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isRisk
                          ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                          : isSafe
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                          : isUnable
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.status === 'RISK_DETECTED'
                          ? (lang === 'en' ? 'RISK DETECTED' : 'ĐÃ PHÁT HIỆN RỦI RO')
                          : item.status === 'NO_RISK_DETECTED'
                          ? (lang === 'en' ? 'NO RISK DETECTED' : 'CHƯA PHÁT HIỆN RỦI RO')
                          : item.status === 'UNABLE_TO_VERIFY'
                          ? (lang === 'en' ? 'UNABLE TO VERIFY' : 'CHƯA THỂ KIỂM TRA')
                          : (lang === 'en' ? 'INSUFFICIENT DATA' : 'DỮ LIỆU KHÔNG ĐẦY ĐỦ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed pl-6">
                      {item.detail}
                    </div>

                    <div className="text-[10px] text-slate-500 pl-6 flex items-center justify-between">
                      <span>{lang === 'en' ? 'Verified by:' : 'Nguồn xác minh:'} {item.verifiedBy}</span>
                      <span className="text-slate-600 font-mono">Severity: {item.severity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
