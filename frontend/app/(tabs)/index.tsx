// HomeScreen 
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { useApp } from '../../src/context/AppContext';
import { CoinCard } from '../../src/components/CoinCard';

export default function HomeScreen() {
  const router = useRouter();
  const { balances, prices, setPrices, t, language, currency } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const BACKEND_URL = '';

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/market/prices`);
      if (response.ok) {
        const data = await response.json();
        setPrices(data.prices);
      }
    } catch (error) {
      console.log('Error fetching prices:', error);
    }
  }, [BACKEND_URL, setPrices]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrices();
    setRefreshing(false);
  };

  const totalBalance = balances.reduce((sum, b) => sum + b.valueUSD, 0);
  const displayBalance = currency === 'EUR' ? totalBalance * 0.92 : totalBalance;
  const currencySymbol = currency === 'EUR' ? '€' : '$';
  
  const topCoins = prices.slice(0, 5);
  const trendingCoins = prices.filter(c => c.change24h > 0).slice(0, 3);

  const handleDeposit = () => {
    Alert.alert(
      t('deposit'),
      language === 'fr' ? 'Sélectionnez une crypto à déposer' : 'Select a crypto to deposit',
      [
        { text: 'BTC', onPress: () => router.push('/wallet') },
        { text: 'ETH', onPress: () => router.push('/wallet') },
        { text: 'USDT', onPress: () => router.push('/wallet') },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const handleWithdraw = () => {
    Alert.alert(
      t('withdraw'),
      language === 'fr' ? 'Sélectionnez une crypto à retirer' : 'Select a crypto to withdraw',
      [
        { text: 'BTC', onPress: () => router.push('/wallet') },
        { text: 'ETH', onPress: () => router.push('/wallet') },
        { text: 'USDT', onPress: () => router.push('/wallet') },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const quickActions = [
    { icon: 'card', label: t('buyCrypto'), onPress: () => router.push('/(tabs)/trade') },
    { icon: 'gift', label: t('rewards'), onPress: () => router.push('/earn') },
    { icon: 'trending-up', label: 'Earn', onPress: () => router.push('/earn') },
    { icon: 'grid', label: t('more'), onPress: () => Alert.alert(t('more'), language === 'fr' ? 'Plus d\'options' : 'More options') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="logo-bitcoin" size={28} color={COLORS.primary} />
            <Text style={styles.logoText}>Binance</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Scan', 'QR Scanner')}>
              <Ionicons name="scan" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="person-circle" size={26} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Card */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>{t('totalBalance')}</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {currencySymbol}{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <TouchableOpacity style={styles.eyeButton}>
              <Ionicons name="eye" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.portfolioActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleDeposit}>
              <Ionicons name="add" size={20} color={COLORS.background} />
              <Text style={styles.actionButtonText}>{t('deposit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]} onPress={handleWithdraw}>
              <Ionicons name="arrow-up" size={20} color={COLORS.primary} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextOutline]}>{t('withdraw')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]} onPress={() => router.push('/(tabs)/trade')}>
              <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextOutline]}>{t('trade')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.quickAction} onPress={action.onPress}>
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon as any} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('trending')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/markets')}>
              <Text style={styles.seeAll}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
            {trendingCoins.map((coin, index) => (
              <TouchableOpacity key={index} style={styles.trendingCard} onPress={() => router.push('/(tabs)/trade')}>
                <View style={styles.trendingHeader}>
                  <View style={styles.trendingIcon}>
                    <Ionicons name="logo-bitcoin" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.trendingSymbol}>{coin.symbol}</Text>
                </View>
                <Text style={styles.trendingPrice}>
                  {currencySymbol}{(currency === 'EUR' ? coin.price * 0.92 : coin.price).toLocaleString()}
                </Text>
                <Text style={[styles.trendingChange, { color: COLORS.success }]}>
                  +{coin.change24h.toFixed(2)}%
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Coins */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('topCoins')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/markets')}>
              <Text style={styles.seeAll}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          {topCoins.map((coin, index) => (
            <CoinCard key={index} coin={coin} onPress={() => router.push('/(tabs)/trade')} />
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  portfolioCard: {
    margin: 16,
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
  },
  portfolioLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  eyeButton: {
    padding: 4,
  },
  portfolioActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.background,
  },
  actionButtonTextOutline: {
    color: COLORS.textPrimary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
  },
  trendingScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  trendingCard: {
    width: 140,
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginRight: 12,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trendingIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  trendingChange: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
});
