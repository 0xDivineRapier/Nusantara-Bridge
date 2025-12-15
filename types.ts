
export enum BridgeStatus {
  PENDING_DEPOSIT = 'PENDING_DEPOSIT',
  DEPOSIT_CONFIRMED = 'DEPOSIT_CONFIRMED',
  EXCHANGED = 'EXCHANGED',
  PAYOUT_INITIATED = 'PAYOUT_INITIATED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum KYCStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum Currency {
  ETH = 'ETH',
  USDT = 'USDT',
  IDR = 'IDR'
}

export interface Network {
  id: string;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  chainId: number;
  color: string;
}

export interface Asset {
  symbol: string;
  name: string;
  balance: string; // Serialized BigInt or float string
  priceUsd: number;
  valueUsd: number;
  networkId: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  depositTxHash: string;
  clientWalletAddress: string;
  usdcAmount: string; // Serialized BigInt
  exchangeRate: string; // Serialized Decimal
  idrAmount: string; // Serialized BigInt
  exchangeId?: string; // Optional exchange identifier
  indodaxOrderId?: string | null;
  xenditPayoutId?: string | null;
  status: BridgeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketRate {
  pair: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export interface BankChannel {
  code: string;
  name: string;
  available: boolean;
}

export interface ExchangeId {
  id: string;
  name: string;
  region: string;
  logo?: string;
}

export interface Exchange {
  id: string;
  name: string;
  region: 'ID' | 'GLOBAL';
  trustScore: number; // 1-10
  logoUrl?: string;
}
