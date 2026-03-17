import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/colors';
import { useApp } from '../src/context/AppContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, language, setLanguage, currency, setCurrency, t } = useApp();
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = React.useState(false);
  const [showAntiPhishingModal, setShowAntiPhishingModal] = React.useState(false);
  const [antiPhishingInput, setAntiPhishingInput] = React.useState('');

  const handleToggle2FA = () => {
    Alert.alert(
      settings.twoFactorEnabled ? t('disable2FA') : t('enable2FA'),
      settings.twoFactorEnabled ? t('disable2FAMessage') : t('enable2FAMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: settings.twoFactorEnabled ? t('disable2FA') : t('enable2FA'), 
          onPress: () => updateSettings({ twoFactorEnabled: !settings.twoFactorEnabled }),
          style: settings.twoFactorEnabled ? 'destructive' : 'default'
        },
      ]
    );
  };

  const handleVerifyKYC = () => {
    if (settings.kycVerified) {
      Alert.alert(t('kycVerified'), t('kycVerifiedMessage'));
    } else {
      Alert.alert(
        t('verifyIdentity'),
        t('verifyIdentityMessage'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('startVerification'), onPress: () => updateSettings({ kycVerified: true }) },
        ]
      );
    }
  };

  const handleAntiPhishing = () => {
    if (settings.antiPhishingCode) {
      Alert.alert(t('antiPhishingCode'), `${t('antiPhishingCode')}: ${settings.antiPhishingCode}`);
    } else {
      setAntiPhishingInput('');
      setShowAntiPhishingModal(true);
    }
  };

  const saveAntiPhishingCode = () => {
    if (antiPhishingInput.length >= 4) {
      updateSettings({ antiPhishingCode: antiPhishingInput });
      setShowAntiPhishingModal(false);
    } else {
      Alert.alert(t('error'), t('codeMustBe4Chars'));
    }
  };

  const handleChangePassword = () => {
    Alert.alert(t('changePassword'), language === 'fr' 
      ? 'La modification du mot de passe s\'ouvrirait ici.'
      : 'Password change flow would open here.');
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    showArrow = true 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Demo User</Text>
            <Text style={styles.profileEmail}>demo@binance.com</Text>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('security')}</Text>
          
          <SettingItem
            icon="shield-checkmark"
            title={t('twoFactorAuth')}
            subtitle={settings.twoFactorEnabled ? t('enabled') : t('disabled')}
            onPress={handleToggle2FA}
            rightElement={
              <Switch
                value={settings.twoFactorEnabled}
                onValueChange={handleToggle2FA}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.textPrimary}
              />
            }
            showArrow={false}
          />

          <SettingItem
            icon="card"
            title={t('identityVerification')}
            subtitle={settings.kycVerified ? t('verified') : t('notVerified')}
            onPress={handleVerifyKYC}
            rightElement={
              <View style={[
                styles.statusBadge,
                settings.kycVerified ? styles.verifiedBadge : styles.unverifiedBadge
              ]}>
                <Text style={styles.statusText}>
                  {settings.kycVerified ? t('verified') : t('verify')}
                </Text>
              </View>
            }
            showArrow={false}
          />

          <SettingItem
            icon="mail"
            title={t('antiPhishingCode')}
            subtitle={settings.antiPhishingCode ? t('set') : t('notSet')}
            onPress={handleAntiPhishing}
          />

          <SettingItem
            icon="lock-closed"
            title={t('changePassword')}
            subtitle={t('updatePasswordRegularly')}
            onPress={handleChangePassword}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('preferences')}</Text>
          
          <SettingItem
            icon="notifications"
            title={t('notifications')}
            subtitle={settings.notificationsEnabled ? t('enabled') : t('disabled')}
            rightElement={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.textPrimary}
              />
            }
            showArrow={false}
          />

          <SettingItem
            icon="globe"
            title={t('language')}
            subtitle={language === 'fr' ? 'Français' : 'English'}
            onPress={() => setShowLanguageModal(true)}
          />

          <SettingItem
            icon="cash"
            title={t('currency')}
            subtitle={currency}
            onPress={() => setShowCurrencyModal(true)}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('support')}</Text>
          
          <SettingItem
            icon="help-circle"
            title={t('helpCenter')}
            subtitle={t('getHelp')}
            onPress={() => Alert.alert(t('helpCenter'), language === 'fr' ? 'Centre d\'aide' : 'Help Center')}
          />

          <SettingItem
            icon="chatbubbles"
            title={t('contactSupport')}
            subtitle={t('chatWithTeam')}
            onPress={() => Alert.alert(t('contactSupport'), language === 'fr' ? 'Support' : 'Contact Support')}
          />

          <SettingItem
            icon="document-text"
            title={t('termsOfService')}
            onPress={() => Alert.alert(t('termsOfService'), language === 'fr' ? 'Conditions' : 'Terms')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert(t('logOut'), language === 'fr' ? 'Déconnexion simulée' : 'Simulated logout')}>
          <Ionicons name="log-out" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>{t('logOut')}</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>{t('version')} 1.0.0 ({t('demo')})</Text>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('language')}</Text>
            <TouchableOpacity 
              style={[styles.modalOption, language === 'en' && styles.modalOptionActive]}
              onPress={() => { setLanguage('en'); setShowLanguageModal(false); }}
            >
              <Text style={styles.modalOptionText}>English</Text>
              {language === 'en' && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, language === 'fr' && styles.modalOptionActive]}
              onPress={() => { setLanguage('fr'); setShowLanguageModal(false); }}
            >
              <Text style={styles.modalOptionText}>Français</Text>
              {language === 'fr' && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.modalCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('currency')}</Text>
            <TouchableOpacity 
              style={[styles.modalOption, currency === 'USD' && styles.modalOptionActive]}
              onPress={() => { setCurrency('USD'); setShowCurrencyModal(false); }}
            >
              <Text style={styles.modalOptionText}>USD ($)</Text>
              {currency === 'USD' && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, currency === 'EUR' && styles.modalOptionActive]}
              onPress={() => { setCurrency('EUR'); setShowCurrencyModal(false); }}
            >
              <Text style={styles.modalOptionText}>EUR (€)</Text>
              {currency === 'EUR' && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCurrencyModal(false)}>
              <Text style={styles.modalCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Anti-Phishing Modal */}
      <Modal visible={showAntiPhishingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('setAntiPhishingCode')}</Text>
            <Text style={styles.modalDescription}>{t('antiPhishingMessage')}</Text>
            <TextInput
              style={styles.modalInput}
              value={antiPhishingInput}
              onChangeText={setAntiPhishingInput}
              placeholder={language === 'fr' ? 'Entrez le code...' : 'Enter code...'}
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAntiPhishingModal(false)}>
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveAntiPhishingCode}>
                <Text style={styles.modalSaveText}>{t('set')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    gap: 16,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(14, 203, 129, 0.2)',
  },
  unverifiedBadge: {
    backgroundColor: COLORS.surfaceBackground,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 20,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surfaceBackground,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalOptionActive: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  modalCancel: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceBackground,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceBackground,
    borderRadius: 10,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
  },
});
