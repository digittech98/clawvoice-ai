import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../src/constants/colors';
import { useApp } from '../src/context/AppContext';

const NETWORKS = [
  { id: 'bep20', name: 'BNB Smart Chain (BEP20)', fee: 0.5, minWithdraw: 10 },
  { id: 'erc20', name: 'Ethereum (ERC20)', fee: 15, minWithdraw: 50 },
  { id: 'trc20', name: 'Tron (TRC20)', fee: 1, minWithdraw: 10 },
  { id: 'polygon', name: 'Polygon', fee: 0.1, minWithdraw: 5 },
  { id: 'arbitrum', name: 'Arbitrum One', fee: 0.5, minWithdraw: 10 },
  { id: 'solana', name: 'Solana', fee: 0.01, minWithdraw: 1 },
];

const COINS = [
  { symbol: 'USDT', name: 'Tether USD', networks: ['bep20', 'erc20', 'trc20', 'polygon', 'arbitrum', 'solana'] },
  { symbol: 'BTC', name: 'Bitcoin', networks: ['bep20'] },
  { symbol: 'ETH', name: 'Ethereum', networks: ['erc20', 'bep20', 'arbitrum', 'polygon'] },
  { symbol: 'BNB', name: 'BNB', networks: ['bep20'] },
  { symbol: 'SOL', name: 'Solana', networks: ['solana'] },
];

export default function WithdrawScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { balances, setBalances, language } = useApp();
  
  const [selectedCoin, setSelectedCoin] = useState<string>(params.coin as string || 'USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<string>(params.network as string || '');
  const [amount, setAmount] = useState<string>(params.amount as string || '');
  const [address, setAddress] = useState<string>('');
  const [showCoinPicker, setShowCoinPicker] = useState(false);
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isFrench = language === 'fr';

  const currentCoin = COINS.find(c => c.symbol === selectedCoin) || COINS[0];
  const availableNetworks = NETWORKS.filter(n => currentCoin.networks.includes(n.id));
  const currentNetwork = NETWORKS.find(n => n.id === selectedNetwork);
  
  const coinBalance = balances.find(b => b.coin === selectedCoin);
  const availableBalance = coinBalance?.amount || 0;

  // Set default network when coin changes
  useEffect(() => {
    if (availableNetworks.length > 0 && !availableNetworks.find(n => n.id === selectedNetwork)) {
      setSelectedNetwork(availableNetworks[0].id);
    }
  }, [selectedCoin]);

  // Pre-fill from voice command params
  useEffect(() => {
    if (params.coin) setSelectedCoin(params.coin as string);
    if (params.network) {
      const networkId = (params.network as string).toLowerCase().replace(/\s/g, '');
      const matchedNetwork = NETWORKS.find(n => 
        n.id.toLowerCase() === networkId || 
        n.name.toLowerCase().includes(networkId)
      );
      if (matchedNetwork) setSelectedNetwork(matchedNetwork.id);
    }
    if (params.amount) setAmount(params.amount as string);
  }, [params]);

  const handleMaxAmount = () => {
    const fee = currentNetwork?.fee || 0;
    const maxAmount = Math.max(0, availableBalance - fee);
    setAmount(maxAmount.toString());
  };

  const validateWithdrawal = (): boolean => {
    if (!selectedNetwork) {
      Alert.alert(
        isFrench ? 'Erreur' : 'Error',
        isFrench ? 'Veuillez sélectionner un réseau' : 'Please select a network'
      );
      return false;
    }
    
    if (!address.trim()) {
      Alert.alert(
        isFrench ? 'Erreur' : 'Error',
        isFrench ? 'Veuillez entrer une adresse de retrait' : 'Please enter a withdrawal address'
      );
      return false;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(
        isFrench ? 'Erreur' : 'Error',
        isFrench ? 'Veuillez entrer un montant valide' : 'Please enter a valid amount'
      );
      return false;
    }

    const minWithdraw = currentNetwork?.minWithdraw || 0;
    if (amountNum < minWithdraw) {
      Alert.alert(
        isFrench ? 'Erreur' : 'Error',
        isFrench 
          ? `Le montant minimum de retrait est ${minWithdraw} ${selectedCoin}`
          : `Minimum withdrawal amount is ${minWithdraw} ${selectedCoin}`
      );
      return false;
    }

    const fee = currentNetwork?.fee || 0;
    if (amountNum + fee > availableBalance) {
      Alert.alert(
        isFrench ? 'Solde insuffisant' : 'Insufficient Balance',
        isFrench 
          ? `Vous n'avez pas assez de ${selectedCoin}. Solde: ${availableBalance}, Requis: ${amountNum + fee} (incluant les frais)`
          : `You don't have enough ${selectedCoin}. Balance: ${availableBalance}, Required: ${amountNum + fee} (including fees)`
      );
      return false;
    }

    return true;
  };

  const handleWithdraw = () => {
    if (!validateWithdrawal()) return;

    const amountNum = parseFloat(amount);
    const fee = currentNetwork?.fee || 0;

    Alert.alert(
      isFrench ? 'Confirmer le retrait' : 'Confirm Withdrawal',
      isFrench 
        ? `Retirer ${amountNum} ${selectedCoin} vers\n${address.substring(0, 20)}...\n\nRéseau: ${currentNetwork?.name}\nFrais: ${fee} ${selectedCoin}\nVous recevrez: ${amountNum} ${selectedCoin}`
        : `Withdraw ${amountNum} ${selectedCoin} to\n${address.substring(0, 20)}...\n\nNetwork: ${currentNetwork?.name}\nFee: ${fee} ${selectedCoin}\nYou will receive: ${amountNum} ${selectedCoin}`,
      [
        { text: isFrench ? 'Annuler' : 'Cancel', style: 'cancel' },
        { 
          text: isFrench ? 'Confirmer' : 'Confirm',
          style: 'default',
          onPress: processWithdrawal
        }
      ]
    );
  };

  const processWithdrawal = async () => {
    setIsProcessing(true);
    
    // Simulate withdrawal processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const amountNum = parseFloat(amount);
    const fee = currentNetwork?.fee || 0;

    // Update balance
    const newBalances = balances.map(b => {
      if (b.coin === selectedCoin) {
        const newAmount = b.amount - amountNum - fee;
        return {
          ...b,
          amount: Math.max(0, newAmount),
          valueUSD: b.valueUSD * (newAmount / b.amount)
        };
      }
      return b;
    });

    setBalances(newBalances);
    setIsProcessing(false);

    Alert.alert(
      isFrench ? 'Retrait réussi!' : 'Withdrawal Successful!',
      isFrench 
        ? `${amountNum} ${selectedCoin} a été envoyé avec succès. La transaction peut prendre quelques minutes pour apparaître.`
        : `${amountNum} ${selectedCoin} has been sent successfully. The transaction may take a few minutes to appear.`,
      [
        { 
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {isFrench ? 'Retrait' : 'Withdraw'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Coin Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {isFrench ? 'Crypto' : 'Coin'}
            </Text>
            <TouchableOpacity 
              style={styles.selector}
              onPress={() => setShowCoinPicker(!showCoinPicker)}
            >
              <View style={styles.selectorLeft}>
                <View style={styles.coinIcon}>
                  <Ionicons name="logo-bitcoin" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.selectorText}>{selectedCoin}</Text>
                  <Text style={styles.selectorSubtext}>{currentCoin.name}</Text>
                </View>
              </View>
              <Ionicons 
                name={showCoinPicker ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>
            
            {showCoinPicker && (
              <View style={styles.pickerDropdown}>
                {COINS.map(coin => (
                  <TouchableOpacity
                    key={coin.symbol}
                    style={[
                      styles.pickerItem,
                      selectedCoin === coin.symbol && styles.pickerItemActive
                    ]}
                    onPress={() => {
                      setSelectedCoin(coin.symbol);
                      setShowCoinPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{coin.symbol}</Text>
                    <Text style={styles.pickerItemSubtext}>{coin.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Network Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {isFrench ? 'Réseau' : 'Network'}
            </Text>
            <TouchableOpacity 
              style={styles.selector}
              onPress={() => setShowNetworkPicker(!showNetworkPicker)}
            >
              <Text style={styles.selectorText}>
                {currentNetwork?.name || (isFrench ? 'Sélectionner un réseau' : 'Select Network')}
              </Text>
              <Ionicons 
                name={showNetworkPicker ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>
            
            {showNetworkPicker && (
              <View style={styles.pickerDropdown}>
                {availableNetworks.map(network => (
                  <TouchableOpacity
                    key={network.id}
                    style={[
                      styles.pickerItem,
                      selectedNetwork === network.id && styles.pickerItemActive
                    ]}
                    onPress={() => {
                      setSelectedNetwork(network.id);
                      setShowNetworkPicker(false);
                    }}
                  >
                    <View>
                      <Text style={styles.pickerItemText}>{network.name}</Text>
                      <Text style={styles.pickerItemSubtext}>
                        {isFrench ? 'Frais:' : 'Fee:'} {network.fee} {selectedCoin} | Min: {network.minWithdraw} {selectedCoin}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Address Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {isFrench ? 'Adresse de retrait' : 'Withdrawal Address'}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={isFrench ? 'Entrez l\'adresse' : 'Enter address'}
                placeholderTextColor={COLORS.textSecondary}
                value={address}
                onChangeText={setAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.pasteButton}>
                <Ionicons name="clipboard-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <View style={styles.amountHeader}>
              <Text style={styles.sectionLabel}>
                {isFrench ? 'Montant' : 'Amount'}
              </Text>
              <Text style={styles.balanceText}>
                {isFrench ? 'Disponible:' : 'Available:'} {availableBalance.toFixed(4)} {selectedCoin}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity style={styles.maxButton} onPress={handleMaxAmount}>
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fee Info */}
          {currentNetwork && (
            <View style={styles.feeCard}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>
                  {isFrench ? 'Frais de réseau' : 'Network Fee'}
                </Text>
                <Text style={styles.feeValue}>{currentNetwork.fee} {selectedCoin}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>
                  {isFrench ? 'Retrait minimum' : 'Minimum Withdrawal'}
                </Text>
                <Text style={styles.feeValue}>{currentNetwork.minWithdraw} {selectedCoin}</Text>
              </View>
              {amount && parseFloat(amount) > 0 && (
                <View style={[styles.feeRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>
                    {isFrench ? 'Vous recevrez' : 'You will receive'}
                  </Text>
                  <Text style={styles.totalValue}>
                    {parseFloat(amount).toFixed(4)} {selectedCoin}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Warning */}
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color={COLORS.warning} />
            <Text style={styles.warningText}>
              {isFrench 
                ? 'Assurez-vous que le réseau correspond à l\'adresse de destination. Les fonds envoyés au mauvais réseau ne peuvent pas être récupérés.'
                : 'Make sure the network matches the destination address. Funds sent to the wrong network cannot be recovered.'}
            </Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Withdraw Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.withdrawButton, isProcessing && styles.withdrawButtonDisabled]}
            onPress={handleWithdraw}
            disabled={isProcessing}
          >
            <Text style={styles.withdrawButtonText}>
              {isProcessing 
                ? (isFrench ? 'Traitement...' : 'Processing...') 
                : (isFrench ? 'Retirer' : 'Withdraw')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectorLeft: {
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
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectorSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pickerDropdown: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemActive: {
    backgroundColor: COLORS.surfaceBackground,
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pickerItemSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  pasteButton: {
    padding: 8,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  maxButton: {
    backgroundColor: COLORS.surfaceBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  feeCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  feeValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
  },
  warningCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: 'rgba(240, 185, 11, 0.1)',
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.warning,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  withdrawButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.background,
  },
});
