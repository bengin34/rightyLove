import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useActivityStore } from '@/stores/activityStore';
import { useCoupleStore } from '@/stores/coupleStore';
import { useMoodStore } from '@/stores/moodStore';
import { usePhotoStore } from '@/stores/photoStore';
import { getDailyQuestion } from '@/services/dailyQuestion';
import MoodCheckIn, { MoodDisplay } from '@/components/MoodCheckIn';
import AnniversaryCard from '@/components/AnniversaryCard';
import type { QuestionStatus, DailyResponse } from '@/types';
import { useTranslation } from '@/i18n';

export default function HomeScreen() {
  const { t } = useTranslation();
  const streak = useActivityStore((state) => state.streak);
  const couple = useCoupleStore((state) => state.couple);
  const todayMood = useMoodStore((state) => state.todayMood);
  const photoCount = usePhotoStore((state) => state.photos.length);

  const isPaired = couple?.memberB ? true : false;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('Good morning');
    if (hour < 17) return t('Good afternoon');
    return t('Good evening');
  };

  const [refreshing, setRefreshing] = useState(false);
  const [dailyData, setDailyData] = useState<DailyResponse | null>(null);
  const [showMoodSheet, setShowMoodSheet] = useState(false);

  // Determine question status
  const getQuestionStatus = (): QuestionStatus => {
    if (!dailyData) return 'not_answered';
    if (dailyData.isUnlocked) return 'unlocked';
    if (dailyData.myStatus === 'answered') return 'waiting';
    return 'not_answered';
  };

  const questionStatus = getQuestionStatus();

  // Fetch daily question data
  const fetchDailyData = useCallback(async () => {
    if (!isPaired) return;

    const result = await getDailyQuestion();
    if (result.success && result.data) {
      setDailyData(result.data);
    }
  }, [isPaired]);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDailyData();
    setRefreshing(false);
  }, [fetchDailyData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B9D"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}! 💕</Text>
            <Text style={styles.streakText}>
              {streak.currentStreak > 0
                ? t('{{count}} day streak • Keep it going!', {
                    count: streak.currentStreak,
                  })
                : t('Start your streak today!')}
            </Text>
          </View>
          <TouchableOpacity style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color="#FF6B9D" />
            <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
          </TouchableOpacity>
        </View>

        {/* Photo Deck Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/photo-deck')}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="images" size={24} color="#FF6B9D" />
            </View>
            <Text style={styles.cardTitle}>{t('Photo Deck')}</Text>
            {photoCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{photoCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDescription}>
            {photoCount > 0
              ? t('Swipe through your memories together')
              : t('Add photos to start your "Us" album')}
          </Text>
          <View style={styles.cardAction}>
            <Text style={styles.cardActionText}>
              {photoCount > 0 ? t('Start swiping') : t('Add photos')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FF6B9D" />
          </View>
        </TouchableOpacity>

        {/* Daily Question Card */}
        <TouchableOpacity
          style={[styles.card, !isPaired && styles.cardDisabled]}
          onPress={() =>
            isPaired
              ? router.push('/daily-question')
              : router.push('/(onboarding)/pair-partner')
          }
          activeOpacity={0.9}
        >
          {isPaired && questionStatus !== 'unlocked' && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={16} color="#8B5CF6" />
            </View>
          )}
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="chatbubbles" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.cardTitle}>{t('Daily Question')}</Text>
            {questionStatus === 'unlocked' && (
              <View style={styles.unlockedBadge}>
                <Ionicons name="lock-open" size={14} color="#10B981" />
              </View>
            )}
          </View>
          {!isPaired ? (
            <Text style={styles.cardDescriptionMuted}>
              {t('Pair with your partner to unlock daily questions')}
            </Text>
          ) : questionStatus === 'not_answered' ? (
            <>
              <Text style={styles.cardDescription}>
                {t("Answer to unlock today's connection")}
              </Text>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#8B5CF6' }]}>
                  {t('Answer now')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#8B5CF6" />
              </View>
            </>
          ) : questionStatus === 'waiting' ? (
            <>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.statusText}>{t('You answered')}</Text>
              </View>
              <Text style={styles.cardDescription}>
                {t('Waiting for your partner to unlock...')}
              </Text>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#8B5CF6' }]}>
                  {t('Send a nudge')}
                </Text>
                <Ionicons name="notifications" size={20} color="#8B5CF6" />
              </View>
            </>
          ) : questionStatus === 'unlocked' ? (
            <>
              <Text style={styles.cardDescription}>
                {t('Both answered! See what you said 💕')}
              </Text>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#10B981' }]}>
                  {t('View answers')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#10B981" />
              </View>
            </>
          ) : (
            <Text style={styles.cardDescriptionMuted}>
              {t('Not unlocked today. Try again tomorrow!')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Mood Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowMoodSheet(true)}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="happy" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.cardTitle}>{t("Today's Mood")}</Text>
          </View>

          {todayMood ? (
            <View style={styles.moodCompleted}>
              <MoodDisplay />
              <Text style={styles.moodCompletedText}>
                {t('Tap to change or share with your partner')}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.cardDescription}>
                {t('How are you feeling today?')}
              </Text>
              <View style={styles.moodPreview}>
                {['🙂', '😐', '😞', '😠', '😴'].map((emoji) => (
                  <View key={emoji} style={styles.moodPreviewItem}>
                    <Text style={styles.moodPreviewEmoji}>{emoji}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#F59E0B' }]}>
                  {t('Check in')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#F59E0B" />
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Anniversary Card */}
        <AnniversaryCard />

        {/* Streak Summary Card */}
        {streak.currentStreak > 0 && (
          <View style={styles.streakCard}>
            <View style={styles.streakCardHeader}>
              <Ionicons name="flame" size={24} color="#FF6B9D" />
              <Text style={styles.streakCardTitle}>{t('Your Streaks')}</Text>
            </View>
            <View style={styles.streakStats}>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{streak.currentStreak}</Text>
                <Text style={styles.streakStatLabel}>{t('Current')}</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{streak.longestStreak}</Text>
                <Text style={styles.streakStatLabel}>{t('Longest')}</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>
                  {streak.activeDaysThisWeek}/7
                </Text>
                <Text style={styles.streakStatLabel}>{t('This week')}</Text>
              </View>
              {streak.coupleUnlockStreak !== undefined && streak.coupleUnlockStreak > 0 && (
                <>
                  <View style={styles.streakDivider} />
                  <View style={styles.streakStat}>
                    <Text style={[styles.streakStatValue, { color: '#8B5CF6' }]}>
                      {streak.coupleUnlockStreak}
                    </Text>
                    <Text style={styles.streakStatLabel}>{t('Unlocks')}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Mood Check-in Sheet */}
      <MoodCheckIn
        visible={showMoodSheet}
        onClose={() => setShowMoodSheet(false)}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  streakText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  unlockedBadge: {
    backgroundColor: '#D1FAE5',
    padding: 6,
    borderRadius: 8,
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F3F4F6',
    padding: 6,
    borderRadius: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardDescriptionMuted: {
    fontSize: 15,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  moodPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodPreviewItem: {
    backgroundColor: '#F9FAFB',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodPreviewEmoji: {
    fontSize: 24,
  },
  moodCompleted: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  moodCompletedText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  streakCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  streakCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  streakStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
});
