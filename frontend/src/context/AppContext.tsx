// AppContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, WalletBalance, UserSettings, VoiceState, Coin } from '../constants/types';
import { translations, Language, TranslationKey } from '../constants/translations';

interface AppContextType {
  // Wallet
  balances: WalletBalance[];
  setBalances: (balances: WalletBalance[]) => void;
  
  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  cancelOrder: (id: string) => void;
  
  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Market data
  prices: Coin[];
  setPrices: (prices: Coin[]) => void;
  
  // Voice
  voiceState: VoiceState;
  setVoiceState: (state: Partial<VoiceState>) => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  
  // Currency
  currency: 'USD' | 'EUR';
  setCurrency: (currency: 'USD' | 'EUR') => void;
  
  // Modals
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  modalData: any;
  setModalData: (data: any) => void;
}

const defaultSettings: UserSettings = {
  twoFactorEnabled: false,
  kycVerified: false,
  antiPhishingCode: '',
  notificationsEnabled: true,
};

const defaultBalances: WalletBalance[] = [
  { coin: 'BTC', amount: 0.5, valueUSD: 43750 },
  { coin: 'ETH', amount: 5.2, valueUSD: 16640 },
  { coin: 'SOL', amount: 120, valueUSD: 17400 },
  { coin: 'USDT', amount: 10000, valueUSD: 10000 },
  { coin: 'BNB', amount: 25, valueUSD: 14500 },
];

const defaultVoiceState: VoiceState = {
  isListening: false,
  transcript: '',
  status: 'idle',
  lastResponse: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balances, setBalancesState] = useState<WalletBalance[]>(defaultBalances);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [prices, setPrices] = useState<Coin[]>([]);
  const [voiceState, setVoiceStateInternal] = useState<VoiceState>(defaultVoiceState);
  const [language, setLanguageState] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<'USD' | 'EUR'>('USD');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedBalances, savedOrders, savedSettings, savedLanguage, savedCurrency] = await Promise.all([
        AsyncStorage.getItem('balances'),
        AsyncStorage.getItem('orders'),
        AsyncStorage.getItem('settings'),
        AsyncStorage.getItem('language'),
        AsyncStorage.getItem('currency'),
      ]);
      
      if (savedBalances) setBalancesState(JSON.parse(savedBalances));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedLanguage) setLanguageState(savedLanguage as Language);
      if (savedCurrency) setCurrencyState(savedCurrency as 'USD' | 'EUR');
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const setBalances = async (newBalances: WalletBalance[]) => {
    setBalancesState(newBalances);
    await AsyncStorage.setItem('balances', JSON.stringify(newBalances));
  };

  const addOrder = async (order: Order) => {
    const newOrders = [...orders, order];
    setOrders(newOrders);
    await AsyncStorage.setItem('orders', JSON.stringify(newOrders));
  };

  const cancelOrder = async (id: string) => {
    const newOrders = orders.map(o => 
      o.id === id ? { ...o, status: 'cancelled' as const } : o
    );
    setOrders(newOrders);
    await AsyncStorage.setItem('orders', JSON.stringify(newOrders));
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem('settings', JSON.stringify(updated));
  };

  const setVoiceState = (state: Partial<VoiceState>) => {
    setVoiceStateInternal(prev => ({ ...prev, ...state }));
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const setCurrency = async (curr: 'USD' | 'EUR') => {
    setCurrencyState(curr);
    await AsyncStorage.setItem('currency', curr);
  };

  const t = (key: TranslationKey): string => {
    return translations?.[language]?.[key] ?? translations?.en?.[key] ?? key;
  };

  return (
    <AppContext.Provider
      value={{
        balances,
        setBalances,
        orders,
        addOrder,
        cancelOrder,
        settings,
        updateSettings,
        prices,
        setPrices,
        voiceState,
        setVoiceState,
        language,
        setLanguage,
        t,
        currency,
        setCurrency,
        activeModal,
        setActiveModal,
        modalData,
        setModalData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
