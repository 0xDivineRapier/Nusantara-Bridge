
import { BankChannel, MarketRate, Exchange, Network, Asset } from './types';

// Supported Blockchain Networks
export const SUPPORTED_NETWORKS: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    chainId: 1,
    color: 'bg-purple-600'
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    chainId: 56,
    color: 'bg-yellow-500'
  },
  {
    id: 'polygon',
    name: 'Polygon PoS',
    shortName: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    chainId: 137,
    color: 'bg-indigo-600'
  }
];

// Mock Assets in User Wallet
export const MOCK_WALLET_ASSETS: Asset[] = [
  { symbol: 'ETH', name: 'Ethereum', balance: '4.2045', priceUsd: 2650, valueUsd: 11141.92, networkId: 'ethereum' },
  { symbol: 'USDC', name: 'USD Coin', balance: '1540.00', priceUsd: 1.00, valueUsd: 1540.00, networkId: 'ethereum' },
  { symbol: 'BNB', name: 'Binance Coin', balance: '12.50', priceUsd: 320, valueUsd: 4000.00, networkId: 'bsc' },
  { symbol: 'MATIC', name: 'Polygon', balance: '5400.00', priceUsd: 0.85, valueUsd: 4590.00, networkId: 'polygon' },
];

// Supported Exchanges
export const SUPPORTED_EXCHANGES: Exchange[] = [
  { id: 'indodax', name: 'Indodax', region: 'ID', trustScore: 9, logoUrl: 'https://via.placeholder.com/20?text=I' },
  { id: 'tokocrypto', name: 'Tokocrypto', region: 'ID', trustScore: 9 },
  { id: 'binance', name: 'Binance', region: 'GLOBAL', trustScore: 10 },
  { id: 'coinbase', name: 'Coinbase', region: 'GLOBAL', trustScore: 10 },
];

// Simulated Rates
export const INITIAL_RATES: MarketRate[] = [
  { pair: 'ETH/IDR', price: 42500000, change24h: 2.5, lastUpdated: new Date() },
  { pair: 'USDT/IDR', price: 15850, change24h: -0.1, lastUpdated: new Date() },
  { pair: 'BNB/IDR', price: 5120000, change24h: 1.2, lastUpdated: new Date() },
  { pair: 'MATIC/IDR', price: 13500, change24h: -0.5, lastUpdated: new Date() },
];

// Simulated Xendit Channels (Expanded)
export const SUPPORTED_BANKS: BankChannel[] = [
  // Top Tier
  { code: 'BCA', name: 'Bank Central Asia', available: true },
  { code: 'MANDIRI', name: 'Bank Mandiri', available: true },
  { code: 'BRI', name: 'Bank Rakyat Indonesia', available: true },
  { code: 'BNI', name: 'Bank Negara Indonesia', available: true },
  // Digital
  { code: 'JAGO', name: 'Bank Jago', available: true },
  { code: 'SEABANK', name: 'SeaBank', available: true },
  { code: 'BTPN', name: 'Jenius / BTPN', available: true },
  { code: 'NEO', name: 'Bank Neo Commerce', available: true },
  // Commercial
  { code: 'CIMB', name: 'CIMB Niaga', available: true },
  { code: 'PERMATA', name: 'Bank Permata', available: true },
  { code: 'DANAMON', name: 'Bank Danamon', available: true },
  { code: 'BSI', name: 'Bank Syariah Indonesia', available: true },
  // E-Wallets
  { code: 'GOPAY', name: 'GoPay', available: true },
  { code: 'OVO', name: 'OVO', available: true },
  { code: 'DANA', name: 'DANA', available: true },
  { code: 'SHOPEEPAY', name: 'ShopeePay', available: true },
];

export const FEE_PERCENTAGE = 0.005; // 0.5% bridge fee
export const GAS_ESTIMATE_ETH = 0.002; // Mock gas cost
