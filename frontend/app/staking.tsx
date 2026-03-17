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

const stakingOptions = [
  { coin: 'ETH', apy: '4.5%', minAmount: '0.01 ETH', locked: '30 days' },
  { coin: 'BNB', apy: '6.2%', minAmount: '0.1 BNB', locked: '60 days' },
  { coin: 'SOL', apy: '7.8%', minAmount: '1 SOL', locked: '90 days' },
  { coin: 'ADA', apy: '5.1%', minAmount: '100 ADA', locked: 'Flexible' },
  { coin: 'DOT', apy: '12.5%', minAmount: '10 DOT', locked: '28 days' },
];

export default function StakingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Staking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Earn Passive Income</Text>
            <Text style={styles.infoText}>
              Stake your crypto to earn rewards. Lock your assets for a period to receive higher APY.
            </Text>
          </View>
        </View>

        {/* Staking Options */}
        <Text style={styles.sectionTitle}>Available Staking</Text>
        {stakingOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.stakingCard}>
            <View style={styles.stakingHeader}>
              <View style={styles.coinInfo}>
                <View style={styles.coinIcon}>
                  <Ionicons name="logo-bitcoin" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.coinName}>{option.coin}</Text>
              </View>
              <View style={styles.apyBadge}>
                <Text style={styles.apyText}>{option.apy} APY</Text>
              </View>
            </View>
            <View style={styles.stakingDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Min Amount</Text>
                <Text style={styles.detailValue}>{option.minAmount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Lock Period</Text>
                <Text style={styles.detailValue}>{option.locked}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.stakeButton}>
              <Text style={styles.stakeButtonText}>Stake Now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  stakingCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  stakingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  apyBadge: {
    backgroundColor: 'rgba(14, 203, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  apyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  stakingDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  stakeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  stakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.background,
  },
  bottomPadding: {
    height: 40,
  },
});
