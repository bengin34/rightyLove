/**
 * Widget Preview Components
 *
 * Each widget type has its own preview component that renders
 * inside the WidgetCardShell. These show mock or real data
 * to give users a preview of what the widget will look like.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetPreviewData } from './widgetRegistry';

// Optional: Use expo-linear-gradient if available for better visuals
let LinearGradient: any = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  // expo-linear-gradient not installed, will use fallback
}

// ============================================
// Common Styles & Colors
// ============================================

const COLORS = {
  coral: '#F5A9B8',
  coralLight: 'rgba(245, 169, 184, 0.6)',
  coralDim: 'rgba(245, 169, 184, 0.3)',
  white: '#FFFFFF',
  whiteDim: 'rgba(255, 255, 255, 0.7)',
  whiteFaint: 'rgba(255, 255, 255, 0.4)',
  heart: '#FF6B9D',
  gold: '#FFD700',
  green: '#4ADE80',
};

// ============================================
// 1. Days Together Widget
// ============================================

interface DaysTogetherPreviewProps {
  data: WidgetPreviewData;
}

export function DaysTogetherPreview({ data }: DaysTogetherPreviewProps) {
  const days = data.totalDays ?? 0;

  return (
    <View style={styles.centered}>
      <Text style={styles.bigNumber}>{days}</Text>
      <Text style={styles.label}>days</Text>
      <View style={styles.heartRow}>
        <Ionicons name="heart" size={16} color={COLORS.heart} />
      </View>
    </View>
  );
}

// ============================================
// 2. Countdown Widget
// ============================================

interface CountdownPreviewProps {
  data: WidgetPreviewData;
}

export function CountdownPreview({ data }: CountdownPreviewProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = data.countdownTargetDate ?? new Date();

    const updateCountdown = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, mins, secs });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data.countdownTargetDate]);

  const formatNum = (n: number) => n.toString().padStart(2, '0');

  return (
    <View style={styles.centered}>
      <Text style={styles.labelSmall}>{data.countdownLabel ?? 'Until I see you'}</Text>
      <Ionicons name="heart" size={14} color={COLORS.heart} style={{ marginVertical: 4 }} />
      <View style={styles.countdownRow}>
        <View style={styles.countdownUnit}>
          <Text style={styles.countdownNumber}>{formatNum(timeLeft.days)}</Text>
          <Text style={styles.countdownLabel}>days</Text>
        </View>
        <Text style={styles.countdownSeparator}>:</Text>
        <View style={styles.countdownUnit}>
          <Text style={styles.countdownNumber}>{formatNum(timeLeft.hours)}</Text>
          <Text style={styles.countdownLabel}>hrs</Text>
        </View>
        <Text style={styles.countdownSeparator}>:</Text>
        <View style={styles.countdownUnit}>
          <Text style={styles.countdownNumber}>{formatNum(timeLeft.mins)}</Text>
          <Text style={styles.countdownLabel}>min</Text>
        </View>
        <Text style={styles.countdownSeparator}>:</Text>
        <View style={styles.countdownUnit}>
          <Text style={styles.countdownNumber}>{formatNum(timeLeft.secs)}</Text>
          <Text style={styles.countdownLabel}>sec</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================
// 3. Distance Widget
// ============================================

interface DistancePreviewProps {
  data: WidgetPreviewData;
}

export function DistancePreview({ data }: DistancePreviewProps) {
  const distance = data.distanceKm ?? 0;
  const userInitial = data.userInitial ?? 'Y';
  const partnerInitial = data.partnerInitial ?? 'P';

  return (
    <View style={styles.centered}>
      <Text style={styles.labelSmall}>Our distance</Text>
      <View style={styles.distanceRow}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{userInitial}</Text>
        </View>
        <View style={styles.distanceHeartContainer}>
          <View style={styles.distanceLine} />
          <Ionicons name="heart" size={20} color={COLORS.heart} />
          <View style={styles.distanceLine} />
        </View>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{partnerInitial}</Text>
        </View>
      </View>
      <Text style={styles.distanceValue}>{distance} km</Text>
      <Text style={styles.labelFaint}>Updated 30m ago</Text>
    </View>
  );
}

// ============================================
// 4. Next Date Widget
// ============================================

interface NextDatePreviewProps {
  data: WidgetPreviewData;
}

export function NextDatePreview({ data }: NextDatePreviewProps) {
  const title = data.nextDateTitle ?? 'Next date';
  const location = data.nextDateLocation ?? '';
  const dateTime = data.nextDateTime ?? new Date();

  const formatDate = (d: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  };

  const formatTime = (d: Date) => {
    const hours = d.getHours();
    const mins = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <View style={styles.centered}>
      <Text style={styles.labelSmall}>Next date</Text>
      <Text style={styles.dateTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.dateInfoRow}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.coralLight} />
        <Text style={styles.dateInfoText}>{formatDate(dateTime)}</Text>
      </View>
      <View style={styles.dateInfoRow}>
        <Ionicons name="time-outline" size={14} color={COLORS.coralLight} />
        <Text style={styles.dateInfoText}>{formatTime(dateTime)}</Text>
      </View>
      {location ? (
        <View style={styles.dateInfoRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.coralLight} />
          <Text style={styles.dateInfoText} numberOfLines={1}>{location}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ============================================
// 5. Appreciation Streak Widget
// ============================================

interface AppreciationStreakPreviewProps {
  data: WidgetPreviewData;
}

export function AppreciationStreakPreview({ data }: AppreciationStreakPreviewProps) {
  const streakDays = data.appreciationStreakDays ?? 0;

  return (
    <View style={styles.centered}>
      <Text style={styles.labelSmall}>Appreciation streak</Text>
      <View style={styles.streakRow}>
        <Ionicons name="flame" size={32} color={COLORS.gold} />
        <Text style={styles.streakNumber}>{streakDays}</Text>
      </View>
      <Text style={styles.label}>days</Text>
      <Text style={styles.labelFaint}>Keep it going!</Text>
    </View>
  );
}

// ============================================
// 6. Mood Check-in Widget
// ============================================

interface MoodCheckinPreviewProps {
  data: WidgetPreviewData;
}

const MOOD_EMOJIS: Record<string, string> = {
  happy: 'happy-outline',
  calm: 'leaf-outline',
  sad: 'sad-outline',
  tired: 'moon-outline',
  excited: 'sparkles-outline',
};

export function MoodCheckinPreview({ data }: MoodCheckinPreviewProps) {
  const userMood = data.userMood ?? 'happy';
  const partnerMood = data.partnerMood ?? 'calm';

  return (
    <View style={styles.centered}>
      <Text style={styles.labelSmall}>Today's vibe</Text>
      <View style={styles.moodRow}>
        <View style={styles.moodChip}>
          <Text style={styles.moodChipLabel}>You</Text>
          <View style={styles.moodChipIcon}>
            <Ionicons
              name={(MOOD_EMOJIS[userMood] || 'happy-outline') as any}
              size={20}
              color={COLORS.coral}
            />
          </View>
        </View>
        <View style={styles.moodChip}>
          <Text style={styles.moodChipLabel}>Partner</Text>
          <View style={styles.moodChipIcon}>
            <Ionicons
              name={(MOOD_EMOJIS[partnerMood] || 'happy-outline') as any}
              size={20}
              color={COLORS.coral}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================
// 7. Love Note Widget
// ============================================

interface LoveNotePreviewProps {
  data: WidgetPreviewData;
}

export function LoveNotePreview({ data }: LoveNotePreviewProps) {
  const noteText = data.loveNoteText ?? "You make my heart smile";
  const from = data.loveNoteFrom ?? 'E';

  return (
    <View style={styles.centered}>
      <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.coralDim} />
      <Text style={styles.loveNoteText} numberOfLines={2}>
        "{noteText}"
      </Text>
      <View style={styles.loveNoteFrom}>
        <Ionicons name="heart" size={12} color={COLORS.heart} />
        <Text style={styles.loveNoteFromText}>From {from}</Text>
      </View>
    </View>
  );
}

// ============================================
// 8. Memory Spotlight Widget
// ============================================

interface MemorySpotlightPreviewProps {
  data: WidgetPreviewData;
}

export function MemorySpotlightPreview({ data }: MemorySpotlightPreviewProps) {
  const title = data.memoryTitle ?? 'A special moment';
  const hasImage = !!data.memoryImageUrl;

  // Render the memory placeholder with gradient or fallback
  const renderPlaceholder = (showIcon: boolean) => {
    if (LinearGradient) {
      return (
        <LinearGradient
          colors={['#FF6B9D', '#8B5CF6']}
          style={styles.memoryPlaceholder}
        >
          {showIcon && (
            <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.5)" />
          )}
        </LinearGradient>
      );
    }
    // Fallback without gradient
    return (
      <View style={[styles.memoryPlaceholder, { backgroundColor: '#9B6BC4' }]}>
        {showIcon && (
          <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.5)" />
        )}
      </View>
    );
  };

  return (
    <View style={styles.centered}>
      <Text style={styles.labelSmall}>Memory spotlight</Text>
      <View style={styles.memoryImageContainer}>
        {hasImage ? renderPlaceholder(false) : renderPlaceholder(true)}
      </View>
      <Text style={styles.memoryTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.labelFaint}>1 year ago today</Text>
    </View>
  );
}

// ============================================
// 9. Next Milestone Widget
// ============================================

interface NextMilestonePreviewProps {
  data: WidgetPreviewData;
}

export function NextMilestonePreview({ data }: NextMilestonePreviewProps) {
  const milestoneName = data.milestoneName ?? '100 days';
  const daysUntil = data.milestoneDaysUntil ?? 0;

  return (
    <View style={styles.centered}>
      <Text style={styles.labelSmall}>Next milestone</Text>
      <Ionicons name="trophy" size={28} color={COLORS.gold} style={{ marginVertical: 8 }} />
      <Text style={styles.milestoneTitle}>{milestoneName}</Text>
      <View style={styles.milestoneCountdown}>
        <Text style={styles.milestoneDays}>{daysUntil}</Text>
        <Text style={styles.label}> days to go</Text>
      </View>
    </View>
  );
}

// ============================================
// 10. Prompt of the Day Widget
// ============================================

interface PromptOfDayPreviewProps {
  data: WidgetPreviewData;
}

export function PromptOfDayPreview({ data }: PromptOfDayPreviewProps) {
  const promptText = data.promptText ?? "What made you smile today?";

  return (
    <View style={styles.centered}>
      <View style={styles.promptIcon}>
        <Ionicons name="help-circle" size={28} color={COLORS.coral} />
      </View>
      <Text style={styles.labelSmall}>Prompt of the day</Text>
      <Text style={styles.promptText} numberOfLines={2}>
        {promptText}
      </Text>
    </View>
  );
}

// ============================================
// 11. Shared Goals Widget
// ============================================

interface SharedGoalsPreviewProps {
  data: WidgetPreviewData;
}

export function SharedGoalsPreview({ data }: SharedGoalsPreviewProps) {
  const title = data.goalTitle ?? 'Our goal';
  const progress = data.goalProgress ?? 0;
  const current = data.goalCurrentValue ?? 0;
  const target = data.goalTargetValue ?? 100;

  const progressPercent = Math.round(progress * 100);

  return (
    <View style={styles.centered}>
      <Text style={styles.labelSmall}>Shared goal</Text>
      <Text style={styles.goalTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{progressPercent}%</Text>
      </View>
      <Text style={styles.labelFaint}>
        ${current} / ${target}
      </Text>
    </View>
  );
}

// ============================================
// 12. Quality Time Widget
// ============================================

interface QualityTimePreviewProps {
  data: WidgetPreviewData;
}

export function QualityTimePreview({ data }: QualityTimePreviewProps) {
  const thisWeek = data.qualityTimeThisWeek ?? 0;
  const lastWeek = data.qualityTimeLastWeek ?? 0;

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const diff = thisWeek - lastWeek;
  const isUp = diff >= 0;

  return (
    <View style={styles.centered}>
      <Text style={styles.labelSmall}>Quality time this week</Text>
      <Text style={styles.qualityTimeValue}>{formatTime(thisWeek)}</Text>
      <View style={styles.qualityTimeCompare}>
        <Ionicons
          name={isUp ? 'arrow-up' : 'arrow-down'}
          size={14}
          color={isUp ? COLORS.green : '#FF6B6B'}
        />
        <Text style={[styles.qualityTimeCompareText, { color: isUp ? COLORS.green : '#FF6B6B' }]}>
          {Math.abs(diff)}m vs last week
        </Text>
      </View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  // Big number style (Days Together)
  bigNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: COLORS.coral,
    letterSpacing: -2,
    lineHeight: 70,
  },

  // Labels
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.whiteDim,
    marginTop: 2,
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.whiteFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  labelFaint: {
    fontSize: 12,
    color: COLORS.whiteFaint,
    marginTop: 6,
  },

  heartRow: {
    marginTop: 8,
  },

  // Countdown
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  countdownUnit: {
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.coral,
  },
  countdownLabel: {
    fontSize: 10,
    color: COLORS.whiteFaint,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  countdownSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.coralDim,
    marginHorizontal: 6,
  },

  // Distance
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 169, 184, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.coral,
  },
  distanceHeartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  distanceLine: {
    width: 20,
    height: 2,
    backgroundColor: COLORS.coralDim,
  },
  distanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.coral,
  },

  // Next Date
  dateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
  },
  dateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  dateInfoText: {
    fontSize: 14,
    color: COLORS.whiteDim,
    marginLeft: 6,
  },

  // Streak
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.coral,
    marginLeft: 8,
  },

  // Mood
  moodRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  moodChip: {
    alignItems: 'center',
  },
  moodChipLabel: {
    fontSize: 12,
    color: COLORS.whiteFaint,
    marginBottom: 6,
  },
  moodChipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 169, 184, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Love Note
  loveNoteText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 12,
    paddingHorizontal: 8,
    lineHeight: 22,
  },
  loveNoteFrom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loveNoteFromText: {
    fontSize: 13,
    color: COLORS.whiteFaint,
    marginLeft: 4,
  },

  // Memory
  memoryImageContainer: {
    marginVertical: 12,
  },
  memoryPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: 4,
  },

  // Milestone
  milestoneTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  milestoneCountdown: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  milestoneDays: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.coral,
  },

  // Prompt
  promptIcon: {
    marginBottom: 8,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    lineHeight: 22,
  },

  // Goals
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(245, 169, 184, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.coral,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.coral,
    marginLeft: 8,
  },

  // Quality Time
  qualityTimeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.coral,
    marginVertical: 8,
  },
  qualityTimeCompare: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityTimeCompareText: {
    fontSize: 13,
    marginLeft: 4,
  },
});
