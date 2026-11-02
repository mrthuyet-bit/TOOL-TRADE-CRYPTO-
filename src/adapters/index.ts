import { BlockchainType } from '../types';

export interface BlockchainAdapter {
  chain: BlockchainType;
  chainId: string | number;
  explorerUrl: string;
  defaultRpcUrl: string;
  formatAddress(address: string): string;
  getExplorerAddressUrl(address: string): string;
  getExplorerTxUrl(txHash: string): string;
  validateAddress(address: string): boolean;
}

export class SolanaAdapter implements BlockchainAdapter {
  chain: BlockchainType = 'Solana';
  chainId = 'solana';
  explorerUrl = 'https://solscan.io';
  defaultRpcUrl = 'https://api.mainnet-beta.solana.com';

  formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  getExplorerAddressUrl(address: string): string {
    return `${this.explorerUrl}/account/${address}`;
  }

  getExplorerTxUrl(txHash: string): string {
    return `${this.explorerUrl}/tx/${txHash}`;
  }

  validateAddress(address: string): boolean {
    // Base58 check 32-44 chars
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
}

export class EvmAdapter implements BlockchainAdapter {
  chain: BlockchainType;
  chainId: number;
  explorerUrl: string;
  defaultRpcUrl: string;

  constructor(chain: BlockchainType, chainId: number, explorerUrl: string, defaultRpcUrl: string) {
    this.chain = chain;
    this.chainId = chainId;
    this.explorerUrl = explorerUrl;
    this.defaultRpcUrl = defaultRpcUrl;
  }

  formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  getExplorerAddressUrl(address: string): string {
    return `${this.explorerUrl}/address/${address}`;
  }

  getExplorerTxUrl(txHash: string): string {
    return `${this.explorerUrl}/tx/${txHash}`;
  }

  validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

export const chainAdapters: Record<BlockchainType, BlockchainAdapter> = {
  'Solana': new SolanaAdapter(),
  'Ethereum': new EvmAdapter('Ethereum', 1, 'https://etherscan.io', 'https://eth.llamarpc.com'),
  'BNB Chain': new EvmAdapter('BNB Chain', 56, 'https://bscscan.com', 'https://binance.llamarpc.com'),
  'Base': new EvmAdapter('Base', 8453, 'https://basescan.org', 'https://mainnet.base.org'),
  'Arbitrum': new EvmAdapter('Arbitrum', 42161, 'https://arbiscan.io', 'https://arb1.arbitrum.io/rpc'),
};

export function getAdapter(chain: BlockchainType): BlockchainAdapter {
  return chainAdapters[chain] || chainAdapters['Solana'];
}
