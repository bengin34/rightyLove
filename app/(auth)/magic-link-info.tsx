import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { storage } from '@/lib/storage';
import { sendMagicLink } from '@/services/auth';
import { useTranslation } from '@/i18n';

export default function MagicLinkInfoScreen() {
  const { t, tError } = useTranslation();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pendingEmail = storage.getString('pending_email') || '';

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!pendingEmail || resendCooldown > 0) return;

    setIsResending(true);
    setStatusMessage(null);
    const result = await sendMagicLink(pendingEmail);
    setIsResending(false);

    if (!result.success) {
      setStatusMessage(tError(result.error, 'Failed to send magic link'));
      return;
    }

    setResendCooldown(30);
    setStatusMessage(
      t('We sent a new link to {{email}}.', { email: pendingEmail })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail" size={32} color="#FF6B9D" />
        </View>
        <Text style={styles.title}>{t('Check your email')}</Text>
        <Text style={styles.subtitle}>
          {t('We sent a secure sign-in link to {{email}}.', {
            email: pendingEmail || t('your@email.com'),
          })}
          {'\n'}
          {t('The email will come from Supabase Auth on behalf of RightyLove.')}
        </Text>

        <View style={styles.stepsCard}>
          <View style={styles.stepRow}>
            <View style={styles.stepDot}>
              <Text style={styles.stepDotText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              {t('Open the email and tap the link to sign in.')}
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepDot}>
              <Text style={styles.stepDotText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              {t("We'll bring you back to RightyLove automatically.")}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('Expected email preview')}</Text>
          <Text style={styles.infoText}>
            {t('From: Supabase Auth')}
          </Text>
          <Text style={styles.infoText}>
            {t('Subject: Your Magic Link')}
          </Text>
          <Text style={styles.infoText}>
            {t('Inside: "Magic Link" title and a "Log In" button')}
          </Text>
          <Text style={styles.infoText}>
            {t('The link will open rightylove.app or rightylove://')}
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          {t("This link is personal. If you didn't request it, you can ignore this email.")}
        </Text>

        {statusMessage ? (
          <Text style={styles.statusMessage}>{statusMessage}</Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.resendButton, resendCooldown > 0 && styles.resendButtonDisabled]}
          onPress={handleResend}
          disabled={resendCooldown > 0 || isResending || !pendingEmail}
        >
          {isResending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.resendButtonText}>
              {resendCooldown > 0
                ? t('Resend link in {{count}}s', { count: resendCooldown })
                : t('Resend link')}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.changeEmailText}>{t('Change email')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  stepsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepDotText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#FFF5F7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9D174D',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#9D174D',
    lineHeight: 18,
    marginBottom: 6,
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  statusMessage: {
    marginTop: 12,
    fontSize: 13,
    color: '#10B981',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  resendButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    backgroundColor: '#FFB3C7',
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  changeEmailText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },
});
