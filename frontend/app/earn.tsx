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

const earnProducts = [
  { name: 'Simple Earn', desc: 'Flexible savings with daily rewards', icon: 'wallet', apy: 'Up to 5%' },
  { name: 'Locked Savings', desc: 'Higher APY with locked terms', icon: 'lock-closed', apy: 'Up to 12%' },
  { name: 'DeFi Staking', desc: 'Participate in DeFi protocols', icon: 'git-network', apy: 'Up to 20%' },
  { name: 'Launchpool', desc: 'Farm new tokens by staking', icon: 'rocket', apy: 'Variable' },
  { name: 'Dual Investment', desc: 'Enhanced yields with price targets', icon: 'analytics', apy: 'Up to 50%' },
];

export default function EarnScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Binance Earn</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Total Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Total Earnings (Est.)</Text>
          <Text style={styles.earningsAmount}>$1,234.56</Text>
          <Text style={styles.earningsSubtext}>From all Earn products</Text>
        </View>

        {/* Earn Products */}
        <Text style={styles.sectionTitle}>Earn Products</Text>
        {earnProducts.map((product, index) => (
          <TouchableOpacity key={index} style={styles.productCard}>
            <View style={styles.productIcon}>
              <Ionicons name={product.icon as any} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDesc}>{product.desc}</Text>
            </View>
            <View style={styles.productApy}>
              <Text style={styles.apyValue}>{product.apy}</Text>
              <Text style={styles.apyLabel}>APY</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* FAQ */}
        <View style={styles.faqCard}>
          <Ionicons name="help-circle" size={24} color={COLORS.primary} />
          <View style={styles.faqContent}>
            <Text style={styles.faqTitle}>How does Binance Earn work?</Text>
            <Text style={styles.faqText}>
              Deposit your idle crypto to earn passive income. Choose from flexible or locked products based on your needs.
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
  earningsCard: {
    backgroundColor: COLORS.cardBackground,
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  productApy: {
    alignItems: 'flex-end',
  },
  apyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
  },
  apyLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  faqCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  faqContent: {
    flex: 1,
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  faqText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
