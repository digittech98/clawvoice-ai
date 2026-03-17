import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Coin } from '../constants/types';

interface CoinCardProps {
  coin: Coin;
  onPress?: () => void;
  showVolume?: boolean;
}

export const CoinCard: React.FC<CoinCardProps> = ({ coin, onPress, showVolume = false }) => {
  const isPositive = coin.change24h >= 0;
  
  const getCoinIcon = (symbol: string): keyof typeof Ionicons.glyphMap => {
    switch (symbol) {
      case 'BTC': return 'logo-bitcoin';
      case 'ETH': return 'logo-euro';
      default: return 'ellipse';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Ionicons name={getCoinIcon(coin.symbol)} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.symbol}>{coin.symbol}</Text>
          <Text style={styles.name}>{coin.symbol}/USDT</Text>
        </View>
      </View>
      
      <View style={styles.right}>
        <Text style={styles.price}>
          ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.price < 10 ? 4 : 2 })}
        </Text>
        <View style={[styles.changeContainer, isPositive ? styles.positive : styles.negative]}>
          <Ionicons 
            name={isPositive ? 'caret-up' : 'caret-down'} 
            size={12} 
            color={isPositive ? COLORS.success : COLORS.error} 
          />
          <Text style={[styles.change, isPositive ? styles.positiveText : styles.negativeText]}>
            {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
          </Text>
        </View>
        {showVolume && (
          <Text style={styles.volume}>Vol ${coin.volume}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    gap: 2,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  name: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  positive: {
    backgroundColor: 'rgba(14, 203, 129, 0.1)',
  },
  negative: {
    backgroundColor: 'rgba(246, 70, 93, 0.1)',
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
  positiveText: {
    color: COLORS.success,
  },
  negativeText: {
    color: COLORS.error,
  },
  volume: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
});
