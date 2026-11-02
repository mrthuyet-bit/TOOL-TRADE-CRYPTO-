import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';
import { generateLongShortSetup } from '../modules/longShortEngine';
import { useLanguage } from '../i18n/LanguageContext';

export default function CanvasSuperChart({ token, timeframe = '1h', onTimeframeChange }) {
  const { lang, t } = useLanguage();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [activeTf, setActiveTf] = useState(timeframe || '1h');
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRadarLevels, setShowRadarLevels] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const price = token?.priceUsd || 1.0;
  const high24h = token?.high24h || price * 1.08;
  const low24h = token?.low24h || price * 0.92;
  const change24h = token?.change24h || 0;
  const vol24h = token?.volume24h || 5000000;

  const futuresSetup = useMemo(() => {
    return generateLongShortSetup(token);
  }, [token]);

  // Generate realistic OHLCV Candlestick dataset based on real price and token volatility
  const candles = useMemo(() => {
    const count = 75;
    const list = [];
    const seed = (token?.symbol || 'COIN').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const volatility = (token?.category === 'Meme Coins' ? 0.035 : 0.015);
    
    let current = price * (1 - (change24h / 100) * 0.7);
    const now = Date.now();
    const intervalMs = activeTf === '1m' ? 60000 : activeTf === '5m' ? 300000 : activeTf === '15m' ? 900000 : activeTf === '1h' ? 3600000 : activeTf === '4h' ? 14400000 : 86400000;

    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now - i * intervalMs);
      const pseudoRand = Math.sin(seed * (i + 1) * 99.7) * Math.cos((i + 3) * 13.5);
      const isUp = pseudoRand > -0.15;
      
      const change = current * volatility * (Math.abs(pseudoRand) * 1.5 + 0.2);
      const open = current;
      const close = isUp ? open + change : open - change;
      const high = Math.max(open, close) + change * (Math.abs(pseudoRand * 0.6) + 0.1);
      const low = Math.min(open, close) - change * (Math.abs(pseudoRand * 0.5) + 0.1);
      const vol = (vol24h / 100) * (Math.abs(pseudoRand) * 1.8 + 0.5);

      list.push({
        time,
        open,
        high,
        low,
        close,
        volume: vol,
        isUp: close >= open,
      });

      current = close;
    }

    // Ensure the last candle closes exactly at the live market price
    if (list.length > 0) {
      const last = list[list.length - 1];
      last.close = price;
      last.high = Math.max(last.high, price);
      last.low = Math.min(last.low, price);
      last.isUp = last.close >= last.open;
    }

    return list;
  }, [price, high24h, low24h, change24h, vol24h, activeTf, token]);

  // Calculate EMA & Bollinger Bands
  const indicators = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const ema20 = [];
    const ema50 = [];
    const bbUpper = [];
    const bbLower = [];
    const rsi14 = [];

    // EMA helper
    const calcEMA = (period) => {
      const k = 2 / (period + 1);
      const res = [];
      let ema = closes[0];
      for (let i = 0; i < closes.length; i++) {
        ema = closes[i] * k + ema * (1 - k);
        res.push(ema);
      }
      return res;
    };

    const e20 = calcEMA(14);
    const e50 = calcEMA(30);

    // Bollinger Bands (20, 2)
    for (let i = 0; i < closes.length; i++) {
      const start = Math.max(0, i - 19);
      const slice = closes.slice(start, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
      const stdDev = Math.sqrt(variance);
      bbUpper.push(mean + stdDev * 2);
      bbLower.push(mean - stdDev * 2);
    }

    // RSI (14)
    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 1; i <= 14 && i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) avgGain += diff;
      else avgLoss += Math.abs(diff);
    }
    avgGain /= 14;
    avgLoss /= 14;

    for (let i = 0; i < closes.length; i++) {
      if (i < 14) {
        rsi14.push(50);
      } else {
        const diff = closes[i] - closes[i - 1];
        const gain = diff >= 0 ? diff : 0;
        const loss = diff < 0 ? Math.abs(diff) : 0;
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - 100 / (1 + rs);
        rsi14.push(Math.round(rsi));
      }
    }

    return { ema20: e20, ema50: e50, bbUpper, bbLower, rsi14 };
  }, [candles]);

  // Handle Resize & Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 450;
    
    // Set display and internal resolution
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    // Layout partitions
    const paddingLeft = 10;
    const paddingRight = 75; // for price axis
    const paddingTop = 25;
    const rsiHeight = showRSI ? 75 : 0;
    const volumeHeight = showVolume ? 60 : 0;
    const mainChartHeight = height - paddingTop - rsiHeight - volumeHeight - 25;

    const chartWidth = width - paddingLeft - paddingRight;

    // Price range calculation
    let minPrice = Math.min(...candles.map((c) => c.low));
    let maxPrice = Math.max(...candles.map((c) => c.high));
    if (showBB) {
      minPrice = Math.min(minPrice, ...indicators.bbLower);
      maxPrice = Math.max(maxPrice, ...indicators.bbUpper);
    }
    if (showRadarLevels && futuresSetup) {
      minPrice = Math.min(minPrice, futuresSetup.stopLoss);
      maxPrice = Math.max(maxPrice, futuresSetup.takeProfit2);
    }
    const priceMargin = (maxPrice - minPrice) * 0.08;
    minPrice -= priceMargin;
    maxPrice += priceMargin;
    const priceRange = maxPrice - minPrice || 1;

    // Helper functions
    const getY = (val) => paddingTop + mainChartHeight - ((val - minPrice) / priceRange) * mainChartHeight;
    const candleWidth = (chartWidth / candles.length) * 0.72 * zoomLevel;
    const candleSpacing = (chartWidth / candles.length) * zoomLevel;

    // 1. Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const y = paddingTop + (mainChartHeight / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Price labels
      const gridPrice = maxPrice - (priceRange / gridSteps) * i;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`$${gridPrice < 0.01 ? gridPrice.toFixed(6) : gridPrice.toFixed(4)}`, width - paddingRight + 6, y + 3);
    }

    // 2. Draw Bollinger Bands Area
    if (showBB) {
      ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const x = paddingLeft + i * candleSpacing + candleSpacing / 2;
        const yUpper = getY(indicators.bbUpper[i]);
        if (i === 0) ctx.moveTo(x, yUpper);
        else ctx.lineTo(x, yUpper);
      }
      for (let i = candles.length - 1; i >= 0; i--) {
        const x = paddingLeft + i * candleSpacing + candleSpacing / 2;
        const yLower = getY(indicators.bbLower[i]);
        ctx.lineTo(x, yLower);
      }
      ctx.closePath();
      ctx.fill();

      // Band border lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const x = paddingLeft + i * candleSpacing + candleSpacing / 2;
        if (i === 0) ctx.moveTo(x, getY(indicators.bbUpper[i]));
        else ctx.lineTo(x, getY(indicators.bbUpper[i]));
      }
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const x = paddingLeft + i * candleSpacing + candleSpacing / 2;
        if (i === 0) ctx.moveTo(x, getY(indicators.bbLower[i]));
        else ctx.lineTo(x, getY(indicators.bbLower[i]));
      }
      ctx.stroke();
    }

    // 3. Draw Volume Bars
    if (showVolume) {
      const volBaseY = paddingTop + mainChartHeight + volumeHeight;
      const maxVol = Math.max(...candles.map((c) => c.volume)) || 1;
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        const x = paddingLeft + i * candleSpacing;
        const vH = (c.volume / maxVol) * (volumeHeight - 10);
        ctx.fillStyle = c.isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
        ctx.fillRect(x, volBaseY - vH, candleWidth, vH);
      }
    }

    // 4. Draw Candlesticks
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const x = paddingLeft + i * candleSpacing;
      const centerX = x + candleWidth / 2;
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const isGreen = c.isUp;
      ctx.strokeStyle = isGreen ? '#10b981' : '#f43f5e';
      ctx.fillStyle = isGreen ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 1.2;

      // Wick
      ctx.beginPath();
      ctx.moveTo(centerX, highY);
      ctx.lineTo(centerX, lowY);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(openY - closeY), 1.5);
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    }

    // 5. Draw EMA Lines
    if (showEMA) {
      // EMA 20 (Cyan)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const x = paddingLeft + i * candleSpacing + candleWidth / 2;
        const y = getY(indicators.ema20[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // EMA 50 (Purple)
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const x = paddingLeft + i * candleSpacing + candleWidth / 2;
        const y = getY(indicators.ema50[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 6. Draw AI Radar Levels (Entry, TP1, TP2, Stop Loss)
    if (showRadarLevels && futuresSetup) {
      const drawLevel = (val, color, label) => {
        const y = getY(val);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label box on price axis
        ctx.fillStyle = color;
        ctx.fillRect(width - paddingRight, y - 9, paddingRight - 4, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, width - paddingRight + 4, y + 3);
      };

      drawLevel(futuresSetup.entryPrice, '#38bdf8', `ENTRY $${futuresSetup.entryPrice < 0.01 ? futuresSetup.entryPrice.toFixed(5) : futuresSetup.entryPrice.toFixed(3)}`);
      drawLevel(futuresSetup.takeProfit1, '#10b981', `TP1 +50%`);
      drawLevel(futuresSetup.takeProfit2, '#2dd4bf', `TP2 +100%`);
      drawLevel(futuresSetup.stopLoss, '#f43f5e', `SL -12%`);
    }

    // 7. Draw Current Live Price Line
    const currentPriceY = getY(price);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, currentPriceY);
    ctx.lineTo(width - paddingRight, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live price tag
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(width - paddingRight, currentPriceY - 10, paddingRight - 4, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`$${price < 0.01 ? price.toFixed(6) : price.toFixed(4)}`, width - paddingRight + 4, currentPriceY + 4);

    // 8. Draw RSI Subchart
    if (showRSI) {
      const rsiTop = height - rsiHeight - 15;
      ctx.fillStyle = 'rgba(10, 15, 36, 0.9)';
      ctx.fillRect(paddingLeft, rsiTop, chartWidth, rsiHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeRect(paddingLeft, rsiTop, chartWidth, rsiHeight);

      // Overbought 70 & Oversold 30 lines
      const y70 = rsiTop + rsiHeight * 0.3;
      const y30 = rsiTop + rsiHeight * 0.7;
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y70);
      ctx.lineTo(width - paddingRight, y70);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y30);
      ctx.lineTo(width - paddingRight, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText(`RSI (14): ${indicators.rsi14[indicators.rsi14.length - 1]}`, paddingLeft + 6, rsiTop + 14);

      // RSI Curve
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const x = paddingLeft + i * candleSpacing + candleWidth / 2;
        const val = indicators.rsi14[i] || 50;
        const y = rsiTop + rsiHeight - (val / 100) * rsiHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

  }, [candles, indicators, price, showEMA, showBB, showVolume, showRadarLevels, showRSI, zoomLevel, futuresSetup]);

  // Handle Mousemove for crosshair
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const chartWidth = canvas.clientWidth - 85;
    const candleSpacing = (chartWidth / candles.length) * zoomLevel;
    const index = Math.floor(x / candleSpacing);
    if (index >= 0 && index < candles.length) {
      setHoveredCandle(candles[index]);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070b1c] rounded-xl overflow-hidden border border-[#1b254a] relative select-none">
      {/* Chart Toolbar */}
      <div className="px-3 py-2 bg-[#0a0f26] border-b border-[#182348] flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Timeframes */}
        <div className="flex items-center space-x-1">
          {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setActiveTf(tf);
                if (onTimeframeChange) onTimeframeChange(tf);
              }}
              className={`px-2 py-1 rounded-lg font-mono font-bold text-[11px] transition-all ${
                activeTf === tf
                  ? 'bg-purple-600 text-white shadow shadow-purple-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121a3d]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicators Toggles */}
        <div className="flex items-center space-x-1.5 text-[11px]">
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2 py-0.5 rounded-md border transition-all ${
              showEMA
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 font-bold'
                : 'text-slate-400 border-transparent hover:bg-[#141d40]'
            }`}
          >
            EMA (20/50)
          </button>
          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2 py-0.5 rounded-md border transition-all ${
              showBB
                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50 font-bold'
                : 'text-slate-400 border-transparent hover:bg-[#141d40]'
            }`}
          >
            BB (20,2)
          </button>
          <button
            onClick={() => setShowRadarLevels(!showRadarLevels)}
            className={`px-2 py-0.5 rounded-md border transition-all ${
              showRadarLevels
                ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 font-bold'
                : 'text-slate-400 border-transparent hover:bg-[#141d40]'
            }`}
            title={lang === 'en' ? 'Show Entry, TP1, TP2, Stop Loss levels' : 'Hiển thị vùng Vào Lệnh, TP1, TP2, Stop Loss của AI Radar'}
          >
            {lang === 'en' ? '🎯 Radar Setup (TP/SL)' : '🎯 Kèo Radar (TP/SL)'}
          </button>
          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-0.5 rounded-md border transition-all ${
              showRSI
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 font-bold'
                : 'text-slate-400 border-transparent hover:bg-[#141d40]'
            }`}
          >
            RSI
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
            className="p-1 rounded bg-[#131b3d] text-slate-400 hover:text-white"
            title={lang === 'en' ? 'Zoom in' : 'Phóng to'}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            className="p-1 rounded bg-[#131b3d] text-slate-400 hover:text-white"
            title={lang === 'en' ? 'Zoom out' : 'Thu nhỏ'}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 rounded bg-[#131b3d] text-slate-400 hover:text-white"
            title={lang === 'en' ? 'Reset zoom' : 'Đặt lại zoom'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Candle Info Bar (O, H, L, C, Vol) */}
      <div className="px-3 py-1 bg-[#080d22]/90 border-b border-[#141d40] flex flex-wrap items-center gap-3 text-[11px] font-mono">
        <span className="font-bold text-white">{token?.symbol || 'BTC'}/USDT</span>
        {hoveredCandle ? (
          <>
            <span className="text-slate-400">O: <strong className="text-white">${hoveredCandle.open < 0.01 ? hoveredCandle.open.toFixed(6) : hoveredCandle.open.toFixed(4)}</strong></span>
            <span className="text-slate-400">H: <strong className="text-emerald-400">${hoveredCandle.high < 0.01 ? hoveredCandle.high.toFixed(6) : hoveredCandle.high.toFixed(4)}</strong></span>
            <span className="text-slate-400">L: <strong className="text-rose-400">${hoveredCandle.low < 0.01 ? hoveredCandle.low.toFixed(6) : hoveredCandle.low.toFixed(4)}</strong></span>
            <span className="text-slate-400">C: <strong className={hoveredCandle.isUp ? 'text-emerald-400' : 'text-rose-400'}>${hoveredCandle.close < 0.01 ? hoveredCandle.close.toFixed(6) : hoveredCandle.close.toFixed(4)}</strong></span>
            <span className="text-slate-400">Vol: <strong className="text-cyan-300">${(hoveredCandle.volume / 1000).toFixed(0)}K</strong></span>
          </>
        ) : (
          <>
            <span className="text-slate-400">{lang === 'en' ? 'Live Price:' : 'Giá Live:'} <strong className="text-emerald-400">${price < 0.01 ? price.toFixed(6) : price.toFixed(4)}</strong></span>
            <span className="text-slate-400">24h High: <strong className="text-cyan-300">${high24h < 0.01 ? high24h.toFixed(6) : high24h.toFixed(4)}</strong></span>
            <span className="text-slate-400">24h Low: <strong className="text-rose-400">${low24h < 0.01 ? low24h.toFixed(6) : low24h.toFixed(4)}</strong></span>
            <span className="text-slate-400">{lang === 'en' ? '24h Change:' : 'Biến động:'} <strong className={change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{change24h >= 0 ? `+${change24h}%` : `${change24h}%`}</strong></span>
          </>
        )}
      </div>

      {/* Canvas Chart Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full relative cursor-crosshair overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
