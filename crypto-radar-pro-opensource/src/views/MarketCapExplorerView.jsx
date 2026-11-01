import React, { useState, useMemo } from 'react';
import {
  Coins,
  Search,
  Download,
  Filter,
  Building2,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Globe
} from 'lucide-react';
import coinsData from '../data/coins10MPlus.json';
import ChainIcon from '../components/ChainIcon';
import { useLanguage } from '../i18n/LanguageContext';

export default function MarketCapExplorerView() {
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedChain, setSelectedChain] = useState('ALL');
  const [selectedExchange, setSelectedExchange] = useState('ALL');
  const [mcapRange, setMcapRange] = useState('ALL');
  const [sortBy, setSortBy] = useState('marketCap'); // marketCap, volume24h, change24h
  const [sortOrder, setSortOrder] = useState('desc'); // desc, asc

  // Filter logic
  const filteredCoins = useMemo(() => {
    return coinsData
      .filter((c) => {
        // Search
        const q = search.toLowerCase();
        const matchesQuery =
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q) ||
          c.exchanges.some((ex) => ex.toLowerCase().includes(q));

        // Chain
        const matchesChain =
          selectedChain === 'ALL' || c.chain.toLowerCase() === selectedChain.toLowerCase();

        // Exchange
        const matchesExchange =
          selectedExchange === 'ALL' ||
          c.exchanges.some((ex) => ex.toLowerCase().includes(selectedExchange.toLowerCase()));

        // Mcap Range
        let matchesMcap = true;
        const cap = c.marketCap || 0;
        if (mcapRange === '10M-50M') matchesMcap = cap >= 10000000 && cap < 50000000;
        else if (mcapRange === '50M-200M') matchesMcap = cap >= 50000000 && cap < 200000000;
        else if (mcapRange === '200M-1B') matchesMcap = cap >= 200000000 && cap < 1000000000;
        else if (mcapRange === '>1B') matchesMcap = cap >= 1000000000;

        return matchesQuery && matchesChain && matchesExchange && matchesMcap;
      })
      .sort((a, b) => {
        let valA = a[sortBy] || 0;
        let valB = b[sortBy] || 0;
        if (sortOrder === 'asc') return valA - valB;
        return valB - valA;
      });
  }, [search, selectedChain, selectedExchange, mcapRange, sortBy, sortOrder]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Symbol',
      'Name',
      'Blockchain',
      'Market_Cap_USD',
      'Price_USD',
      'Change_24h_Percent',
      'Volume_24h_USD',
      'Is_Tier1_Listed',
      'All_Exchanges',
      'Contract_Address',
    ];

    const rows = filteredCoins.map((c, idx) => [
      idx + 1,
      c.symbol,
      `"${c.name}"`,
      c.chain,
      c.marketCap,
      c.priceUsd,
      c.change24h,
      c.volume24h,
      c.isTier1Listed ? 'YES' : 'NO',
      `"${c.exchanges.join(', ')}"`,
      c.contractAddress,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Coins_10M_MarketCap_Exchanges_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredCoins, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Coins_MarketCap_Over_10M_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Quick stats
  const totalMarketCap = filteredCoins.reduce((sum, c) => sum + (c.marketCap || 0), 0);
  const totalVolume = filteredCoins.reduce((sum, c) => sum + (c.volume24h || 0), 0);
  const tier1Count = filteredCoins.filter((c) => c.isTier1Listed).length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#101f30] to-[#0b1021] border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <span>{lang === 'en' ? 'Market Cap >= $10M & Exchange Listings' : 'Thị Trường Coin Vốn Hóa >= $10M & Các Sàn Niêm Yết'}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                134+ {lang === 'en' ? 'Verified Tokens' : 'Token Đã Xác Minh'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Comprehensive pricing, market cap, volume, and complete exchange listings across CEXs & DEXs.'
                : 'Tra cứu toàn bộ thông tin giá, vốn hóa, khối lượng và đầy đủ sàn giao dịch CEX (Binance, Bybit, OKX...) & DEX (Raydium, Uniswap...).'}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-900/30 flex items-center space-x-1.5"
            title="Download CSV for Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Export CSV / Excel' : 'Xuất CSV / Excel'}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-[#121c3b] hover:bg-[#1a2955] text-slate-300 font-bold rounded-xl text-xs transition-colors border border-[#223363] flex items-center space-x-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Export JSON' : 'Xuất JSON'}</span>
          </button>
        </div>
      </div>

      {/* 4 Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-3.5 shadow-lg">
          <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Qualified Coins (>= $10M)' : 'Số lượng Coin đạt chuẩn (>= $10M)'}</span>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            {filteredCoins.length} Coins
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            {lang === 'en' ? 'Lowest Cap: $10.1M' : 'Vốn hóa thấp nhất: $10.1M'}
          </div>
        </div>

        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-3.5 shadow-lg">
          <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Total Filtered Market Cap' : 'Tổng Vốn Hóa Danh Sách'}</span>
          <div className="text-2xl font-extrabold text-cyan-300 mt-1 font-mono">
            ${(totalMarketCap / 1e9).toFixed(2)}B USD
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {lang === 'en' ? 'Includes global Top 10' : 'Bao gồm cả Top 10 thế giới'}
          </div>
        </div>

        <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-xl p-3.5 shadow-lg">
          <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Total 24h Volume' : 'Tổng Khối Lượng 24h'}</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            ${(totalVolume / 1e6).toFixed(1)}M USD
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {lang === 'en' ? 'High circulating velocity' : 'Thanh khoản luân chuyển cao'}
          </div>
        </div>

        <div className="bg-[#0b1021]/80 border border-purple-800/40 rounded-xl p-3.5 shadow-lg bg-gradient-to-br from-purple-950/20 to-[#0b1021]">
          <span className="text-[11px] text-purple-300 block">{lang === 'en' ? 'Tier 1 CEX Listed' : 'Niêm Yết Sàn Tier 1 CEX'}</span>
          <div className="text-2xl font-extrabold text-purple-300 mt-1 font-mono">
            {tier1Count} / {filteredCoins.length} ({Math.round((tier1Count / (filteredCoins.length || 1)) * 100)}%)
          </div>
          <div className="text-[10px] text-purple-300/80 mt-0.5">
            Binance, Bybit, OKX, Coinbase
          </div>
        </div>
      </div>

      {/* Thanh Bộ Lọc & Tìm Kiếm Chuyên Nghiệp */}
      <div className="bg-[#0b1021]/80 border border-[#1a2347] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-4 relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search by Token, Symbol or Exchange...' : 'Tìm theo Token, Symbol hoặc tên Sàn (vd: Binance, Raydium)...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          {/* Khoảng Vốn Hóa */}
          <div className="md:col-span-3">
            <select
              value={mcapRange}
              onChange={(e) => setMcapRange(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
            >
              <option value="ALL">{lang === 'en' ? 'Market Cap: All (>= $10M)' : 'Vốn hóa: Tất cả (>= $10M)'}</option>
              <option value="10M-50M">$10M - $50M ({lang === 'en' ? 'Micro / High Potential' : 'Micro / Tiềm năng'})</option>
              <option value="50M-200M">$50M - $200M (Mid Cap)</option>
              <option value="200M-1B">$200M - $1B (Large Cap)</option>
              <option value=">1B">&gt; $1B (Mega Meme: DOGE, SHIB, PEPE...)</option>
            </select>
          </div>

          {/* Lọc Sàn Niêm Yết */}
          <div className="md:col-span-3">
            <select
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
            >
              <option value="ALL">{lang === 'en' ? 'Listed Exchanges: All Exchanges' : 'Sàn niêm yết: Tất cả các sàn'}</option>
              <option value="Binance">{lang === 'en' ? 'Listed on Binance' : 'Niêm yết trên Binance'}</option>
              <option value="Bybit">{lang === 'en' ? 'Listed on Bybit' : 'Niêm yết trên Bybit'}</option>
              <option value="OKX">{lang === 'en' ? 'Listed on OKX' : 'Niêm yết trên OKX'}</option>
              <option value="Coinbase">{lang === 'en' ? 'Listed on Coinbase' : 'Niêm yết trên Coinbase'}</option>
              <option value="Raydium">{lang === 'en' ? 'Trading on Raydium (Solana)' : 'Giao dịch trên Raydium (Solana)'}</option>
              <option value="Uniswap v3">{lang === 'en' ? 'Trading on Uniswap v3 (ETH/Base)' : 'Giao dịch trên Uniswap v3 (ETH/Base)'}</option>
              <option value="Aerodrome">{lang === 'en' ? 'Trading on Aerodrome (Base)' : 'Giao dịch trên Aerodrome (Base)'}</option>
              <option value="Gate.io">{lang === 'en' ? 'Listed on Gate.io' : 'Niêm yết trên Gate.io'}</option>
              <option value="MEXC">{lang === 'en' ? 'Listed on MEXC' : 'Niêm yết trên MEXC'}</option>
            </select>
          </div>

          {/* Lọc Blockchain */}
          <div className="md:col-span-2">
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full bg-[#090d1c] border border-[#1b2545] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
            >
              <option value="ALL">{lang === 'en' ? 'Chain: All' : 'Chain: Tất cả'}</option>
              <option value="Solana">Solana</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Base">Base</option>
              <option value="BNB Chain">BNB Chain</option>
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-[#141b36] text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>{t('sortBy')}</span>
            {[
              { id: 'marketCap', label: t('sortMarketCap') },
              { id: 'volume24h', label: t('sortVolume24h') },
              { id: 'change24h', label: t('sortGain24h') },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  if (sortBy === s.id) {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy(s.id);
                    setSortOrder('desc');
                  }
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  sortBy === s.id
                    ? 'bg-purple-950 text-purple-300 font-semibold border border-purple-600/50'
                    : 'hover:text-white'
                }`}
              >
                {s.label} {sortBy === s.id && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            ))}
          </div>

          <div>
            {lang === 'en' ? 'Showing' : 'Hiển thị'} <strong className="text-white">{filteredCoins.length}</strong> {lang === 'en' ? 'results' : 'kết quả'}
          </div>
        </div>
      </div>

      {/* Bảng Danh Sách Toàn Diện Có Sàn Niêm Yết */}
      <div className="bg-[#0b1021]/90 border border-[#192345] rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e142a]/95 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#182142]">
              <tr>
                <th className="py-3 px-3 text-center w-10">#</th>
                <th className="py-3 px-4">{lang === 'en' ? 'TOKEN & SYMBOL' : 'Token & Ký hiệu'}</th>
                <th className="py-3 px-3">BLOCKCHAIN</th>
                <th className="py-3 px-3 font-mono">{t('sortMarketCap')}</th>
                <th className="py-3 px-3 font-mono">{lang === 'en' ? 'PRICE' : 'Giá Hiện Tại'}</th>
                <th className="py-3 px-3 font-mono">{t('sortVolume24h')}</th>
                <th className="py-3 px-3 text-center">{lang === 'en' ? '24H CHANGE' : 'Tăng 24h'}</th>
                <th className="py-3 px-4">{t('colExchanges')}</th>
                <th className="py-3 px-3 text-center">TIER 1 CEX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141b36]">
              {filteredCoins.map((coin, index) => (
                <tr key={coin.id} className="hover:bg-[#121833] transition-colors">
                  {/* Rank */}
                  <td className="py-3 px-3 text-center font-mono text-slate-500 font-bold">
                    {index + 1}
                  </td>

                  {/* Token Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2.5">
                      {coin.image ? (
                        <img
                          src={coin.image}
                          alt={coin.symbol}
                          className="w-7 h-7 rounded-full bg-slate-800 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                          {coin.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-white text-xs tracking-tight flex items-center space-x-1.5">
                          <span>{coin.symbol}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({coin.name})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                          {coin.contractAddress}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Blockchain */}
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-1.5">
                      <ChainIcon chain={coin.chain} className="w-3.5 h-3.5" />
                      <span className="text-slate-300 font-medium">{coin.chain}</span>
                    </div>
                  </td>

                  {/* Market Cap */}
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                    ${coin.marketCap >= 1e9 ? `${(coin.marketCap / 1e9).toFixed(2)}B` : `${(coin.marketCap / 1e6).toFixed(1)}M`}
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 font-mono text-white">
                    ${coin.priceUsd < 0.01 ? coin.priceUsd.toFixed(6) : coin.priceUsd.toFixed(4)}
                  </td>

                  {/* Volume 24h */}
                  <td className="py-3 px-3 font-mono text-slate-300">
                    ${(coin.volume24h / 1e6).toFixed(1)}M
                  </td>

                  {/* Change 24h */}
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    <span className={coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {coin.change24h > 0 ? `+${coin.change24h}%` : `${coin.change24h}%`}
                    </span>
                  </td>

                  {/* Listed Exchanges Badges */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-1 max-w-sm">
                      {coin.exchanges.map((ex, i) => {
                        const isTier1 = ['Binance', 'Bybit', 'OKX', 'Coinbase'].includes(ex);
                        const isDEX = ['Raydium', 'Uniswap v3', 'Aerodrome', 'PancakeSwap'].includes(ex);
                        return (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              isTier1
                                ? 'bg-amber-950/70 text-amber-300 border-amber-600/50 shadow-sm'
                                : isDEX
                                ? 'bg-cyan-950/70 text-cyan-300 border-cyan-600/50'
                                : 'bg-[#151d3b] text-slate-300 border-[#243160]'
                            }`}
                          >
                            {ex}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Tier 1 Badge */}
                  <td className="py-3 px-3 text-center">
                    {coin.isTier1Listed ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>TIER 1</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">DEX Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
