import React, { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function MarketOverviewChart() {
  const { lang, t } = useLanguage();
  const [timeframe, setTimeframe] = useState('24h');

  // Smooth SVG wave path
  return (
    <div className="bg-[#0b1021]/80 backdrop-blur border border-[#1b2545] rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200">{lang === 'en' ? 'Market Overview' : 'Tổng quan thị trường'}</h3>
        <div className="flex items-center space-x-1 text-xs text-slate-400 bg-[#141b36] hover:bg-[#1a2347] px-2.5 py-1 rounded-lg border border-[#24315c] cursor-pointer">
          <span>{timeframe}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Glowing Purple Area Wave Chart */}
      <div className="relative h-24 w-full my-2">
        <svg
          viewBox="0 0 320 80"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Area fill */}
          <path
            d="M0,58 Q 30,55 55,48 T 110,40 T 160,52 T 210,30 T 260,22 T 320,18 L 320,80 L 0,80 Z"
            fill="url(#purpleGradient)"
          />

          {/* Glowing Stroke */}
          <path
            d="M0,58 Q 30,55 55,48 T 110,40 T 160,52 T 210,30 T 260,22 T 320,18"
            fill="none"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Interactive pulse point at the latest price */}
          <circle cx="318" cy="18" r="4.5" fill="#c084fc" className="animate-pulse" />
          <circle cx="318" cy="18" r="7" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1a2347]">
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">{lang === 'en' ? 'Total Market Cap' : 'Tổng vốn hóa'}</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-bold text-slate-100">$ 2.48T</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              +3.2%
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">{lang === 'en' ? '24h Volume' : 'Khối lượng (24h)'}</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-bold text-slate-100">$ 128.7B</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              +18.6%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
