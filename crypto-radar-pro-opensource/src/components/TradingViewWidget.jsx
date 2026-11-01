import React, { useEffect, useRef, useState, memo } from 'react';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

function TradingViewWidget({ symbol = 'BTC', interval = 'D', theme = 'dark' }) {
  const containerRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    setLoadError(false);
    setIsReady(false);

    // Clean symbol formatting
    const raw = (symbol || 'BTC').toUpperCase().replace('$', '').trim();
    let tvSymbol = `BINANCE:${raw}USDT`;
    if (raw === 'BTC') tvSymbol = 'BINANCE:BTCUSDT';
    else if (raw === 'ETH') tvSymbol = 'BINANCE:ETHUSDT';
    else if (raw === 'SOL') tvSymbol = 'BINANCE:SOLUSDT';

    const containerId = `tv_chart_${raw}_${Math.random().toString(36).substring(7)}`;

    // Create container elements
    containerRef.current.innerHTML = `
      <div id="${containerId}" style="height: 100%; width: 100%;"></div>
    `;

    // Load TradingView Script dynamically
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      try {
        if (typeof window.TradingView !== 'undefined') {
          new window.TradingView.widget({
            autosize: true,
            symbol: tvSymbol,
            interval: interval || '60',
            timezone: 'Asia/Ho_Chi_Minh',
            theme: 'dark',
            style: '1',
            locale: 'vi_VN',
            toolbar_bg: '#080c1d',
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: containerId,
            hide_side_toolbar: false,
            studies: [
              'STD;EMA',
              'STD;RSI'
            ],
            disabled_features: ['use_localstorage_for_settings'],
            enabled_features: ['study_templates'],
            loading_screen: { backgroundColor: '#080c1d', foregroundColor: '#8b5cf6' },
            overrides: {
              'paneProperties.background': '#080c1d',
              'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.04)',
              'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.04)',
              'scalesProperties.textColor': '#94a3b8',
              'mainSeriesProperties.candleStyle.upColor': '#10b981',
              'mainSeriesProperties.candleStyle.downColor': '#f43f5e',
              'mainSeriesProperties.candleStyle.borderUpColor': '#10b981',
              'mainSeriesProperties.candleStyle.borderDownColor': '#f43f5e',
              'mainSeriesProperties.candleStyle.wickUpColor': '#10b981',
              'mainSeriesProperties.candleStyle.wickDownColor': '#f43f5e',
            },
          });
          setIsReady(true);
        } else {
          setLoadError(true);
        }
      } catch (e) {
        console.error('TradingView init error:', e);
        setLoadError(true);
      }
    };

    script.onerror = () => {
      setLoadError(true);
    };

    document.head.appendChild(script);

    // Timeout safety check
    const timeout = setTimeout(() => {
      if (!isReady && typeof window.TradingView === 'undefined') {
        setLoadError(true);
      }
    }, 4500);

    return () => {
      clearTimeout(timeout);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval]);

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#070b1c] rounded-xl p-6 text-center border border-[#1a254d]">
        <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">TradingView Cloud Đang Tải...</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-3">
          Kết nối TradingView API đang được làm mới hoặc chế độ ngoại tuyến. Bạn có thể bấm nút chuyển sang <strong>"AI Radar Pro Canvas"</strong> để xem đồ thị nến mượt mà tức thì.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#080c1d] rounded-xl" ref={containerRef}>
      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">
        Đang khởi tạo Siêu Đồ Thị TradingView...
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
