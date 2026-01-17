import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Share, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useCouple } from '@/hooks/useCouple';
import { getCurrentCouple } from '@/services/couple';
import { useTranslation } from '@/i18n';

type Mode = 'create' | 'join';

export default function PairPartnerScreen() {
  const { t, tError } = useTranslation();
  const [mode, setMode] = useState<Mode>('create');
  const [joinCode, setJoinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    couple,
    inviteCode,
    isLoading,
    isCoupleFull,
    createCouple,
    joinCouple,
  } = useCouple();

  useEffect(() => {
    setErrorMessage(null);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (!inviteCode || isCoupleFull) return;

    let isActive = true;
    const pollCouple = async () => {
      const result = await getCurrentCouple();
      if (!isActive) return;
      if (result?.memberB) {
        return;
      }
    };

    pollCouple();
    const interval = setInterval(pollCouple, 4000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [mode, inviteCode, isCoupleFull]);

  const handleShare = async () => {
    try {
      if (isCoupleFull) {
        Alert.alert(t('Already connected'), t('You are already paired with your partner.'));
        return;
      }

      let codeToShare = inviteCode;
      if (!codeToShare) {
        const result = await createCouple();
        if (!result.success) {
          setErrorMessage(tError(result.error, 'Failed to create invite code'));
          return;
        }
        codeToShare = result.couple?.inviteCode || null;
      }

      if (!codeToShare) {
        setErrorMessage(t('Invite code is not ready yet. Please try again.'));
        return;
      }

      await Share.share({
        message: t('Join me on RightyLove! 💕\n\nUse this code to connect: {{code}}\n\nOr download the app: https://rightylove.app', {
          code: codeToShare,
        }),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleJoin = async () => {
    const cleanedCode = joinCode.trim();
    if (cleanedCode.length < 6) return;
    if (isCoupleFull) {
      Alert.alert(t('Already connected'), t('You are already paired with your partner.'));
      return;
    }

    setErrorMessage(null);
    const result = await joinCouple(cleanedCode);
    if (!result.success) {
      setErrorMessage(tError(result.error, 'Failed to join partner'));
      return;
    }

    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    // Allow using app without partner for now
    router.replace('/(tabs)');
  };

  const handleCreateAndContinue = () => {
    if (isLoading) return;
    if (isCoupleFull) {
      router.replace('/(tabs)');
      return;
    }

    if (!couple) {
      createCouple().then((result) => {
        if (!result.success) {
          setErrorMessage(tError(result.error, 'Failed to create invite code'));
          return;
        }
        router.replace('/(tabs)');
      });
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('Connect with your partner')}</Text>
        <Text style={styles.subtitle}>
          {t('Pair up to unlock the Daily Question feature')}
        </Text>

        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'create' && styles.modeButtonActive]}
            onPress={() => setMode('create')}
          >
            <Text
              style={[styles.modeButtonText, mode === 'create' && styles.modeButtonTextActive]}
            >
              {t('Create Invite')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'join' && styles.modeButtonActive]}
            onPress={() => setMode('join')}
          >
            <Text
              style={[styles.modeButtonText, mode === 'join' && styles.modeButtonTextActive]}
            >
              {t('Join Partner')}
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'create' ? (
          <View style={styles.createSection}>
            <View style={styles.qrContainer}>
              {inviteCode ? (
                <QRCode
                  value={`rightylove://join/${inviteCode}`}
                  size={180}
                  color="#FF6B9D"
                  backgroundColor="#FFFFFF"
                />
              ) : (
                <Text style={styles.codeLoading}>{t('Generate an invite code to share')}</Text>
              )}
            </View>
            <Text style={styles.codeLabel}>{t('Your invite code')}</Text>
            <Text style={styles.codeValue}>{inviteCode || '------'}</Text>
            <TouchableOpacity
              style={[styles.shareButton, isCoupleFull && styles.shareButtonDisabled]}
              onPress={handleShare}
              disabled={isCoupleFull || isLoading}
            >
              <Text style={styles.shareButtonText}>
                {inviteCode ? t('Share with Partner') : t('Generate Invite Code')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.shareHint}>
              {t('Your partner can scan the QR code or enter the code above')}
            </Text>
            {inviteCode && (
              <Text style={styles.pairStatusText}>
                {isCoupleFull ? t('Partner connected!') : t('Waiting for your partner to join...')}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.joinSection}>
            <Text style={styles.inputLabel}>{t("Enter your partner's code")}</Text>
            <TextInput
              style={styles.codeInput}
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              placeholder={t('ABC123')}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity
              style={[
                styles.joinButton,
                joinCode.length < 6 && styles.joinButtonDisabled,
              ]}
              onPress={handleJoin}
              disabled={joinCode.length < 6 || isLoading}
            >
              <Text style={styles.joinButtonText}>
                {isLoading ? t('Connecting...') : t('Join Partner')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {mode === 'create' && (
          <TouchableOpacity style={styles.continueButton} onPress={handleCreateAndContinue}>
            <Text style={styles.continueButtonText}>{t('Continue')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>{t("I'll pair later")}</Text>
        </TouchableOpacity>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        <Text style={styles.hintText}>
          {t('You can still use the app, but Daily Question requires a paired partner')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  createSection: {
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  codeLoading: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B9D',
    letterSpacing: 4,
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  pairStatusText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  joinSection: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  codeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 8,
    width: '100%',
    marginBottom: 24,
  },
  joinButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  continueButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
  },
});
