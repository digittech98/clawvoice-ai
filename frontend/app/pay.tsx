import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/colors';

const recentTransactions = [
  { type: 'send', user: 'John D.', amount: '$50.00', coin: 'USDT', time: '2 hours ago' },
  { type: 'receive', user: 'Alice M.', amount: '$125.00', coin: 'BTC', time: '1 day ago' },
  { type: 'send', user: 'Bob S.', amount: '$30.00', coin: 'ETH', time: '3 days ago' },
];

export default function PayScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Binance Pay</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Pay Balance</Text>
          <Text style={styles.balanceAmount}>$10,000.00</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="arrow-up" size={24} color={COLORS.background} />
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="arrow-down" size={24} color={COLORS.background} />
              <Text style={styles.actionText}>Receive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="qr-code" size={24} color={COLORS.background} />
              <Text style={styles.actionText}>Scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresGrid}>
          {[
            { icon: 'people', label: 'Split Bill' },
            { icon: 'gift', label: 'Red Packet' },
            { icon: 'card', label: 'Pay Merchant' },
            { icon: 'globe', label: 'Send Globally' },
          ].map((feature, index) => (
            <TouchableOpacity key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.map((tx, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={[
              styles.txIcon,
              tx.type === 'send' ? styles.sendIcon : styles.receiveIcon
            ]}>
              <Ionicons 
                name={tx.type === 'send' ? 'arrow-up' : 'arrow-down'} 
                size={20} 
                color={tx.type === 'send' ? COLORS.error : COLORS.success} 
              />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txUser}>{tx.user}</Text>
              <Text style={styles.txTime}>{tx.time}</Text>
            </View>
            <View style={styles.txAmount}>
              <Text style={[
                styles.txValue,
                { color: tx.type === 'send' ? COLORS.error : COLORS.success }
              ]}>
                {tx.type === 'send' ? '-' : '+'}{tx.amount}
              </Text>
              <Text style={styles.txCoin}>{tx.coin}</Text>
            </View>
          </View>
        ))}

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Zero Fees</Text>
            <Text style={styles.infoText}>
              Send crypto to any Binance user instantly with zero transaction fees.
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.background,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  featureItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sendIcon: {
    backgroundColor: 'rgba(246, 70, 93, 0.15)',
  },
  receiveIcon: {
    backgroundColor: 'rgba(14, 203, 129, 0.15)',
  },
  txInfo: {
    flex: 1,
  },
  txUser: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  txTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  txAmount: {
    alignItems: 'flex-end',
  },
  txValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  txCoin: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
