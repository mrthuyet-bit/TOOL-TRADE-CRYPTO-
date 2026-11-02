import React from 'react';

export default function ChainIcon({ chain, className = "w-4 h-4" }) {
  switch (chain?.toLowerCase()) {
    case 'solana':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] p-0.5 text-white ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-0.5">
            <path d="M4 18h13l3-3H7L4 18zm0-6.5h13l3-3H7l-3 3zm3-6.5l-3 3h13l3-3H7z" />
          </svg>
        </span>
      );
    case 'bnb chain':
    case 'bnb':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-[#F3BA2F] text-black ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-0.5">
            <path d="M12 2l3.2 3.2-3.2 3.2-3.2-3.2L12 2zm-5.6 5.6l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm11.2 0l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm-5.6 5.6l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm-5.6 5.6l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm11.2 0l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2z" />
          </svg>
        </span>
      );
    case 'ethereum':
    case 'eth':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-[#627EEA] text-white ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-0.5">
            <path d="M12 1.5l-7 11.5 7 4.2 7-4.2-7-11.5zm0 17.5l-7-4 7 8 7-8-7 4z" />
          </svg>
        </span>
      );
    case 'base':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-[#0052FF] text-white ${className}`}>
          <div className="w-2 h-2 rounded-full bg-white" />
        </span>
      );
    case 'arbitrum':
    case 'arb':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-[#28A0F0] text-white ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-0.5">
            <path d="M12 2L2 19.5h4.2L12 9.7l5.8 9.8H22L12 2z" />
          </svg>
        </span>
      );
    case 'polygon':
    case 'matic':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-[#8247E5] text-white ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-0.5">
            <path d="M16.5 7.5L12 4.9 7.5 7.5v5.2L12 15.3l4.5-2.6V7.5zM12 7.2l2.3 1.3v2.7L12 12.6l-2.3-1.4V8.5L12 7.2z" />
          </svg>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-purple-600 text-white text-[10px] ${className}`}>
          ⬡
        </span>
      );
  }
}
