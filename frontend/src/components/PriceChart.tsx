import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';

interface ChartPoint {
  x: number;
  y: number;
}

interface PriceChartProps {
  symbol: string;
  currentPrice: number;
  change24h: number;
}

const PERIODS = ['1H', '1D', '1W', '1M', '1Y'];

export const PriceChart: React.FC<PriceChartProps> = ({ symbol, currentPrice, change24h }) => {
  const [period, setPeriod] = useState('1D');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/market/chart/${symbol}?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data.data);
      }
    } catch (error) {
      console.log('Error fetching chart data:', error);
      // Generate fallback data
      const fallbackData = Array.from({ length: 24 }, (_, i) => ({
        x: i,
        y: currentPrice * (1 + (Math.random() - 0.5) * 0.1),
      }));
      setChartData(fallbackData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChartData();
  }, [symbol, period]);

  const isPositive = change24h >= 0;
  const chartColor = isPositive ? COLORS.success : COLORS.error;
  
  // Calculate chart dimensions
  const chartWidth = Dimensions.get('window').width - 64;
  const chartHeight = 150;
  
  // Calculate min/max for scaling
  const prices = chartData.map(d => d.y);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;
  const priceRange = maxPrice - minPrice;

  // Generate SVG path
  const generatePath = () => {
    if (chartData.length < 2) return '';
    
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * chartWidth;
      const y = chartHeight - ((point.y - minPrice) / priceRange) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return points.join(' ');
  };

  // Generate area fill path
  const generateAreaPath = () => {
    if (chartData.length < 2) return '';
    
    const linePath = generatePath();
    const lastX = chartWidth;
    const firstX = 0;
    
    return `${linePath} L ${lastX} ${chartHeight} L ${firstX} ${chartHeight} Z`;
  };

  return (
    <View style={styles.container}>
      {/* Chart Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{symbol}/USDT</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <View style={[styles.changeBadge, isPositive ? styles.positive : styles.negative]}>
              <Text style={[styles.changeText, { color: chartColor }]}>
                {isPositive ? '+' : ''}{change24h.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
            {/* Simple line chart using View elements */}
            {chartData.length > 1 && chartData.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = chartData[index - 1];
              
              const x1 = ((index - 1) / (chartData.length - 1)) * chartWidth;
              const y1 = chartHeight - ((prevPoint.y - minPrice) / priceRange) * chartHeight;
              const x2 = (index / (chartData.length - 1)) * chartWidth;
              const y2 = chartHeight - ((point.y - minPrice) / priceRange) * chartHeight;
              
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
              
              return (
                <View
                  key={index}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      backgroundColor: chartColor,
                      transform: [{ rotate: `${angle}deg` }],
                      transformOrigin: 'left center',
                    },
                  ]}
                />
              );
            })}
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const x = (index / (chartData.length - 1)) * chartWidth;
              const y = chartHeight - ((point.y - minPrice) / priceRange) * chartHeight;
              
              // Only show every few points to avoid clutter
              if (index % Math.ceil(chartData.length / 8) !== 0 && index !== chartData.length - 1) return null;
              
              return (
                <View
                  key={`dot-${index}`}
                  style={[
                    styles.dataPoint,
                    {
                      left: x - 3,
                      top: y - 3,
                      backgroundColor: chartColor,
                    },
                  ]}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Price Range */}
      <View style={styles.priceRange}>
        <Text style={styles.rangeText}>
          H: ${maxPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.rangeText}>
          L: ${minPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  symbol: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  positive: {
    backgroundColor: 'rgba(14, 203, 129, 0.15)',
  },
  negative: {
    backgroundColor: 'rgba(246, 70, 93, 0.15)',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceBackground,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.background,
  },
  chartContainer: {
    marginBottom: 12,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    position: 'relative',
    overflow: 'hidden',
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
