import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { useMoodStore } from '@/stores/moodStore';
import { useActivityStore } from '@/stores/activityStore';
import { shareMoodViaWhatsApp } from '@/services/sharing';
import type { Mood } from '@/types';
import { useTranslation } from '@/i18n';

const MOODS: { emoji: Mood; labelKey: string; color: string }[] = [
  { emoji: '🙂', labelKey: 'Good', color: '#10B981' },
  { emoji: '😐', labelKey: 'Okay', color: '#F59E0B' },
  { emoji: '😞', labelKey: 'Down', color: '#6B7280' },
  { emoji: '😠', labelKey: 'Frustrated', color: '#EF4444' },
  { emoji: '😴', labelKey: 'Tired', color: '#8B5CF6' },
];

interface MoodCheckInProps {
  visible: boolean;
  onClose: () => void;
}

export default function MoodCheckIn({ visible, onClose }: MoodCheckInProps) {
  const { t, tError } = useTranslation();
  const todayMood = useMoodStore((state) => state.todayMood);
  const setMood = useMoodStore((state) => state.setMood);
  const logMoodActivity = useActivityStore((state) => state.logMoodActivity);

  const [selectedMood, setSelectedMood] = useState<Mood | null>(todayMood);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const scale = useSharedValue(1);

  const handleMoodSelect = useCallback(
    (mood: Mood) => {
      setSelectedMood(mood);

      // Animate selection
      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );

      // Save mood
      setMood(mood);
      logMoodActivity();

      // Show confirmation
      setShowConfirmation(true);
    },
    [setMood, logMoodActivity, scale]
  );

  const handleShare = useCallback(async () => {
    if (!selectedMood) return;

    const result = await shareMoodViaWhatsApp(selectedMood);

    if (!result.success) {
      Alert.alert(t('Error'), tError(result.error));
    }

    setShowConfirmation(false);
    onClose();
  }, [selectedMood, onClose, t, tError]);

  const handleDone = useCallback(() => {
    setShowConfirmation(false);
    onClose();
  }, [onClose]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {!showConfirmation ? (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{t('How are you today?')}</Text>
                <Text style={styles.subtitle}>
                  {t('Check in with your mood — it takes 1 second')}
                </Text>
              </View>

              {/* Mood options */}
              <View style={styles.moodsContainer}>
                {MOODS.map((mood) => (
                  <TouchableOpacity
                    key={mood.emoji}
                    style={[
                      styles.moodButton,
                      selectedMood === mood.emoji && styles.moodButtonSelected,
                      selectedMood === mood.emoji && { borderColor: mood.color },
                    ]}
                    onPress={() => handleMoodSelect(mood.emoji)}
                    activeOpacity={0.7}
                  >
                    <Animated.Text
                      style={[
                        styles.moodEmoji,
                        selectedMood === mood.emoji && animatedStyle,
                      ]}
                    >
                      {mood.emoji}
                    </Animated.Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        selectedMood === mood.emoji && { color: mood.color },
                      ]}
                    >
                      {t(mood.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Already selected indicator */}
              {todayMood && (
                <View style={styles.alreadySelected}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.alreadySelectedText}>
                    {t('You checked in today')}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              {/* Confirmation */}
              <View style={styles.confirmationContainer}>
                <View style={styles.confirmationIcon}>
                  <Text style={styles.confirmationEmoji}>{selectedMood}</Text>
                </View>
                <Text style={styles.confirmationTitle}>{t('Mood recorded!')}</Text>
                <Text style={styles.confirmationText}>
                  {t("Want to let your partner know how you're feeling?")}
                </Text>

                <View style={styles.confirmationButtons}>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                    <Text style={styles.shareButtonText}>{t('Share via WhatsApp')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                    <Text style={styles.doneButtonText}>{t('Done')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Small mood display for home screen card
export function MoodDisplay() {
  const { t } = useTranslation();
  const todayMood = useMoodStore((state) => state.todayMood);

  if (!todayMood) {
    return (
      <View style={displayStyles.container}>
        <View style={displayStyles.emptyIcon}>
          <Ionicons name="happy-outline" size={24} color="#9CA3AF" />
        </View>
        <Text style={displayStyles.emptyText}>{t('Tap to check in')}</Text>
      </View>
    );
  }

  const moodData = MOODS.find((m) => m.emoji === todayMood);

  return (
    <View style={displayStyles.container}>
      <Text style={displayStyles.emoji}>{todayMood}</Text>
      <Text style={[displayStyles.label, { color: moodData?.color }]}>
        {moodData ? t(moodData.labelKey) : ''}
      </Text>
      <View style={displayStyles.checkBadge}>
        <Ionicons name="checkmark" size={12} color="#10B981" />
      </View>
    </View>
  );
}

// Week mood view for recap
export function WeekMoodView() {
  const { t } = useTranslation();
  const getWeekMoods = useMoodStore((state) => state.getWeekMoods);
  const weekMoods = getWeekMoods();
  const days = [t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat'), t('Sun')];

  return (
    <View style={weekStyles.container}>
      {days.map((day, index) => (
        <View key={index} style={weekStyles.dayContainer}>
          <Text style={weekStyles.dayLabel}>{day}</Text>
          <View style={weekStyles.moodCircle}>
            {weekMoods[index] ? (
              <Text style={weekStyles.moodEmoji}>{weekMoods[index]}</Text>
            ) : (
              <View style={weekStyles.emptyCircle} />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 64,
  },
  moodButtonSelected: {
    backgroundColor: '#F9FAFB',
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  alreadySelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 16,
  },
  alreadySelectedText: {
    fontSize: 14,
    color: '#10B981',
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  confirmationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationEmoji: {
    fontSize: 48,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationButtons: {
    width: '100%',
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

const displayStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyIcon: {
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const weekStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  moodCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 24,
  },
  emptyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
});
