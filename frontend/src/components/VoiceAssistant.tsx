import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';

interface VoiceAssistantProps {
  onNavigate?: (screen: string, params?: Record<string, any>) => void;
}

type VoiceStatus = 'idle' | 'listening' | 'parsing' | 'executing' | 'responding';

interface LogEntry {
  step: string;
  status: 'pending' | 'active' | 'done';
  detail?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onNavigate }) => {
  const { 
    addOrder, 
    updateSettings, 
    setLanguage, 
    setCurrency, 
    language,
    setActiveModal,
    setModalData,
  } = useApp();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [response, setResponse] = useState('');
  const [voiceLang, setVoiceLang] = useState<'en' | 'fr'>(language);
  const [error, setError] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const recognitionRef = useRef<any>(null);

  const API = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.100.2:8001';

  // Sync voice language with app language
  useEffect(() => {
    setVoiceLang(language);
  }, [language]);

  // Pulse animation for listening state
  useEffect(() => {
    if (status === 'listening') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
        ])
      );
      
      pulse.start();
      glow.start();
      
      return () => {
        pulse.stop();
        glow.stop();
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [status]);

  const updateLogs = (step: string, stepStatus: 'pending' | 'active' | 'done', detail?: string) => {
    setLogs(prev => {
      const existing = prev.findIndex(l => l.step === step);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { step, status: stepStatus, detail };
        return updated;
      }
      return [...prev, { step, status: stepStatus, detail }];
    });
  };

  const speak = async (text: string) => {
    try {
      await Speech.speak(text, {
        language: voiceLang === 'fr' ? 'fr-FR' : 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (err) {
      console.log('Speech error:', err);
    }
  };

  const executeAction = (result: any) => {
    const { intent, action, params } = result;
    
    console.log('Executing action:', intent, action, params);
    
    // Handle account settings
    if (intent === 'account') {
      if (action === 'enable_2fa' || action === 'disable_2fa') {
        const enabled = params.enabled !== false;
        updateSettings({ twoFactorEnabled: enabled });
        return voiceLang === 'fr' 
          ? (enabled ? '2FA activé' : '2FA désactivé')
          : (enabled ? '2FA enabled' : '2FA disabled');
      }
      if (action === 'verify_kyc') {
        updateSettings({ kycVerified: true });
        return voiceLang === 'fr' ? 'KYC vérifié' : 'KYC verified';
      }
      if (action === 'set_antiphishing') {
        if (params.code) {
          updateSettings({ antiPhishingCode: params.code });
          return voiceLang === 'fr' 
            ? `Code anti-phishing défini: ${params.code}`
            : `Anti-phishing code set: ${params.code}`;
        }
      }
      if (action === 'toggle_notifications') {
        const enabled = params.enabled !== false;
        updateSettings({ notificationsEnabled: enabled });
        return voiceLang === 'fr'
          ? (enabled ? 'Notifications activées' : 'Notifications désactivées')
          : (enabled ? 'Notifications enabled' : 'Notifications disabled');
      }
    }
    
    // Handle app settings
    if (intent === 'settings') {
      if (action === 'change_language') {
        const newLang = params.language === 'fr' ? 'fr' : 'en';
        setLanguage(newLang);
        setVoiceLang(newLang);
        return newLang === 'fr' 
          ? 'Langue changée en français'
          : 'Language changed to English';
      }
      if (action === 'change_currency') {
        const newCurrency = params.currency === 'EUR' ? 'EUR' : 'USD';
        setCurrency(newCurrency);
        return voiceLang === 'fr'
          ? `Devise changée en ${newCurrency}`
          : `Currency changed to ${newCurrency}`;
      }
    }
    
    // Handle trading
    if (intent === 'trade' && action === 'place_order') {
      const order = {
        id: Date.now().toString(),
        type: params.type || 'buy',
        coin: params.coin || 'BTC',
        amount: params.amount || 0,
        condition: params.condition,
        targetPrice: params.target_price,
        status: 'pending' as const,
        createdAt: new Date(),
      };
      addOrder(order);
      return voiceLang === 'fr' ? 'Ordre placé' : 'Order placed';
    }
    
    // Handle wallet actions - these now navigate with params
    if (intent === 'wallet') {
      if (action === 'deposit') {
        return voiceLang === 'fr' ? 'Ouverture du dépôt' : 'Opening deposit';
      }
      if (action === 'withdraw') {
        // Navigation with params will be handled in processCommand
        return voiceLang === 'fr' ? 'Ouverture du retrait' : 'Opening withdrawal';
      }
    }
    
    return voiceLang === 'fr' ? 'Action terminée' : 'Action completed';
  };

  const processCommand = async (text: string) => {
    if (!text.trim()) return;
    
    setError('');
    setTranscript(text);
    setStatus('parsing');
    setLogs([]);
    updateLogs(voiceLang === 'fr' ? 'Analyse de la commande' : 'Parsing command', 'active', text);

    try {
      const apiUrl = `${API}/api/voice/process`;
      
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ text, language: voiceLang }),
      });

      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      console.log('API Result:', result);
      
      updateLogs(voiceLang === 'fr' ? 'Analyse de la commande' : 'Parsing command', 'done', result.intent);

      // Build navigation params if withdrawal
      let navParams: Record<string, any> = {};
      if (result.intent === 'wallet' && result.action === 'withdraw' && result.params) {
        if (result.params.coin) navParams.coin = result.params.coin;
        if (result.params.amount) navParams.amount = result.params.amount.toString();
        if (result.params.network) navParams.network = result.params.network;
      }

      // FIRST: Navigate to the relevant page
      if (result.navigation && onNavigate) {
        setStatus('executing');
        updateLogs(voiceLang === 'fr' ? 'Navigation' : 'Navigating', 'active', result.navigation);
        onNavigate(result.navigation, Object.keys(navParams).length > 0 ? navParams : undefined);
        await new Promise(resolve => setTimeout(resolve, 800));
        updateLogs(voiceLang === 'fr' ? 'Navigation' : 'Navigating', 'done', result.navigation);
      }

      // THEN: Execute the action and update the UI
      updateLogs(voiceLang === 'fr' ? 'Exécution' : 'Executing action', 'active', result.action);
      const actionResult = executeAction(result);
      updateLogs(voiceLang === 'fr' ? 'Exécution' : 'Executing action', 'done', actionResult);

      // FINALLY: Respond with voice
      setStatus('responding');
      updateLogs(voiceLang === 'fr' ? 'Réponse' : 'Responding', 'active');
      
      setResponse(result.response_text);
      
      // Close the panel to show the page, then speak
      setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
      
      await speak(result.response_text);
      
      updateLogs(voiceLang === 'fr' ? 'Réponse' : 'Responding', 'done');

      setTimeout(() => {
        setStatus('idle');
        setLogs([]);
        setTranscript('');
        setResponse('');
      }, 2000);

    } catch (err: any) {
      console.error('Error processing command:', err);
      const errorMsg = voiceLang === 'fr' 
        ? 'Désolé, je n\'ai pas pu traiter cette commande.'
        : 'Sorry, I had trouble processing that command.';
      setError(err.message || 'Unknown error');
      updateLogs(voiceLang === 'fr' ? 'Erreur' : 'Error', 'done', err.message);
      setResponse(errorMsg);
      await speak(errorMsg);
      setStatus('idle');
    }
  };

  const startListening = () => {
    setError('');
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
          const msg = voiceLang === 'fr' 
            ? 'Reconnaissance vocale non supportée. Utilisez le champ de texte.'
            : 'Speech recognition not supported. Please use the text input.';
          setError(msg);
          return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = voiceLang === 'fr' ? 'fr-FR' : 'en-US';

        recognition.onstart = () => {
          setStatus('listening');
          setLogs([]);
          updateLogs(voiceLang === 'fr' ? 'Écoute' : 'Listening', 'active');
          setTranscript('');
          setResponse('');
          setError('');
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptText;
            } else {
              interimTranscript += transcriptText;
            }
          }

          setTranscript(finalTranscript || interimTranscript);

          if (finalTranscript) {
            updateLogs(voiceLang === 'fr' ? 'Écoute' : 'Listening', 'done', finalTranscript);
            recognition.stop();
            processCommand(finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setStatus('idle');
          
          let errorMsg = '';
          if (event.error === 'not-allowed') {
            errorMsg = voiceLang === 'fr' 
              ? 'Accès au microphone refusé.'
              : 'Microphone access denied.';
          } else if (event.error === 'no-speech') {
            errorMsg = voiceLang === 'fr'
              ? 'Aucune voix détectée.'
              : 'No speech detected.';
          } else {
            errorMsg = `${event.error}`;
          }
          
          setError(errorMsg);
        };

        recognition.onend = () => {
          if (status === 'listening') {
            setStatus('idle');
          }
        };

        recognition.start();
      } catch (err: any) {
        setError(err.message);
        setStatus('idle');
      }
    } else {
      setError(voiceLang === 'fr' 
        ? 'Utilisez le champ de texte.'
        : 'Please use the text input.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setStatus('idle');
  };

  const toggleListening = () => {
    setIsExpanded(true);
    if (status === 'listening') {
      stopListening();
    } else if (status === 'idle') {
      startListening();
    }
  };

  const handleSubmitText = () => {
    if (inputText.trim() && status === 'idle') {
      processCommand(inputText.trim());
      setInputText('');
    }
  };

  const getStatusColor = (s: VoiceStatus) => {
    switch (s) {
      case 'listening': return COLORS.primary;
      case 'parsing': return COLORS.warning;
      case 'executing': return COLORS.success;
      case 'responding': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (s: VoiceStatus) => {
    if (voiceLang === 'fr') {
      switch (s) {
        case 'listening': return '🎤 Écoute en cours...';
        case 'parsing': return '🧠 Claw réfléchit...';
        case 'executing': return '⚡ Exécution...';
        case 'responding': return '🔊 Réponse...';
        default: return 'Appuyez pour parler';
      }
    }
    switch (s) {
      case 'listening': return '🎤 Listening...';
      case 'parsing': return '🧠 Claw Thinking...';
      case 'executing': return '⚡ Executing...';
      case 'responding': return '🔊 Speaking...';
      default: return 'Tap to speak';
    }
  };

  const exampleCommands = voiceLang === 'fr' ? [
    '"Désactiver mon 2FA"',
    '"Activer mon 2FA"',
    '"Retrait de 20 USDT sur BEP20"',
    '"Acheter 0.05 BTC"',
    '"Changer la langue en anglais"',
  ] : [
    '"Disable my 2FA"',
    '"Enable my 2FA"',
    '"Withdraw 20 USDT on BEP20"',
    '"Buy 0.05 BTC"',
    '"Change language to French"',
  ];

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(240, 185, 11, 0.3)', 'rgba(240, 185, 11, 0.8)']
  });

  return (
    <>
      {/* Floating Mic Button */}
      <View style={styles.floatingButtonContainer}>
        {status === 'listening' && (
          <Animated.View
            style={[
              styles.glowRing,
              { backgroundColor: glowColor, transform: [{ scale: pulseAnim }] },
            ]}
          />
        )}
        <Animated.View
          style={[
            styles.floatingButton,
            { transform: [{ scale: status === 'listening' ? pulseAnim : 1 }] },
          ]}
        >
          <TouchableOpacity
            style={[styles.micButton, status === 'listening' && styles.micButtonActive]}
            onPress={toggleListening}
            activeOpacity={0.8}
          >
            <Ionicons
              name={status === 'listening' ? 'mic' : 'mic-outline'}
              size={28}
              color={COLORS.background}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Voice Panel Modal */}
      <Modal
        visible={isExpanded}
        transparent
        animationType="slide"
        onRequestClose={() => setIsExpanded(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.voicePanel}>
            {/* Header */}
            <View style={styles.panelHeader}>
              <View style={styles.headerLeft}>
                <Ionicons name="logo-bitcoin" size={24} color={COLORS.primary} />
                <Text style={styles.panelTitle}>ClawVoice</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity 
                  style={styles.langToggle}
                  onPress={() => setVoiceLang(voiceLang === 'en' ? 'fr' : 'en')}
                >
                  <Text style={styles.langText}>{voiceLang.toUpperCase()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsExpanded(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Status */}
            <View style={styles.statusContainer}>
              {status === 'parsing' || status === 'executing' ? (
                <ActivityIndicator size="small" color={getStatusColor(status)} />
              ) : (
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
              )}
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Transcript */}
            {transcript ? (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptLabel}>
                  {voiceLang === 'fr' ? 'Vous avez dit:' : 'You said:'}
                </Text>
                <Text style={styles.transcriptText}>"{transcript}"</Text>
              </View>
            ) : null}

            {/* Logs */}
            <ScrollView style={styles.logsContainer}>
              {logs.map((log, index) => (
                <View key={index} style={styles.logEntry}>
                  <Ionicons
                    name={
                      log.status === 'done' ? 'checkmark-circle' :
                      log.status === 'active' ? 'ellipse' : 'ellipse-outline'
                    }
                    size={16}
                    color={
                      log.status === 'done' ? COLORS.success :
                      log.status === 'active' ? COLORS.primary : COLORS.textSecondary
                    }
                  />
                  <View style={styles.logContent}>
                    <Text style={styles.logStep}>{log.step}</Text>
                    {log.detail && <Text style={styles.logDetail}>{log.detail}</Text>}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Response */}
            {response ? (
              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>
                  {voiceLang === 'fr' ? 'Claw dit:' : 'Claw says:'}
                </Text>
                <Text style={styles.responseText}>{response}</Text>
              </View>
            ) : null}

            {/* Text Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder={voiceLang === 'fr' ? 'Tapez votre commande...' : 'Type your command...'}
                placeholderTextColor={COLORS.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSubmitText}
                returnKeyType="send"
                editable={status === 'idle'}
              />
              <TouchableOpacity 
                style={[styles.sendButton, inputText.trim() && status === 'idle' && styles.sendButtonActive]}
                onPress={handleSubmitText}
                disabled={status !== 'idle' || !inputText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={inputText.trim() && status === 'idle' ? COLORS.primary : COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Mic Button */}
            <View style={styles.controls}>
              <View style={styles.micButtonWrapper}>
                {status === 'listening' && (
                  <Animated.View
                    style={[styles.micGlow, { backgroundColor: glowColor, transform: [{ scale: pulseAnim }] }]}
                  />
                )}
                <Animated.View style={{ transform: [{ scale: status === 'listening' ? pulseAnim : 1 }] }}>
                  <TouchableOpacity
                    style={[styles.controlButton, status === 'listening' && styles.controlButtonActive]}
                    onPress={toggleListening}
                    disabled={status !== 'idle' && status !== 'listening'}
                  >
                    <Ionicons
                      name={status === 'listening' ? 'stop' : 'mic'}
                      size={32}
                      color={COLORS.background}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            {/* Examples */}
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>
                {voiceLang === 'fr' ? 'Essayez:' : 'Try:'}
              </Text>
              {exampleCommands.map((cmd, i) => (
                <TouchableOpacity 
                  key={i} 
                  onPress={() => setInputText(cmd.replace(/"/g, ''))}
                  style={styles.exampleButton}
                >
                  <Text style={styles.exampleText}>{cmd}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  floatingButton: {
    zIndex: 1001,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: COLORS.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  voicePanel: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  langToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceBackground,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(246, 70, 93, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
  },
  transcriptContainer: {
    backgroundColor: COLORS.surfaceBackground,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  transcriptLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  logsContainer: {
    maxHeight: 100,
    marginBottom: 12,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  logContent: {
    flex: 1,
  },
  logStep: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  logDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  responseContainer: {
    backgroundColor: COLORS.surfaceBackground,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  responseLabel: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  sendButton: {
    padding: 8,
    borderRadius: 8,
  },
  sendButtonActive: {
    backgroundColor: 'rgba(240, 185, 11, 0.2)',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  micButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: COLORS.error,
  },
  examplesContainer: {
    padding: 12,
    backgroundColor: COLORS.surfaceBackground,
    borderRadius: 12,
  },
  examplesTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  exampleButton: {
    paddingVertical: 4,
  },
  exampleText: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
});
