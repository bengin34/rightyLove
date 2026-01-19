import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/stores/authStore';
import { useCoupleStore } from '@/stores/coupleStore';
import { usePhotoStore } from '@/stores/photoStore';
import { useMoodStore } from '@/stores/moodStore';
import { useBucketStore } from '@/stores/bucketStore';
import { useActivityStore } from '@/stores/activityStore';
import { signOut } from '@/services/auth';
import * as Linking from 'expo-linking';
import { getLocale, useTranslation, languageLabels } from '@/i18n';
import { calculateDuration, formatDurationSimple, getNextAnniversary } from '@/utils/anniversary';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useTranslation();
  const { user, onboarding, logout: clearAuth, setRelationshipStartDate } = useAuthStore();
  const { couple, isPaired, inviteCode, unpair } = useCoupleStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Anniversary calculations
  const anniversaryInfo = useMemo(() => {
    if (!onboarding.relationshipStartDate) return null;
    const startDate = new Date(onboarding.relationshipStartDate);
    const duration = calculateDuration(startDate);
    const nextAnniversary = getNextAnniversary(startDate);
    return { startDate, duration, nextAnniversary };
  }, [onboarding.relationshipStartDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(getLocale(language), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setRelationshipStartDate(selectedDate);
    }
  };

  // Format notification time
  const formatTime = (date: Date) =>
    date.toLocaleTimeString(getLocale(language), {
      hour: 'numeric',
      minute: '2-digit',
    });

  const notificationTime = onboarding.notificationTime
    ? formatTime(new Date(onboarding.notificationTime))
    : formatTime(new Date(2024, 0, 1, 9, 0));

  const handleLogout = useCallback(() => {
    Alert.alert(
      t('Log Out?'),
      t('Are you sure you want to log out? Your local data will be preserved.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Log Out'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              clearAuth();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              // Still clear local state even if server logout fails
              clearAuth();
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  }, [clearAuth, t]);

  const handleClearData = useCallback(() => {
    Alert.alert(
      t('Clear All Data'),
      t(
        'This will delete all your photos, moods, bucket list items, and activity history. This cannot be undone.'
      ),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Clear Data'),
          style: 'destructive',
          onPress: () => {
            // Clear all stores
            usePhotoStore.getState().photos = [];
            useMoodStore.getState().entries = [];
            useBucketStore.getState().items = [];
            useActivityStore.getState().activities = [];
            Alert.alert(t('Data Cleared'), t('All your local data has been cleared.'));
          },
        },
      ]
    );
  }, [t]);

  const handleUnpair = useCallback(() => {
    Alert.alert(
      t('Unpair Partner'),
      t(
        'Are you sure? You will lose access to shared Daily Questions until you pair again.'
      ),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Unpair'),
          style: 'destructive',
          onPress: () => {
            unpair();
            // TODO: Call server to unpair when connected
          },
        },
      ]
    );
  }, [unpair, t]);

  const handleShareInviteCode = useCallback(async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: t(
          'Join me on RightyLove! Use my invite code: {{code}}\n\nDownload: https://rightylove.app',
          { code: inviteCode }
        ),
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [inviteCode, t]);

  const handleLanguageSelect = useCallback(() => {
    const options = [
      { code: 'en', label: languageLabels.en },
      { code: 'tr', label: languageLabels.tr },
      { code: 'de', label: languageLabels.de },
      { code: 'it', label: languageLabels.it },
      { code: 'fr', label: languageLabels.fr },
      { code: 'es', label: languageLabels.es },
    ] as const;

    Alert.alert(
      t('Language'),
      t('Choose your language'),
      [
        ...options.map((option) => ({
          text: t(option.label),
          onPress: () => setLanguage(option.code),
        })),
        { text: t('Cancel'), style: 'cancel' },
      ]
    );
  }, [setLanguage, t]);

  const handleOpenPrivacy = useCallback(() => {
    Linking.openURL('https://rightylove.app/privacy');
  }, []);

  const handleOpenTerms = useCallback(() => {
    Linking.openURL('https://rightylove.app/terms');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Settings')}</Text>
        </View>

        {/* Account Info */}
        {user && (
          <>
            <Text style={styles.sectionTitle}>{t('Account')}</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="person-circle" size={24} color="#FF6B9D" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>{t('Email')}</Text>
                    <Text style={styles.settingValue}>{user.email}</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Partner Section */}
        <Text style={styles.sectionTitle}>{t('Partner')}</Text>
        <View style={styles.card}>
          {isPaired && couple ? (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="heart" size={24} color="#FF6B9D" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>{t('Connected')}</Text>
                    <Text style={styles.settingValue}>{t('Partner linked')}</Text>
                  </View>
                </View>
                <View style={styles.pairedBadge}>
                  <Text style={styles.pairedBadgeText}>{t('Paired')}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.textButton} onPress={handleUnpair}>
                <Text style={styles.textButtonDanger}>{t('Unpair Partner')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="heart-outline" size={24} color="#9CA3AF" />
                  <Text style={styles.settingLabelMuted}>{t('Not paired yet')}</Text>
                </View>
              </View>
              {inviteCode && (
                <>
                  <View style={styles.inviteCodeSection}>
                    <Text style={styles.inviteCodeLabel}>{t('Your invite code')}</Text>
                    <Text style={styles.inviteCodeValue}>{inviteCode}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleShareInviteCode}
                  >
                    <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>{t('Share Invite Code')}</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={[styles.primaryButton, styles.secondaryButton]}
                onPress={() => router.push('/(onboarding)/pair-partner')}
              >
                <Text style={styles.secondaryButtonText}>{t('Pair with Partner')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Anniversary Section */}
        <Text style={styles.sectionTitle}>{t('Anniversary')}</Text>
        <View style={styles.card}>
          {anniversaryInfo ? (
            <>
              <View style={styles.anniversaryHeader}>
                <View style={styles.anniversaryDurationContainer}>
                  <Text style={styles.anniversaryDurationLabel}>{t('Together for')}</Text>
                  <Text style={styles.anniversaryDuration}>
                    {formatDurationSimple(anniversaryInfo.duration)}
                  </Text>
                </View>
                <View style={styles.anniversaryHeartContainer}>
                  <Text style={styles.anniversaryHeart}>💕</Text>
                  <Text style={styles.anniversaryDays}>
                    {anniversaryInfo.duration.totalDays} {t('days')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.settingInfo}>
                  <Ionicons name="calendar" size={24} color="#FF6B9D" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>{t('Anniversary Date')}</Text>
                    <Text style={styles.settingValue}>
                      {formatDate(anniversaryInfo.startDate)}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {anniversaryInfo.nextAnniversary.daysUntil > 0 && (
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="gift" size={24} color="#8B5CF6" />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>{t('Next Anniversary')}</Text>
                      <Text style={styles.settingValue}>
                        {anniversaryInfo.nextAnniversary.daysUntil === 1
                          ? t('Tomorrow!')
                          : t('In {{count}} days', { count: anniversaryInfo.nextAnniversary.daysUntil })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.anniversaryYearBadge}>
                    <Text style={styles.anniversaryYearText}>
                      {anniversaryInfo.nextAnniversary.yearsCompleted} {t('years')}
                    </Text>
                  </View>
                </View>
              )}

              {anniversaryInfo.nextAnniversary.isToday && (
                <View style={styles.anniversaryTodayBanner}>
                  <Text style={styles.anniversaryTodayEmoji}>🎉</Text>
                  <Text style={styles.anniversaryTodayText}>
                    {t('Happy Anniversary!')}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
                  <Text style={styles.settingLabelMuted}>{t('No anniversary date set')}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>{t('Set Anniversary Date')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Widgets Section */}
        <Text style={styles.sectionTitle}>{t('Widgets')}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/widgets-picker')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="grid" size={24} color="#8B5CF6" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t('Home Screen Widgets')}</Text>
                <Text style={styles.settingValue}>{t('Add widgets to your home screen')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>{t('Notifications')}</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#8B5CF6" />
              <Text style={styles.settingLabel}>{t('Daily Reminders')}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#FF6B9D' }}
              thumbColor="#FFFFFF"
            />
          </View>
          {notificationsEnabled && (
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/(onboarding)/notification-time')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="time" size={24} color="#6B7280" />
                <Text style={styles.settingLabel}>{t('Reminder Time')}</Text>
              </View>
              <View style={styles.settingAction}>
                <Text style={styles.settingActionText}>{notificationTime}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* App Section */}
        <Text style={styles.sectionTitle}>{t('App')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={handleLanguageSelect}>
            <View style={styles.settingInfo}>
              <Ionicons name="globe" size={24} color="#6B7280" />
              <Text style={styles.settingLabel}>{t('Language')}</Text>
            </View>
            <View style={styles.settingAction}>
              <Text style={styles.settingActionText}>
                {t(languageLabels[language])}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={handleOpenPrivacy}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={24} color="#6B7280" />
              <Text style={styles.settingLabel}>{t('Privacy Policy')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={handleOpenTerms}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={24} color="#6B7280" />
              <Text style={styles.settingLabel}>{t('Terms of Service')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>{t('Danger Zone')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={handleClearData}>
            <View style={styles.settingInfo}>
              <Ionicons name="trash" size={24} color="#EF4444" />
              <Text style={styles.settingLabelDanger}>{t('Clear Local Data')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <View style={styles.settingInfo}>
              <Ionicons name="log-out" size={24} color="#EF4444" />
              <Text style={styles.settingLabelDanger}>{t('Log Out')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{t('RightyLove')}</Text>
          <Text style={styles.appVersion}>{t('Version 1.0.0')}</Text>
          <Text style={styles.appTagline}>{t('Made with love')}</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={anniversaryInfo?.startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <View style={styles.datePickerModal}>
          <TouchableOpacity
            style={styles.datePickerOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>{t('Select Anniversary Date')}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerDone}>{t('Done')}</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={anniversaryInfo?.startDate || new Date()}
              mode="date"
              display="inline"
              onChange={handleDateChange}
              maximumDate={new Date()}
              style={styles.datePicker}
              themeVariant="light"
            />
          </View>
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    marginTop: 0,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
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
  // Anniversary styles
  anniversaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  anniversaryDurationContainer: {
    flex: 1,
  },
  anniversaryDurationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  anniversaryDuration: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  anniversaryHeartContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  anniversaryHeart: {
    fontSize: 24,
    marginBottom: 2,
  },
  anniversaryDays: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  anniversaryYearBadge: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  anniversaryYearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  anniversaryTodayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF0F3',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  anniversaryTodayEmoji: {
    fontSize: 24,
  },
  anniversaryTodayText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  // Date picker modal styles
  datePickerModal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  datePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  datePicker: {
    height: 350,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
});
