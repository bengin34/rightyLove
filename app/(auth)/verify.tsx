import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '@/lib/storage';
import { verifyOtp, sendMagicLink } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/i18n';

const OTP_LENGTH = 6;

export default function VerifyScreen() {
  const { t, tError } = useTranslation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const pendingEmail = storage.getString('pending_email') || '';
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Countdown for resend
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Auto-verify when OTP is complete
    if (otp.length === OTP_LENGTH) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH || !pendingEmail) {
      setError(t('Please enter the 6-digit code'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp(pendingEmail, otp);

      if (!result.success) {
        setError(tError(result.error, 'Verification failed'));
        setOtp('');
        return;
      }

      if (result.user) {
        setUser(result.user);
        // Clear pending email
        storage.delete('pending_email');
        // Navigate to onboarding
        router.replace('/(onboarding)/relationship-info');
      }
    } catch (err) {
      setError(t('Verification failed. Please try again.'));
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !pendingEmail) return;

    setLoading(true);
    setError('');

    try {
      const result = await sendMagicLink(pendingEmail);

      if (!result.success) {
        setError(tError(result.error, 'Failed to resend'));
        return;
      }

      setResendCooldown(60);
    } catch (err) {
      setError(t('Failed to resend. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: 16,
            left: 24,
            padding: 8,
          }}
        >
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📧</Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#333',
              marginBottom: 8,
            }}
          >
            {t('Check your email')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#666',
              textAlign: 'center',
            }}
          >
            {t('We sent a 6-digit code to')}{'\n'}
            <Text style={{ fontWeight: '600', color: '#FF6B9D' }}>
              {pendingEmail}
            </Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View style={{ marginBottom: 24 }}>
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
              setOtp(cleaned);
              setError('');
            }}
            placeholder={t('000000')}
            placeholderTextColor="#CCC"
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: error ? '#FF4444' : '#E0E0E0',
              borderRadius: 12,
              padding: 16,
              fontSize: 32,
              textAlign: 'center',
              letterSpacing: 16,
              backgroundColor: '#FAFAFA',
              fontWeight: '600',
            }}
          />
          {error ? (
            <Text
              style={{
                color: '#FF4444',
                fontSize: 14,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {error}
            </Text>
          ) : null}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading || otp.length !== OTP_LENGTH}
          style={{
            backgroundColor:
              loading || otp.length !== OTP_LENGTH ? '#FFB3C7' : '#FF6B9D',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
            style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
              {t('Verify')}
          </Text>
        )}
      </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={resendCooldown > 0 || loading}
          style={{
            marginTop: 24,
            alignItems: 'center',
          }}
        >
          <Text
          style={{
            color: resendCooldown > 0 ? '#999' : '#FF6B9D',
            fontSize: 14,
          }}
        >
          {resendCooldown > 0
            ? t('Resend code in {{count}}s', { count: resendCooldown })
            : t("Didn't receive the code? Resend")}
        </Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
