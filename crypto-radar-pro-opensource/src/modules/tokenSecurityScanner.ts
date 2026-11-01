import { BlockchainType, RiskAssessmentStatus, TokenMetrics } from '../types';
import { globalCache } from './cacheManager';

export async function fetchLiveTokenSecurity(
  chain: BlockchainType,
  contractAddress: string
): Promise<TokenMetrics['securityCheck']> {
  const cacheKey = `sec_${chain}_${contractAddress.toLowerCase()}`;
  const cached = globalCache.get<TokenMetrics['securityCheck']>(cacheKey);
  if (cached.data && !cached.isStale) {
    return cached.data;
  }

  try {
    let url = '';
    if (chain === 'Solana') {
      url = `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${contractAddress}`;
    } else {
      let chainId = '1';
      if (chain === 'BNB Chain') chainId = '56';
      else if (chain === 'Base') chainId = '8453';
      else if (chain === 'Arbitrum') chainId = '42161';
      url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${contractAddress.toLowerCase()}`;
    }

    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const json = await res.json();
    const result = json.result || {};
    const data = result[contractAddress.toLowerCase()] || result[contractAddress] || {};

    // Parse security signals
    const isHoneypot: RiskAssessmentStatus =
      data.is_honeypot === '1' || data.cannot_sell_all === '1'
        ? 'RISK_DETECTED'
        : data.is_honeypot === '0'
        ? 'NO_RISK_DETECTED'
        : 'UNABLE_TO_VERIFY';

    const mintable: RiskAssessmentStatus =
      data.is_mintable === '1' || data.mintable?.status === '1'
        ? 'RISK_DETECTED'
        : data.is_mintable === '0' || data.mintable?.status === '0'
        ? 'NO_RISK_DETECTED'
        : 'INSUFFICIENT_DATA';

    const freezeable: RiskAssessmentStatus =
      data.transfer_pausable === '1' || data.is_blacklisted === '1' || data.freezable?.status === '1'
        ? 'RISK_DETECTED'
        : 'NO_RISK_DETECTED';

    const buyTax = parseFloat(data.buy_tax || '0') * 100;
    const sellTax = parseFloat(data.sell_tax || '0') * 100;

    // Calculate top holders percentage
    let topHoldersConcentration = 25;
    if (Array.isArray(data.holders)) {
      const top10 = data.holders.slice(0, 10);
      const sum = top10.reduce((acc: number, h: any) => acc + (parseFloat(h.percent || '0') * 100), 0);
      if (sum > 0) topHoldersConcentration = Math.round(sum);
    }

    const securityCheck: TokenMetrics['securityCheck'] = {
      isHoneypot,
      mintable,
      freezeable,
      topHoldersConcentration,
      buyTax: isNaN(buyTax) ? 0 : Math.round(buyTax),
      sellTax: isNaN(sellTax) ? 0 : Math.round(sellTax),
      liquidityBurnedOrLocked: data.lp_holders && data.lp_holders.length > 0,
      contractStatus: isHoneypot === 'RISK_DETECTED' ? 'RISK_DETECTED' : 'NO_RISK_DETECTED',
      summary: `GoPlus xác minh: Thuế mua ${Math.round(buyTax)}%, thuế bán ${Math.round(sellTax)}%, Top 10 ví nắm ${topHoldersConcentration}%.`,
    };

    // Cache security result for 6 hours (21600000 ms)
    globalCache.set(cacheKey, securityCheck, 21600000, 'GoPlus Security API');
    return securityCheck;
  } catch (err: any) {
    console.warn(`GoPlus fetch failed for ${contractAddress}:`, err.message);
    // Return fallback safe estimate with clear status UNABLE_TO_VERIFY
    return {
      isHoneypot: 'UNABLE_TO_VERIFY',
      mintable: 'INSUFFICIENT_DATA',
      freezeable: 'NO_RISK_DETECTED',
      topHoldersConcentration: 30,
      buyTax: 0,
      sellTax: 0,
      liquidityBurnedOrLocked: true,
      contractStatus: 'UNABLE_TO_VERIFY',
      summary: 'Chưa thể kết nối GoPlus API. Dữ liệu đang được xác minh thêm.',
    };
  }
}
