import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/i18n';
import {
  calculateDuration,
  formatDurationSimple,
  getNextAnniversary,
  getUpcomingMilestones,
  isSpecialMilestone,
} from '@/utils/anniversary';

interface AnniversaryCardProps {
  compact?: boolean;
}

export default function AnniversaryCard({ compact = false }: AnniversaryCardProps) {
  const { t, language } = useTranslation();
  const { onboarding } = useAuthStore();

  const anniversaryInfo = useMemo(() => {
    if (!onboarding.relationshipStartDate) return null;
    const startDate = new Date(onboarding.relationshipStartDate);
    const duration = calculateDuration(startDate);
    const nextAnniversary = getNextAnniversary(startDate);
    const milestones = getUpcomingMilestones(startDate, 1);
    const todayMilestone = isSpecialMilestone(startDate);
    return { startDate, duration, nextAnniversary, milestones, todayMilestone };
  }, [onboarding.relationshipStartDate]);

  const handleShare = async () => {
    if (!anniversaryInfo) return;

    const message = anniversaryInfo.nextAnniversary.isToday
      ? t('Today marks {{years}} years together! {{emoji}}', {
          years: anniversaryInfo.nextAnniversary.yearsCompleted,
          emoji: '💕🎉',
        })
      : t("We've been together for {{duration}} ({{days}} days)! {{emoji}}", {
          duration: formatDurationSimple(anniversaryInfo.duration),
          days: anniversaryInfo.duration.totalDays,
          emoji: '💕',
        });

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Don't render if no anniversary date is set
  if (!anniversaryInfo) {
    return null;
  }

  const { duration, nextAnniversary, milestones, todayMilestone } = anniversaryInfo;

  // Special celebration for anniversary day
  if (nextAnniversary.isToday) {
    return (
      <View style={[styles.card, styles.celebrationCard]}>
        <View style={styles.celebrationContent}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>
            {t('Happy Anniversary!')}
          </Text>
          <Text style={styles.celebrationYears}>
            {nextAnniversary.yearsCompleted} {t('years together')}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>{t('Share')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Special milestone today (100 days, 1000 days, etc.)
  if (todayMilestone.isMilestone) {
    return (
      <View style={[styles.card, styles.milestoneCard]}>
        <View style={styles.milestoneContent}>
          <Text style={styles.milestoneEmoji}>
            {todayMilestone.milestoneType === 'days' ? '🌟' : '💕'}
          </Text>
          <View style={styles.milestoneTextContainer}>
            <Text style={styles.milestoneTitle}>
              {todayMilestone.milestoneType === 'days'
                ? t('{{count}} days together!', { count: todayMilestone.milestoneValue ?? 0 })
                : t('{{count}} year milestone!', { count: todayMilestone.milestoneValue ?? 0 })}
            </Text>
            <Text style={styles.milestoneSubtitle}>
              {t('Congratulations on this special milestone!')}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.shareButtonSmall} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color="#FF6B9D" />
        </TouchableOpacity>
      </View>
    );
  }

  // Compact version for widget-like display
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={() => router.push('/(tabs)/settings')}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactEmoji}>💕</Text>
          <View style={styles.compactTextContainer}>
            <Text style={styles.compactDays}>
              {duration.totalDays} {t('days')}
            </Text>
            <Text style={styles.compactLabel}>{t('together')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Standard card
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon]}>
          <Text style={styles.cardIconEmoji}>💕</Text>
        </View>
        <Text style={styles.cardTitle}>{t('Together')}</Text>
        {nextAnniversary.isThisWeek && nextAnniversary.daysUntil > 0 && (
          <View style={styles.upcomingBadge}>
            <Ionicons name="gift" size={12} color="#8B5CF6" />
            <Text style={styles.upcomingBadgeText}>
              {nextAnniversary.daysUntil === 1
                ? t('Tomorrow!')
                : t('{{count}}d', { count: nextAnniversary.daysUntil })}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.durationContainer}>
        <View style={styles.durationMain}>
          <Text style={styles.durationValue}>{duration.totalDays}</Text>
          <Text style={styles.durationLabel}>{t('days')}</Text>
        </View>
        <View style={styles.durationDetails}>
          <Text style={styles.durationText}>
            {formatDurationSimple(duration)}
          </Text>
        </View>
      </View>

      {/* Upcoming milestone or anniversary */}
      {(nextAnniversary.isThisMonth || milestones.length > 0) && (
        <View style={styles.upcomingSection}>
          {nextAnniversary.daysUntil <= 30 && nextAnniversary.daysUntil > 0 ? (
            <View style={styles.upcomingItem}>
              <Ionicons name="calendar" size={16} color="#8B5CF6" />
              <Text style={styles.upcomingText}>
                {t('{{count}} year anniversary in {{days}} days', {
                  count: nextAnniversary.yearsCompleted,
                  days: nextAnniversary.daysUntil,
                })}
              </Text>
            </View>
          ) : milestones[0] && milestones[0].daysUntil <= 30 ? (
            <View style={styles.upcomingItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.upcomingText}>
                {t('{{milestone}} in {{days}} days', {
                  milestone: milestones[0].label,
                  days: milestones[0].daysUntil,
                })}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <TouchableOpacity style={styles.cardAction} onPress={handleShare}>
        <Text style={styles.cardActionText}>{t('Share')}</Text>
        <Ionicons name="share-outline" size={18} color="#FF6B9D" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  celebrationCard: {
    backgroundColor: '#FFF0F3',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  celebrationContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  celebrationYears: {
    fontSize: 16,
    color: '#6B7280',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 14,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  milestoneCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  milestoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneEmoji: {
    fontSize: 32,
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  milestoneSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  shareButtonSmall: {
    padding: 8,
  },
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactEmoji: {
    fontSize: 28,
  },
  compactTextContainer: {
    flex: 1,
  },
  compactDays: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  compactLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  cardIconEmoji: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  upcomingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  durationMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  durationValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  durationLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  durationDetails: {
    alignItems: 'flex-end',
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  upcomingSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upcomingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  cardActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
});
