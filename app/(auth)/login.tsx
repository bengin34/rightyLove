import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '@/lib/storage';
import { sendMagicLink } from '@/services/auth';
import { useTranslation } from '@/i18n';

export default function LoginScreen() {
  const { t, tError } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      setError(t('Please enter your email'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('Please enter a valid email'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sendMagicLink(email.trim().toLowerCase());

      if (!result.success) {
        setError(tError(result.error, 'Failed to send magic link'));
        return;
      }

      // Store email for verification screen
      storage.set('pending_email', email.trim().toLowerCase());
      router.push('/(auth)/magic-link-info');
    } catch (err) {
      setError(t('Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
          {/* Logo/Title */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text
              style={{
                fontSize: 48,
                marginBottom: 8,
              }}
            >
              💕
            </Text>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: '#FF6B9D',
                marginBottom: 8,
              }}
            >
              {t('RightyLove')}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
              }}
            >
              {t('Connect with your partner,\none moment at a time')}
            </Text>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#333',
                marginBottom: 8,
              }}
            >
              {t('Email')}
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              placeholderTextColor="#999"
              placeholder={t('your@email.com')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: error ? '#FF4444' : '#E0E0E0',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                backgroundColor: '#FAFAFA',
              }}
            />
            {error ? (
              <Text
                style={{
                  color: '#FF4444',
                  fontSize: 14,
                  marginTop: 8,
                }}
              >
                {error}
              </Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSendMagicLink}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#FFB3C7' : '#FF6B9D',
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
                {t('Send Magic Link')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <Text
            style={{
              textAlign: 'center',
              color: '#999',
              fontSize: 14,
              marginTop: 16,
            }}
          >
            {t("We'll send you a magic link to sign in.\nNo password needed!")}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
