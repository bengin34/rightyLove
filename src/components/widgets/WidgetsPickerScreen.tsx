/**
 * WidgetsPickerScreen
 *
 * Modal/screen that displays a vertically scrollable gallery
 * of widget cards. Users can preview and add widgets to their
 * home screen from here.
 *
 * Design:
 * - Deep purple/black gradient background
 * - Title "Widgets" top-left, close "X" top-right
 * - Vertical scrolling gallery of widget cards in a single column
 * - Responsive layout with proper safe area handling
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Optional: Use expo-linear-gradient if available for better visuals
let LinearGradient: any = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  // expo-linear-gradient not installed, will use fallback
}
import { router } from 'expo-router';
import { useTranslation } from '@/i18n';
import { widgetRegistry, WidgetDefinition } from './widgetRegistry';
import WidgetCardShell from './WidgetCardShell';
import { useWidgetAnalytics } from './useWidgetAnalytics';
import {
  DaysTogetherPreview,
  CountdownPreview,
  DistancePreview,
  NextDatePreview,
  AppreciationStreakPreview,
  MoodCheckinPreview,
  LoveNotePreview,
  MemorySpotlightPreview,
  NextMilestonePreview,
  PromptOfDayPreview,
  SharedGoalsPreview,
  QualityTimePreview,
} from './WidgetPreviews';

// Development flag to simulate Pro user (set to true for testing all widgets unlocked)
// Change this to false to test premium widget locking behavior
export const DEV_IS_PRO = __DEV__ ? true : false;

/**
 * Map widget kind to preview component
 */
function getPreviewComponent(widget: WidgetDefinition): React.ReactNode {
  const previewData = widget.previewDataBuilder();

  switch (widget.id) {
    case 'days_together':
      return <DaysTogetherPreview data={previewData} />;
    case 'countdown':
      return <CountdownPreview data={previewData} />;
    case 'distance':
      return <DistancePreview data={previewData} />;
    case 'next_date':
      return <NextDatePreview data={previewData} />;
    case 'appreciation_streak':
      return <AppreciationStreakPreview data={previewData} />;
    case 'mood_checkin':
      return <MoodCheckinPreview data={previewData} />;
    case 'love_note':
      return <LoveNotePreview data={previewData} />;
    case 'memory_spotlight':
      return <MemorySpotlightPreview data={previewData} />;
    case 'next_milestone':
      return <NextMilestonePreview data={previewData} />;
    case 'prompt_of_day':
      return <PromptOfDayPreview data={previewData} />;
    case 'shared_goals':
      return <SharedGoalsPreview data={previewData} />;
    case 'quality_time':
      return <QualityTimePreview data={previewData} />;
    default:
      return null;
  }
}

export default function WidgetsPickerScreen() {
  const { t } = useTranslation();
  const analytics = useWidgetAnalytics();

  // Track screen open
  useEffect(() => {
    analytics.trackPickerOpened();
    return () => {
      analytics.trackPickerClosed();
    };
  }, []);

  const handleClose = () => {
    router.back();
  };

  // Check if widget is locked (respects DEV_IS_PRO flag)
  const isWidgetLocked = (widget: WidgetDefinition): boolean => {
    if (DEV_IS_PRO) return false;
    return widget.premiumLocked;
  };

  const handleWidgetPress = (widget: WidgetDefinition) => {
    const locked = isWidgetLocked(widget);
    analytics.trackWidgetSelected(widget.id, locked);

    if (locked) {
      // Navigate to paywall or show unlock modal
      analytics.trackUnlockClicked(widget.id);
      Alert.alert(
        t('Premium Widget'),
        t('Upgrade to Premium to unlock this widget and many more features!'),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Upgrade'),
            onPress: () => {
              // TODO: Navigate to paywall screen
              // router.push('/paywall');
              console.log('Navigate to paywall');
            },
          },
        ]
      );
    } else {
      // Add widget
      analytics.trackWidgetAdded(widget.id);
      Alert.alert(
        t('Widget Added'),
        t('{{widget}} has been added to your home screen widget.', { widget: t(widget.titleKey) }),
        [{ text: t('OK'), onPress: handleClose }]
      );
      // TODO: Call actual widget add mechanism
      // widget.onAdd?.();
    }
  };

  // Background component with fallback
  const BackgroundGradient = LinearGradient ? (
    <LinearGradient
      colors={['#1A1625', '#0D0B12']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  ) : (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0D0B12' }]} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {BackgroundGradient}

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Widgets')}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#F5A9B8" />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('Choose a widget for your home screen')}
        </Text>

        {/* Widget Gallery - Vertical Scroll */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.galleryContent}
        >
          {widgetRegistry.map((widget) => (
            <View key={widget.id} style={styles.cardWrapper}>
              <WidgetCardShell
                isLocked={isWidgetLocked(widget)}
                onPress={() => handleWidgetPress(widget)}
              >
                {getPreviewComponent(widget)}
              </WidgetCardShell>
            </View>
          ))}
          {/* Bottom padding for safe scroll */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F5A9B8',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 169, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  galleryContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  cardWrapper: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
});
