import React, { useState } from 'react';

export default function MiniChart({ tokenSymbol }) {
  const [timeframe, setTimeframe] = useState('1D');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Generate realistic candlestick data for the given token
  const candles = [
    { open: 20, high: 28, low: 18, close: 26, vol: 15, isGreen: true },
    { open: 26, high: 32, low: 24, close: 29, vol: 22, isGreen: true },
    { open: 29, high: 30, low: 22, close: 24, vol: 18, isGreen: false },
    { open: 24, high: 35, low: 23, close: 33, vol: 28, isGreen: true },
    { open: 33, high: 38, low: 30, close: 36, vol: 35, isGreen: true },
    { open: 36, high: 42, low: 34, close: 40, vol: 40, isGreen: true },
    { open: 40, high: 43, low: 36, close: 37, vol: 25, isGreen: false },
    { open: 37, high: 46, low: 36, close: 45, vol: 48, isGreen: true },
    { open: 45, high: 52, low: 43, close: 50, vol: 55, isGreen: true },
    { open: 50, high: 55, low: 46, close: 48, vol: 30, isGreen: false },
    { open: 48, high: 58, low: 47, close: 56, vol: 62, isGreen: true },
    { open: 56, high: 64, low: 54, close: 62, vol: 70, isGreen: true },
    { open: 62, high: 68, low: 58, close: 60, vol: 45, isGreen: false },
    { open: 60, high: 72, low: 59, close: 70, vol: 85, isGreen: true },
    { open: 70, high: 78, low: 68, close: 76, vol: 92, isGreen: true },
    { open: 76, high: 84, low: 72, close: 82, vol: 100, isGreen: true },
  ];

  const maxVal = 90;
  const chartHeight = 85;
  const volHeight = 35;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Timeframe Controls */}
      <div className="flex items-center justify-end space-x-1 mb-2">
        {['1h', '4h', '1D', '1W'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              timeframe === tf
                ? 'bg-purple-600/40 text-purple-300 font-medium border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Candlestick & Volume Chart */}
      <div className="relative w-full h-32 flex flex-col justify-end">
        {/* Price Candlesticks */}
        <div className="relative h-20 w-full flex items-end justify-between px-1">
          {candles.map((candle, idx) => {
            const highPct = (candle.high / maxVal) * 100;
            const lowPct = (candle.low / maxVal) * 100;
            const topPct = (Math.max(candle.open, candle.close) / maxVal) * 100;
            const bottomPct = (Math.min(candle.open, candle.close) / maxVal) * 100;
            const bodyHeight = Math.max(topPct - bottomPct, 3);

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative flex flex-col items-center group cursor-pointer"
                style={{ width: `${100 / candles.length - 1}%`, height: '100%' }}
              >
                {/* Wick line */}
                <div
                  className={`absolute w-[1.5px] rounded-full transition-all ${
                    candle.isGreen ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                  style={{
                    bottom: `${lowPct}%`,
                    height: `${highPct - lowPct}%`,
                  }}
                />
                {/* Candle body */}
                <div
                  className={`absolute w-full rounded-[1.5px] transition-all shadow-sm ${
                    candle.isGreen
                      ? 'bg-emerald-400 shadow-emerald-500/40'
                      : 'bg-rose-500 shadow-rose-500/40'
                  } ${hoveredIndex === idx ? 'scale-110 brightness-125' : ''}`}
                  style={{
                    bottom: `${bottomPct}%`,
                    height: `${bodyHeight}%`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Horizontal separator line */}
        <div className="w-full h-[1px] bg-slate-800/80 my-1" />

        {/* Volume Bars */}
        <div className="relative h-8 w-full flex items-end justify-between px-1">
          {candles.map((candle, idx) => {
            const barHeight = (candle.vol / 100) * 100;
            return (
              <div
                key={idx}
                className="flex items-end justify-center"
                style={{ width: `${100 / candles.length - 1}%`, height: '100%' }}
              >
                <div
                  className={`w-full rounded-t-[1px] opacity-75 transition-all ${
                    candle.isGreen ? 'bg-emerald-500/60' : 'bg-rose-500/60'
                  } ${hoveredIndex === idx ? 'opacity-100' : ''}`}
                  style={{ height: `${barHeight}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
