import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  // TODO: Get from store
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const notificationTime = '9:00 AM';
  const isPaired = true;
  const partnerName = 'Partner';
  const inviteCode = 'ABC123';

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => {
          // TODO: Clear auth state and navigate to login
          console.log('Logging out...');
        }},
      ]
    );
  };

  const handleUnpair = () => {
    Alert.alert(
      'Unpair Partner',
      'Are you sure? You will lose access to shared Daily Questions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unpair', style: 'destructive', onPress: () => {
          // TODO: Unpair from server
          console.log('Unpairing...');
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Partner Section */}
        <Text style={styles.sectionTitle}>Partner</Text>
        <View style={styles.card}>
          {isPaired ? (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="heart" size={24} color="#FF6B9D" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>Connected to</Text>
                    <Text style={styles.settingValue}>{partnerName}</Text>
                  </View>
                </View>
                <View style={styles.pairedBadge}>
                  <Text style={styles.pairedBadgeText}>Paired</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.textButton} onPress={handleUnpair}>
                <Text style={styles.textButtonDanger}>Unpair Partner</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="heart-outline" size={24} color="#9CA3AF" />
                  <Text style={styles.settingLabelMuted}>Not paired yet</Text>
                </View>
              </View>
              <View style={styles.inviteCodeSection}>
                <Text style={styles.inviteCodeLabel}>Your invite code</Text>
                <Text style={styles.inviteCodeValue}>{inviteCode}</Text>
              </View>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Share Invite Code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#8B5CF6" />
              <Text style={styles.settingLabel}>Daily Reminders</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#FF6B9D' }}
              thumbColor="#FFFFFF"
            />
          </View>
          {notificationsEnabled && (
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="time" size={24} color="#6B7280" />
                <Text style={styles.settingLabel}>Reminder Time</Text>
              </View>
              <View style={styles.settingAction}>
                <Text style={styles.settingActionText}>{notificationTime}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* App Section */}
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="globe" size={24} color="#6B7280" />
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <View style={styles.settingAction}>
              <Text style={styles.settingActionText}>English</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={24} color="#6B7280" />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={24} color="#6B7280" />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <View style={styles.settingInfo}>
              <Ionicons name="log-out" size={24} color="#EF4444" />
              <Text style={styles.settingLabelDanger}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>RightyLove</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appTagline}>Made with 💕</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTextContainer: {
    marginLeft: 4,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  settingLabelMuted: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  settingLabelDanger: {
    fontSize: 16,
    color: '#EF4444',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingActionText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  pairedBadge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  pairedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  textButton: {
    padding: 16,
    alignItems: 'center',
  },
  textButtonDanger: {
    fontSize: 14,
    color: '#EF4444',
  },
  inviteCodeSection: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  inviteCodeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B9D',
    letterSpacing: 2,
  },
  primaryButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  appVersion: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  appTagline: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 8,
  },
});
