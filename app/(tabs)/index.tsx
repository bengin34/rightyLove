import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { QuestionStatus } from '@/types';

export default function HomeScreen() {
  // TODO: Get these from stores
  const streak = 5;
  const hasPartner = true;
  const [questionStatus] = useState<QuestionStatus>('not_answered');
  const todayMood: string | null = null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning! 💕</Text>
            <Text style={styles.streakText}>
              {streak} day streak • Keep it going!
            </Text>
          </View>
          <TouchableOpacity style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color="#FF6B9D" />
            <Text style={styles.streakNumber}>{streak}</Text>
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
            <Text style={styles.cardTitle}>Photo Deck</Text>
          </View>
          <Text style={styles.cardDescription}>
            Swipe through your memories together
          </Text>
          <View style={styles.cardAction}>
            <Text style={styles.cardActionText}>Start swiping</Text>
            <Ionicons name="arrow-forward" size={20} color="#FF6B9D" />
          </View>
        </TouchableOpacity>

        {/* Daily Question Card */}
        <TouchableOpacity
          style={[styles.card, !hasPartner && styles.cardDisabled]}
          onPress={() => hasPartner && router.push('/daily-question')}
          activeOpacity={hasPartner ? 0.9 : 1}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="chatbubbles" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.cardTitle}>Daily Question</Text>
            {questionStatus === 'unlocked' && (
              <View style={styles.unlockedBadge}>
                <Ionicons name="lock-open" size={14} color="#10B981" />
              </View>
            )}
          </View>
          {!hasPartner ? (
            <Text style={styles.cardDescriptionMuted}>
              Pair with your partner to unlock
            </Text>
          ) : questionStatus === 'not_answered' ? (
            <>
              <Text style={styles.cardDescription}>
                Answer to unlock today's connection
              </Text>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#8B5CF6' }]}>
                  Answer now
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#8B5CF6" />
              </View>
            </>
          ) : questionStatus === 'waiting' ? (
            <>
              <Text style={styles.cardDescription}>
                You answered ✓ Waiting for your partner...
              </Text>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#8B5CF6' }]}>
                  Send a nudge
                </Text>
                <Ionicons name="notifications" size={20} color="#8B5CF6" />
              </View>
            </>
          ) : questionStatus === 'unlocked' ? (
            <>
              <Text style={styles.cardDescription}>
                💕 Both answered! See what you said
              </Text>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#10B981' }]}>
                  View answers
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#10B981" />
              </View>
            </>
          ) : (
            <Text style={styles.cardDescriptionMuted}>
              Not unlocked today. Try again tomorrow!
            </Text>
          )}
        </TouchableOpacity>

        {/* Mood Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="happy" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.cardTitle}>Today's Mood</Text>
          </View>
          <Text style={styles.cardDescription}>
            {todayMood ? `You're feeling ${todayMood}` : 'How are you feeling today?'}
          </Text>
          {!todayMood && (
            <View style={styles.moodSelector}>
              {['🙂', '😐', '😞', '😠', '😴'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.moodOption}
                  onPress={() => {
                    // TODO: Save mood
                    console.log('Selected mood:', emoji);
                  }}
                >
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Bottom padding */}
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
  unlockedBadge: {
    backgroundColor: '#D1FAE5',
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
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  moodOption: {
    backgroundColor: '#F9FAFB',
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 28,
  },
});
