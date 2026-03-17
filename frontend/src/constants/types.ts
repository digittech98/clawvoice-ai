export interface Coin {
  symbol: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
}

export interface Order {
  id: string;
  type: 'buy' | 'sell';
  coin: string;
  amount: number;
  condition?: 'price_below' | 'price_above' | 'stop_loss' | 'take_profit';
  targetPrice?: number;
  status: 'pending' | 'executed' | 'cancelled';
  createdAt: Date;
}

export interface WalletBalance {
  coin: string;
  amount: number;
  valueUSD: number;
}

export interface UserSettings {
  twoFactorEnabled: boolean;
  kycVerified: boolean;
  antiPhishingCode: string;
  notificationsEnabled: boolean;
}

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  status: 'idle' | 'listening' | 'parsing' | 'executing' | 'responding';
  lastResponse: string;
}
