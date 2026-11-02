import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Filter,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import ChainIcon from '../components/ChainIcon';
import { getAdapter } from '../adapters';
import { useLanguage } from '../i18n/LanguageContext';

export default function AlertCenterView({ alerts }) {
  const { lang, t } = useLanguage();
  const [selectedType, setSelectedType] = useState('ALL');
  const [copiedCA, setCopiedCA] = useState(null);

  const copyCA = (ca) => {
    navigator.clipboard.writeText(ca);
    setCopiedCA(ca);
    setTimeout(() => setCopiedCA(null), 2000);
  };

  const filteredAlerts = alerts.filter(
    (a) => selectedType === 'ALL' || a.alertType === selectedType
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-[#1a1438] to-[#0b1021] border border-purple-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Alert Center & Signal Manager</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Multi-strategy alert system with verifiable evidence data, anti-spam filters, and emergency exit priority.'
                : 'Hệ thống cảnh báo đa chiến lược có đính kèm dữ liệu bằng chứng (Evidence), chống spam & ưu tiên cảnh báo khẩn cấp.'}
            </p>
          </div>
        </div>

        {/* Filter by 6 Alert Types */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#090d1c] p-1.5 rounded-xl border border-[#1b2545] text-xs">
          {[
            { id: 'ALL', label: lang === 'en' ? 'All' : 'Tất cả' },
            { id: 'BUY_OPPORTUNITY', label: lang === 'en' ? 'Buy Opportunity' : 'Cơ hội Mua' },
            { id: 'TAKE_PROFIT', label: lang === 'en' ? 'Take Profit (TP)' : 'Chốt Lời (TP)' },
            { id: 'TRAILING_STOP', label: 'Trailing Stop' },
            { id: 'SELL_PRESSURE', label: lang === 'en' ? 'Sell Pressure' : 'Áp lực Bán' },
            { id: 'EMERGENCY_EXIT', label: lang === 'en' ? '🚨 Emergency Exit' : '🚨 Thoát Khẩn Cấp' },
            { id: 'RISK_WARNING', label: lang === 'en' ? 'Risk Warning' : 'Cảnh Báo Rủi Ro' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedType === type.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-[#141b36]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách Alert Card với đầy đủ thuộc tính yêu cầu ở Section IX */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const adapter = getAdapter(alert.chain);
          const isEmergency = alert.alertType === 'EMERGENCY_EXIT';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all ${
                isEmergency
                  ? 'bg-rose-950/20 border-rose-600/60 shadow-lg shadow-rose-950/30'
                  : alert.alertType === 'BUY_OPPORTUNITY'
                  ? 'bg-[#0b1021]/90 border-emerald-800/40'
                  : alert.alertType === 'TAKE_PROFIT' || alert.alertType === 'TRAILING_STOP'
                  ? 'bg-[#0b1021]/90 border-amber-800/40'
                  : 'bg-[#0b1021]/90 border-[#1a2347]'
              }`}
            >
              {/* Header của Alert */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#182142]">
                <div className="flex items-center space-x-2.5">
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    alert.alertType === 'EMERGENCY_EXIT'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : alert.alertType === 'BUY_OPPORTUNITY'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                      : alert.alertType === 'TAKE_PROFIT'
                      ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                      : alert.alertType === 'TRAILING_STOP'
                      ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                      : 'bg-rose-950 text-rose-300 border border-rose-600/50'
                  }`}>
                    {alert.alertType}
                  </span>

                  <span className="text-sm font-bold text-white">{alert.tokenSymbol}</span>
                  <span className="text-xs text-slate-400 font-normal">({alert.tokenName})</span>

                  <span className="flex items-center space-x-1 text-xs text-slate-400 bg-[#090d1c] px-2 py-0.5 rounded border border-[#1b2545]">
                    <ChainIcon chain={alert.chain} className="w-3 h-3" />
                    <span>{alert.chain}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.timestamp).toLocaleTimeString()} (UTC+7)</span>
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : alert.severity === 'HIGH'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {lang === 'en' ? 'LEVEL:' : 'MỨC:'} {alert.severity}
                  </span>
                </div>
              </div>

              {/* Nội dung và lý do cảnh báo */}
              <div className="my-3">
                <div className="text-xs font-semibold text-slate-200 leading-relaxed mb-1.5">
                  {lang === 'en' ? 'Alert Reason:' : 'Lý do cảnh báo:'} {alert.reason}
                </div>

                {/* Bằng chứng (Evidence Data Table) */}
                <div className="bg-[#080d1e] rounded-xl p-3 border border-[#17203d] my-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'en' ? 'Verifiable Evidence Metrics:' : 'Dữ Liệu Bằng Chứng Xác Thực (Evidence Metrics):'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {alert.evidence.map((ev, i) => (
                      <div key={i} className="text-xs bg-[#0b1021] p-2 rounded-lg border border-[#1a2348]">
                        <span className="text-slate-400 block text-[10px]">{ev.metric}</span>
                        <div className="flex justify-between items-baseline mt-0.5">
                          <span className="font-bold text-white font-mono">{ev.value}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{lang === 'en' ? 'Threshold:' : 'Chuẩn:'} {ev.threshold}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer của Alert: CA, Điểm, Nguồn dữ liệu & Trạng thái xác minh */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#182142] text-[11px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="font-mono">CA: {adapter.formatAddress(alert.contractAddress)}</span>
                  <button
                    onClick={() => copyCA(alert.contractAddress)}
                    className="hover:text-white"
                    title="Copy CA"
                  >
                    {copiedCA === alert.contractAddress ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <a
                    href={adapter.getExplorerAddressUrl(alert.contractAddress)}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-purple-300"
                  >
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </div>

                <div className="flex items-center space-x-4">
                  <span>{lang === 'en' ? 'Opp Score:' : 'Điểm Cơ hội:'} <strong className="text-emerald-400">{alert.opportunityScore}</strong></span>
                  <span>{lang === 'en' ? 'Risk Score:' : 'Điểm Rủi ro:'} <strong className="text-rose-400">{alert.riskScore}</strong></span>
                  <span>{lang === 'en' ? 'Source:' : 'Nguồn:'} <strong className="text-slate-300">{alert.dataSource}</strong></span>
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{lang === 'en' ? 'VERIFIED' : 'ĐÃ XÁC MINH'}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
