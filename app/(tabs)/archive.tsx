import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type WeeklyRecap = {
  weekStartDate: string;
  activeDays: number;
  photosLiked: number;
  photosShared: number;
  questionsAnswered: number;
  questionsUnlocked: number;
  bucketItemsCompleted: number;
  moods: string[];
};

export default function ArchiveScreen() {
  // TODO: Get from store
  const currentWeekRecap: WeeklyRecap = {
    weekStartDate: 'Jan 13',
    activeDays: 5,
    photosLiked: 23,
    photosShared: 4,
    questionsAnswered: 5,
    questionsUnlocked: 3,
    bucketItemsCompleted: 2,
    moods: ['🙂', '🙂', '😐', '🙂', '🙂'],
  };

  const streak = 12;

  const handleShareRecap = async () => {
    try {
      await Share.share({
        message: `My RightyLove week 💕\n\n🔥 ${streak} day streak\n📷 ${currentWeekRecap.photosLiked} memories shared\n💬 ${currentWeekRecap.questionsUnlocked} questions unlocked\n✅ ${currentWeekRecap.bucketItemsCompleted} bucket list items done\n\nDownload: https://rightylove.app`,
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
          <Text style={styles.title}>Your Archive</Text>
          <Text style={styles.subtitle}>Week of {currentWeekRecap.weekStartDate}</Text>
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakIconContainer}>
            <Ionicons name="flame" size={40} color="#FF6B9D" />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
          <View style={styles.streakStats}>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{currentWeekRecap.activeDays}/7</Text>
              <Text style={styles.streakStatLabel}>This week</Text>
            </View>
          </View>
        </View>

        {/* Weekly Stats */}
        <Text style={styles.sectionTitle}>This Week's Activity</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📷</Text>
            <Text style={styles.statValue}>{currentWeekRecap.photosLiked}</Text>
            <Text style={styles.statLabel}>Photos Liked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💌</Text>
            <Text style={styles.statValue}>{currentWeekRecap.photosShared}</Text>
            <Text style={styles.statLabel}>Photos Shared</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💬</Text>
            <Text style={styles.statValue}>{currentWeekRecap.questionsAnswered}</Text>
            <Text style={styles.statLabel}>Answered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔓</Text>
            <Text style={styles.statValue}>{currentWeekRecap.questionsUnlocked}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
        </View>

        {/* Mood Summary */}
        <Text style={styles.sectionTitle}>Mood This Week</Text>
        <View style={styles.moodCard}>
          <View style={styles.moodRow}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={day} style={styles.moodDay}>
                <Text style={styles.moodDayLabel}>{day}</Text>
                <Text style={styles.moodDayEmoji}>
                  {currentWeekRecap.moods[index] || '•'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bucket List Progress */}
        <Text style={styles.sectionTitle}>Bucket List</Text>
        <View style={styles.bucketCard}>
          <View style={styles.bucketIconRow}>
            <Text style={styles.bucketEmoji}>✅</Text>
            <Text style={styles.bucketValue}>{currentWeekRecap.bucketItemsCompleted}</Text>
          </View>
          <Text style={styles.bucketLabel}>Items completed this week</Text>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShareRecap}>
          <Ionicons name="share-social" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share Weekly Recap</Text>
        </TouchableOpacity>

        {/* Past Weeks */}
        <Text style={styles.sectionTitle}>Past Weeks</Text>
        <View style={styles.pastWeekCard}>
          <View style={styles.pastWeekHeader}>
            <Text style={styles.pastWeekDate}>Jan 6 - Jan 12</Text>
            <View style={styles.pastWeekBadge}>
              <Ionicons name="flame" size={14} color="#FF6B9D" />
              <Text style={styles.pastWeekStreak}>7 days</Text>
            </View>
          </View>
          <View style={styles.pastWeekStats}>
            <Text style={styles.pastWeekStat}>📷 18</Text>
            <Text style={styles.pastWeekStat}>💬 5</Text>
            <Text style={styles.pastWeekStat}>✅ 1</Text>
          </View>
        </View>

        <View style={styles.pastWeekCard}>
          <View style={styles.pastWeekHeader}>
            <Text style={styles.pastWeekDate}>Dec 30 - Jan 5</Text>
            <View style={styles.pastWeekBadge}>
              <Ionicons name="flame" size={14} color="#FF6B9D" />
              <Text style={styles.pastWeekStreak}>6 days</Text>
            </View>
          </View>
          <View style={styles.pastWeekStats}>
            <Text style={styles.pastWeekStat}>📷 21</Text>
            <Text style={styles.pastWeekStat}>💬 4</Text>
            <Text style={styles.pastWeekStat}>✅ 3</Text>
          </View>
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
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
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
    marginBottom: 24,
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
    marginBottom: 32,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pastWeekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  pastWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pastWeekDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pastWeekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  pastWeekStreak: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF6B9D',
  },
  pastWeekStats: {
    flexDirection: 'row',
    gap: 16,
  },
  pastWeekStat: {
    fontSize: 14,
    color: '#6B7280',
  },
});
