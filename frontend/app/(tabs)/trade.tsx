import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';
import { useApp } from '../../src/context/AppContext';
import { Coin, Order } from '../../src/constants/types';
import { PriceChart } from '../../src/components/PriceChart';

export default function TradeScreen() {
  const { prices, setPrices, addOrder, balances, orders, cancelOrder, t, language } = useApp();
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'trade' | 'orders'>('trade');

  const BACKEND_URL = '';

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/market/prices`);
      if (response.ok) {
        const data = await response.json();
        setPrices(data.prices);
        if (!selectedCoin && data.prices.length > 0) {
          setSelectedCoin(data.prices[0]);
        } else if (selectedCoin) {
          const updated = data.prices.find((c: Coin) => c.symbol === selectedCoin.symbol);
          if (updated) setSelectedCoin(updated);
        }
      }
    } catch (error) {
      console.log('Error fetching prices:', error);
    }
  }, [BACKEND_URL, setPrices, selectedCoin]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const handleTrade = () => {
    if (!selectedCoin || !amount) {
      Alert.alert(t('error'), t('pleaseEnterAmount'));
      return;
    }

    const order = {
      id: Date.now().toString(),
      type: tradeType,
      coin: selectedCoin.symbol,
      amount: parseFloat(amount),
      condition: orderType === 'limit' ? (tradeType === 'buy' ? 'price_below' : 'price_above') as const : undefined,
      targetPrice: orderType === 'limit' ? parseFloat(limitPrice) : selectedCoin.price,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    addOrder(order);
    
    Alert.alert(
      t('orderPlaced'),
      `${tradeType.toUpperCase()} ${language === 'fr' ? 'ordre pour' : 'order for'} ${amount} ${selectedCoin.symbol} ${orderType === 'limit' ? `${language === 'fr' ? 'à' : 'at'} $${limitPrice}` : (language === 'fr' ? 'au prix du marché' : 'at market price')}`
    );
    
    setAmount('');
    setLimitPrice('');
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      t('cancelOrder'),
      t('cancelOrderConfirm'),
      [
        { text: t('no'), style: 'cancel' },
        { text: t('yes'), onPress: () => cancelOrder(orderId), style: 'destructive' },
      ]
    );
  };

  const total = selectedCoin && amount 
    ? (parseFloat(amount) * (orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : selectedCoin.price)).toFixed(2)
    : '0.00';

  const usdtBalance = balances.find(b => b.coin === 'USDT')?.amount || 0;
  
  // Filter orders for current coin or all orders
  const relevantOrders = orders.filter(o => o.status !== 'cancelled').slice().reverse();

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={[
          styles.orderTypeBadge,
          item.type === 'buy' ? styles.buyBadge : styles.sellBadge
        ]}>
          <Text style={[styles.orderTypeText, { color: item.type === 'buy' ? COLORS.success : COLORS.error }]}>
            {item.type === 'buy' ? (language === 'fr' ? 'ACHAT' : 'BUY') : (language === 'fr' ? 'VENTE' : 'SELL')}
          </Text>
        </View>
        <Text style={styles.orderCoin}>{item.coin}/USDT</Text>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(item.id)}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.orderDetails}>
        <View style={styles.orderDetail}>
          <Text style={styles.orderLabel}>{t('amount')}</Text>
          <Text style={styles.orderValue}>{item.amount} {item.coin}</Text>
        </View>
        <View style={styles.orderDetail}>
          <Text style={styles.orderLabel}>{t('price')}</Text>
          <Text style={styles.orderValue}>
            ${item.targetPrice?.toLocaleString() || 'Market'}
          </Text>
        </View>
        <View style={styles.orderDetail}>
          <Text style={styles.orderLabel}>{t('total')}</Text>
          <Text style={styles.orderValue}>
            ${((item.amount || 0) * (item.targetPrice || 0)).toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={styles.orderFooter}>
        <View style={[
          styles.statusBadge,
          item.status === 'pending' && styles.pendingBadge,
          item.status === 'executed' && styles.executedBadge,
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'pending' ? (language === 'fr' ? 'En attente' : 'Pending') : 
             item.status === 'executed' ? (language === 'fr' ? 'Exécuté' : 'Executed') : item.status}
          </Text>
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('trade')}</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trade' && styles.tabActive]}
          onPress={() => setActiveTab('trade')}
        >
          <Text style={[styles.tabText, activeTab === 'trade' && styles.tabTextActive]}>
            {t('trade')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            {t('orders')} ({relevantOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'trade' ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Pair Selector */}
          <TouchableOpacity 
            style={styles.pairSelector}
            onPress={() => setShowPairSelector(!showPairSelector)}
          >
            <View style={styles.pairInfo}>
              <View style={styles.coinIcon}>
                <Ionicons name="logo-bitcoin" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.pairText}>
                {selectedCoin?.symbol || 'BTC'}/USDT
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Pair Dropdown */}
          {showPairSelector && (
            <View style={styles.pairDropdown}>
              {prices.slice(0, 8).map((coin) => (
                <TouchableOpacity
                  key={coin.symbol}
                  style={styles.pairOption}
                  onPress={() => {
                    setSelectedCoin(coin);
                    setShowPairSelector(false);
                  }}
                >
                  <Text style={styles.pairOptionText}>{coin.symbol}/USDT</Text>
                  <Text style={styles.pairOptionPrice}>${coin.price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Price Chart */}
          {selectedCoin && (
            <View style={styles.chartWrapper}>
              <PriceChart 
                symbol={selectedCoin.symbol}
                currentPrice={selectedCoin.price}
                change24h={selectedCoin.change24h}
              />
            </View>
          )}

          {/* Buy/Sell Toggle */}
          <View style={styles.tradeToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, tradeType === 'buy' && styles.toggleButtonBuy]}
              onPress={() => setTradeType('buy')}
            >
              <Text style={[styles.toggleText, tradeType === 'buy' && styles.toggleTextActive]}>
                {t('buy')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, tradeType === 'sell' && styles.toggleButtonSell]}
              onPress={() => setTradeType('sell')}
            >
              <Text style={[styles.toggleText, tradeType === 'sell' && styles.toggleTextActive]}>
                {t('sell')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Order Type */}
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity
              style={[styles.orderTypeButton, orderType === 'market' && styles.orderTypeActive]}
              onPress={() => setOrderType('market')}
            >
              <Text style={[styles.orderTypeText2, orderType === 'market' && styles.orderTypeTextActive]}>
                {t('market')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.orderTypeButton, orderType === 'limit' && styles.orderTypeActive]}
              onPress={() => setOrderType('limit')}
            >
              <Text style={[styles.orderTypeText2, orderType === 'limit' && styles.orderTypeTextActive]}>
                {t('limit')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Limit Price Input */}
          {orderType === 'limit' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('price')} (USDT)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={limitPrice}
                  onChangeText={setLimitPrice}
                  placeholder={t('enterPrice')}
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('amount')} ({selectedCoin?.symbol || 'BTC'})</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder={t('enterAmount')}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.percentButtons}>
              {['25%', '50%', '75%', '100%'].map((pct) => (
                <TouchableOpacity
                  key={pct}
                  style={styles.percentButton}
                  onPress={() => {
                    const percent = parseInt(pct) / 100;
                    if (selectedCoin) {
                      const maxAmount = usdtBalance / selectedCoin.price * percent;
                      setAmount(maxAmount.toFixed(6));
                    }
                  }}
                >
                  <Text style={styles.percentText}>{pct}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t('total')} (USDT)</Text>
            <Text style={styles.totalValue}>${total}</Text>
          </View>

          {/* Available Balance */}
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>{t('available')}:</Text>
            <Text style={styles.balanceValue}>
              {usdtBalance.toLocaleString()} USDT
            </Text>
          </View>

          {/* Trade Button */}
          <TouchableOpacity
            style={[
              styles.tradeButton,
              tradeType === 'buy' ? styles.buyButton : styles.sellButton
            ]}
            onPress={handleTrade}
          >
            <Text style={styles.tradeButtonText}>
              {tradeType === 'buy' ? t('buy') : t('sell')} {selectedCoin?.symbol || 'BTC'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      ) : (
        <View style={styles.ordersContainer}>
          {relevantOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>{t('noOrders')}</Text>
              <Text style={styles.emptySubtext}>{t('ordersAppearHere')}</Text>
            </View>
          ) : (
            <FlatList
              data={relevantOrders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.ordersList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.background,
  },
  pairSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pairInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pairDropdown: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pairOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pairOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  pairOptionPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  chartWrapper: {
    paddingHorizontal: 16,
  },
  tradeToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleButtonBuy: {
    backgroundColor: COLORS.success,
  },
  toggleButtonSell: {
    backgroundColor: COLORS.error,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.textPrimary,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  orderTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
  },
  orderTypeActive: {
    backgroundColor: COLORS.primary,
  },
  orderTypeText2: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderTypeTextActive: {
    color: COLORS.background,
  },
  inputContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  percentButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  percentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  balanceValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  tradeButton: {
    marginHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: COLORS.success,
  },
  sellButton: {
    backgroundColor: COLORS.error,
  },
  tradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  bottomPadding: {
    height: 120,
  },
  // Orders styles
  ordersContainer: {
    flex: 1,
  },
  ordersList: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  orderItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  orderTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buyBadge: {
    backgroundColor: 'rgba(14, 203, 129, 0.2)',
  },
  sellBadge: {
    backgroundColor: 'rgba(246, 70, 93, 0.2)',
  },
  orderTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderCoin: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cancelButton: {
    padding: 4,
  },
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  orderValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingBadge: {
    backgroundColor: 'rgba(240, 185, 11, 0.2)',
  },
  executedBadge: {
    backgroundColor: 'rgba(14, 203, 129, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
