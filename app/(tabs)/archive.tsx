import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useActivityStore } from '@/stores/activityStore';
import { useMoodStore } from '@/stores/moodStore';
import { usePhotoStore } from '@/stores/photoStore';
import { useBucketStore } from '@/stores/bucketStore';
import { getLocale, useTranslation } from '@/i18n';

const formatWeekDate = (dateString: string, locale: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
};

export default function ArchiveScreen() {
  const { t, language } = useTranslation();
  // Get data from stores
  const { streak, getWeeklyRecap } = useActivityStore();
  const { getWeekMoods } = useMoodStore();
  const { getWeeklyStats } = usePhotoStore();
  const { getWeeklyCompletedCount } = useBucketStore();

  // Get weekly moods
  const weekMoods = getWeekMoods();

  // Build weekly recap with real data
  const currentWeekRecap = useMemo(() => {
    const recap = getWeeklyRecap(weekMoods);
    const photoStats = getWeeklyStats();
    const bucketCompleted = getWeeklyCompletedCount();

    return {
      ...recap,
      photosLiked: photoStats.liked,
      photosShared: photoStats.shared,
      bucketItemsCompleted: bucketCompleted,
    };
  }, [getWeeklyRecap, weekMoods, getWeeklyStats, getWeeklyCompletedCount]);

  const handleShareRecap = async () => {
    try {
      await Share.share({
        message: t(
          'My RightyLove week 💕\n\n🔥 {{streak}} day streak\n📷 {{liked}} photos liked\n💌 {{shared}} photos shared\n💬 {{unlocked}} questions unlocked\n✅ {{completed}} bucket list items done\n\nDownload: https://rightylove.app',
          {
            streak: streak.currentStreak,
            liked: currentWeekRecap.photosLiked,
            shared: currentWeekRecap.photosShared,
            unlocked: currentWeekRecap.questionsUnlocked,
            completed: currentWeekRecap.bucketItemsCompleted,
          }
        ),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Your Archive')}</Text>
          <Text style={styles.subtitle}>
            {t('Week of {{date}}', {
              date: formatWeekDate(currentWeekRecap.weekStartDate, getLocale(language)),
            })}
          </Text>
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakIconContainer}>
            <Ionicons name="flame" size={40} color="#FF6B9D" />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
            <Text style={styles.streakLabel}>{t('Day Streak')}</Text>
          </View>
          <View style={styles.streakStats}>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{streak.activeDaysThisWeek}/7</Text>
              <Text style={styles.streakStatLabel}>{t('This week')}</Text>
            </View>
            {streak.coupleUnlockStreak !== undefined && streak.coupleUnlockStreak > 0 && (
              <View style={[styles.streakStat, { marginTop: 8 }]}>
                <Text style={styles.streakStatValue}>{streak.coupleUnlockStreak}</Text>
                <Text style={styles.streakStatLabel}>{t('Unlocks')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Longest Streak */}
        {streak.longestStreak > streak.currentStreak && (
          <View style={styles.longestStreakBadge}>
            <Ionicons name="trophy" size={16} color="#F59E0B" />
            <Text style={styles.longestStreakText}>
              {t('Longest streak: {{count}} days', { count: streak.longestStreak })}
            </Text>
          </View>
        )}

        {/* Weekly Stats */}
        <Text style={styles.sectionTitle}>{t("This Week's Activity")}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📷</Text>
            <Text style={styles.statValue}>{currentWeekRecap.photosLiked}</Text>
            <Text style={styles.statLabel}>{t('Photos Liked')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💌</Text>
            <Text style={styles.statValue}>{currentWeekRecap.photosShared}</Text>
            <Text style={styles.statLabel}>{t('Photos Shared')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💬</Text>
            <Text style={styles.statValue}>{currentWeekRecap.questionsAnswered}</Text>
            <Text style={styles.statLabel}>{t('Answered')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔓</Text>
            <Text style={styles.statValue}>{currentWeekRecap.questionsUnlocked}</Text>
            <Text style={styles.statLabel}>{t('Unlocked')}</Text>
          </View>
        </View>

        {/* Mood Summary */}
        <Text style={styles.sectionTitle}>{t('Mood This Week')}</Text>
        <View style={styles.moodCard}>
        <View style={styles.moodRow}>
          {[t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat'), t('Sun')].map((day, index) => (
            <View key={day} style={styles.moodDay}>
              <Text style={styles.moodDayLabel}>{day}</Text>
              <Text style={styles.moodDayEmoji}>
                {weekMoods[index] || '•'}
              </Text>
            </View>
          ))}
        </View>
        </View>

        {/* Bucket List Progress */}
        <Text style={styles.sectionTitle}>{t('Bucket List')}</Text>
        <View style={styles.bucketCard}>
          <View style={styles.bucketIconRow}>
            <Text style={styles.bucketEmoji}>✅</Text>
            <Text style={styles.bucketValue}>{currentWeekRecap.bucketItemsCompleted}</Text>
          </View>
          <Text style={styles.bucketLabel}>{t('Items completed this week')}</Text>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShareRecap}>
          <Ionicons name="share-social" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>{t('Share Weekly Recap')}</Text>
        </TouchableOpacity>

        {/* Empty state for past weeks - will be populated when we have history */}
        <Text style={styles.sectionTitle}>{t('Past Weeks')}</Text>
        <View style={styles.emptyPastWeeks}>
          <Text style={styles.emptyPastWeeksText}>
            {t('Your weekly history will appear here')}
          </Text>
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
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  streakIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
    marginLeft: 16,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  streakLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  streakStats: {
    alignItems: 'flex-end',
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  streakStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  longestStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 6,
  },
  longestStreakText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    flexGrow: 1,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  moodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodDay: {
    alignItems: 'center',
  },
  moodDayLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  moodDayEmoji: {
    fontSize: 24,
  },
  bucketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  bucketIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bucketEmoji: {
    fontSize: 32,
  },
  bucketValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10B981',
  },
  bucketLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  shareButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyPastWeeks: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyPastWeeksText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
