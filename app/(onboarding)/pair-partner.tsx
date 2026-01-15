import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Share } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

type Mode = 'create' | 'join';

export default function PairPartnerScreen() {
  const [mode, setMode] = useState<Mode>('create');
  const [inviteCode, setInviteCode] = useState('ABC123'); // TODO: Generate from server
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on RightyLove! 💕\n\nUse this code to connect: ${inviteCode}\n\nOr download the app: https://rightylove.app`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleJoin = async () => {
    if (joinCode.length < 6) return;
    setIsLoading(true);
    // TODO: Validate code with server and join couple
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  const handleSkip = () => {
    // Allow using app without partner for now
    router.replace('/(tabs)');
  };

  const handleCreateAndContinue = () => {
    // TODO: Create couple on server
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Connect with your partner</Text>
        <Text style={styles.subtitle}>
          Pair up to unlock the Daily Question feature
        </Text>

        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'create' && styles.modeButtonActive]}
            onPress={() => setMode('create')}
          >
            <Text
              style={[styles.modeButtonText, mode === 'create' && styles.modeButtonTextActive]}
            >
              Create Invite
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'join' && styles.modeButtonActive]}
            onPress={() => setMode('join')}
          >
            <Text
              style={[styles.modeButtonText, mode === 'join' && styles.modeButtonTextActive]}
            >
              Join Partner
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'create' ? (
          <View style={styles.createSection}>
            <View style={styles.qrContainer}>
              <QRCode
                value={`rightylove://join/${inviteCode}`}
                size={180}
                color="#FF6B9D"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.codeLabel}>Your invite code</Text>
            <Text style={styles.codeValue}>{inviteCode}</Text>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share with Partner</Text>
            </TouchableOpacity>
            <Text style={styles.shareHint}>
              Your partner can scan the QR code or enter the code above
            </Text>
          </View>
        ) : (
          <View style={styles.joinSection}>
            <Text style={styles.inputLabel}>Enter your partner's code</Text>
            <TextInput
              style={styles.codeInput}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="ABC123"
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
                {isLoading ? 'Connecting...' : 'Join Partner'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {mode === 'create' && (
          <TouchableOpacity style={styles.continueButton} onPress={handleCreateAndContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>I'll pair later</Text>
        </TouchableOpacity>
        <Text style={styles.hintText}>
          You can still use the app, but Daily Question requires a paired partner
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
  shareHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
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
  hintText: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
  },
});
