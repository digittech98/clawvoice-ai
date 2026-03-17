import React, { useState } from 'react';
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

const futuresPairs = [
  { pair: 'BTCUSDT', price: '$87,456.20', change: '+2.34%', funding: '0.01%' },
  { pair: 'ETHUSDT', price: '$3,245.80', change: '-1.23%', funding: '0.005%' },
  { pair: 'SOLUSDT', price: '$145.67', change: '+5.67%', funding: '0.02%' },
  { pair: 'BNBUSDT', price: '$582.30', change: '+0.89%', funding: '0.008%' },
];

export default function FuturesScreen() {
  const router = useRouter();
  const [leverage, setLeverage] = useState(10);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Futures</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Warning Card */}
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color={COLORS.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>High Risk Trading</Text>
            <Text style={styles.warningText}>
              Futures trading involves significant risk. You could lose more than your initial investment.
            </Text>
          </View>
        </View>

        {/* Leverage Selector */}
        <View style={styles.leverageCard}>
          <Text style={styles.leverageLabel}>Leverage</Text>
          <View style={styles.leverageOptions}>
            {[5, 10, 20, 50, 100].map((lev) => (
              <TouchableOpacity
                key={lev}
                style={[
                  styles.leverageOption,
                  leverage === lev && styles.leverageOptionActive
                ]}
                onPress={() => setLeverage(lev)}
              >
                <Text style={[
                  styles.leverageText,
                  leverage === lev && styles.leverageTextActive
                ]}>
                  {lev}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Futures Pairs */}
        <Text style={styles.sectionTitle}>Perpetual Futures</Text>
        {futuresPairs.map((pair, index) => (
          <TouchableOpacity key={index} style={styles.pairCard}>
            <View style={styles.pairInfo}>
              <Text style={styles.pairName}>{pair.pair}</Text>
              <Text style={styles.fundingRate}>Funding: {pair.funding}</Text>
            </View>
            <View style={styles.pairPrice}>
              <Text style={styles.priceValue}>{pair.price}</Text>
              <Text style={[
                styles.priceChange,
                { color: pair.change.startsWith('+') ? COLORS.success : COLORS.error }
              ]}>
                {pair.change}
              </Text>
            </View>
            <View style={styles.tradeButtons}>
              <TouchableOpacity style={[styles.tradeBtn, styles.longBtn]}>
                <Text style={styles.tradeBtnText}>Long</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tradeBtn, styles.shortBtn]}>
                <Text style={styles.tradeBtnText}>Short</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What are Futures?</Text>
          <Text style={styles.infoText}>
            Futures are derivative contracts that allow you to speculate on the future price of an asset with leverage. 
            You can profit from both rising (long) and falling (short) markets.
          </Text>
          <View style={styles.infoPoints}>
            <View style={styles.infoPoint}>
              <Ionicons name="trending-up" size={20} color={COLORS.success} />
              <Text style={styles.infoPointText}>Long: Profit when price goes up</Text>
            </View>
            <View style={styles.infoPoint}>
              <Ionicons name="trending-down" size={20} color={COLORS.error} />
              <Text style={styles.infoPointText}>Short: Profit when price goes down</Text>
            </View>
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
  warningCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 185, 11, 0.1)',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  leverageCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  leverageLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  leverageOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  leverageOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceBackground,
    borderRadius: 8,
  },
  leverageOptionActive: {
    backgroundColor: COLORS.primary,
  },
  leverageText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  leverageTextActive: {
    color: COLORS.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pairCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  pairInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pairName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  fundingRate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  pairPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  tradeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  tradeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  longBtn: {
    backgroundColor: COLORS.success,
  },
  shortBtn: {
    backgroundColor: COLORS.error,
  },
  tradeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  infoSection: {
    backgroundColor: COLORS.cardBackground,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoPoints: {
    gap: 8,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoPointText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  bottomPadding: {
    height: 40,
  },
});
