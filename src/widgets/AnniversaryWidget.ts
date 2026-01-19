/**
 * Anniversary Widget Module
 *
 * This module provides the data and utilities for the iOS/Android anniversary widget.
 * The widget displays how long a couple has been together.
 *
 * For iOS: Uses WidgetKit with a Timeline Provider
 * For Android: Uses AppWidget with a RemoteViews-based implementation
 */

import { calculateDuration, formatDurationSimple, getNextAnniversary } from '@/utils/anniversary';

export interface WidgetData {
  totalDays: number;
  durationText: string;
  nextAnniversaryDays: number;
  nextAnniversaryYears: number;
  isAnniversaryToday: boolean;
  hasDate: boolean;
  lastUpdated: string;
}

/**
 * Generate widget data from a relationship start date
 */
export function generateWidgetData(startDate: Date | null): WidgetData {
  if (!startDate) {
    return {
      totalDays: 0,
      durationText: '',
      nextAnniversaryDays: 0,
      nextAnniversaryYears: 0,
      isAnniversaryToday: false,
      hasDate: false,
      lastUpdated: new Date().toISOString(),
    };
  }

  const duration = calculateDuration(startDate);
  const nextAnniversary = getNextAnniversary(startDate);

  return {
    totalDays: duration.totalDays,
    durationText: formatDurationSimple(duration),
    nextAnniversaryDays: nextAnniversary.daysUntil,
    nextAnniversaryYears: nextAnniversary.yearsCompleted,
    isAnniversaryToday: nextAnniversary.isToday,
    hasDate: true,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Widget configuration for different sizes
 */
export const WidgetConfig = {
  // iOS widget families
  ios: {
    systemSmall: {
      showDays: true,
      showDuration: false,
      showNextAnniversary: false,
    },
    systemMedium: {
      showDays: true,
      showDuration: true,
      showNextAnniversary: true,
    },
    systemLarge: {
      showDays: true,
      showDuration: true,
      showNextAnniversary: true,
      showMilestones: true,
    },
    accessoryCircular: {
      showDays: true,
      showDuration: false,
      showNextAnniversary: false,
    },
    accessoryRectangular: {
      showDays: true,
      showDuration: true,
      showNextAnniversary: false,
    },
  },
  // Android widget sizes (in dp)
  android: {
    small: {
      minWidth: 110,
      minHeight: 40,
      showDays: true,
      showDuration: false,
    },
    medium: {
      minWidth: 250,
      minHeight: 40,
      showDays: true,
      showDuration: true,
    },
    large: {
      minWidth: 250,
      minHeight: 110,
      showDays: true,
      showDuration: true,
      showNextAnniversary: true,
    },
  },
};

/**
 * Widget refresh intervals (in minutes)
 */
export const WidgetRefreshIntervals = {
  // Refresh once per hour normally
  normal: 60,
  // Refresh more frequently when anniversary is approaching
  nearAnniversary: 15,
  // Refresh on anniversary day
  anniversaryDay: 5,
};

/**
 * Get the appropriate refresh interval based on anniversary proximity
 */
export function getRefreshInterval(startDate: Date | null): number {
  if (!startDate) return WidgetRefreshIntervals.normal;

  const nextAnniversary = getNextAnniversary(startDate);

  if (nextAnniversary.isToday) {
    return WidgetRefreshIntervals.anniversaryDay;
  }

  if (nextAnniversary.daysUntil <= 7) {
    return WidgetRefreshIntervals.nearAnniversary;
  }

  return WidgetRefreshIntervals.normal;
}
