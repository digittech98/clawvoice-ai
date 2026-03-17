import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';
import { useApp } from '../../src/context/AppContext';
import { WalletBalance, Order } from '../../src/constants/types';

export default function WalletScreen() {
  const { balances, orders, cancelOrder } = useApp();
  const [activeTab, setActiveTab] = useState<'assets' | 'orders'>('assets');

  const totalBalance = balances.reduce((sum, b) => sum + b.valueUSD, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => cancelOrder(orderId), style: 'destructive' },
      ]
    );
  };

  const renderBalanceItem = ({ item }: { item: WalletBalance }) => (
    <View style={styles.balanceItem}>
      <View style={styles.balanceLeft}>
        <View style={styles.coinIcon}>
          <Ionicons name="logo-bitcoin" size={20} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.coinSymbol}>{item.coin}</Text>
          <Text style={styles.coinAmount}>{item.amount.toFixed(item.amount < 1 ? 6 : 2)}</Text>
        </View>
      </View>
      <View style={styles.balanceRight}>
        <Text style={styles.coinValue}>${item.valueUSD.toLocaleString()}</Text>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={[
          styles.orderTypeBadge,
          item.type === 'buy' ? styles.buyBadge : styles.sellBadge
        ]}>
          <Text style={styles.orderTypeText}>{item.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.orderCoin}>{item.coin}/USDT</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelOrder(item.id)}
        >
          <Ionicons name="close" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.orderDetails}>
        <View style={styles.orderDetail}>
          <Text style={styles.orderLabel}>Amount</Text>
          <Text style={styles.orderValue}>{item.amount} {item.coin}</Text>
        </View>
        {item.targetPrice && (
          <View style={styles.orderDetail}>
            <Text style={styles.orderLabel}>Target Price</Text>
            <Text style={styles.orderValue}>${item.targetPrice.toLocaleString()}</Text>
          </View>
        )}
        {item.condition && (
          <View style={styles.orderDetail}>
            <Text style={styles.orderLabel}>Condition</Text>
            <Text style={styles.orderValue}>
              {item.condition.replace('_', ' ')}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.orderFooter}>
        <View style={[
          styles.statusBadge,
          item.status === 'pending' && styles.pendingBadge,
          item.status === 'executed' && styles.executedBadge,
          item.status === 'cancelled' && styles.cancelledBadge,
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Wallet</Text>
        </View>

        {/* Total Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Estimated Balance</Text>
          <Text style={styles.totalBalance}>
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add" size={22} color={COLORS.background} />
              <Text style={styles.actionButtonText}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]}>
              <Ionicons name="arrow-up" size={22} color={COLORS.primary} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextOutline]}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]}>
              <Ionicons name="swap-horizontal" size={22} color={COLORS.primary} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextOutline]}>Transfer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'assets' && styles.tabActive]}
            onPress={() => setActiveTab('assets')}
          >
            <Text style={[styles.tabText, activeTab === 'assets' && styles.tabTextActive]}>
              Assets
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
              Orders ({pendingOrders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'assets' ? (
          <FlatList
            data={balances}
            renderItem={renderBalanceItem}
            keyExtractor={(item) => item.coin}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>No orders yet</Text>
                <Text style={styles.emptySubtext}>Your open orders will appear here</Text>
              </View>
            }
          />
        )}

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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  balanceCard: {
    margin: 16,
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  totalBalance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  actionButtons: {
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
    borderRadius: 10,
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.background,
  },
  actionButtonTextOutline: {
    color: COLORS.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  coinAmount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  balanceRight: {
    alignItems: 'flex-end',
  },
  coinValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
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
  cancelledBadge: {
    backgroundColor: 'rgba(246, 70, 93, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
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
  bottomPadding: {
    height: 120,
  },
});
