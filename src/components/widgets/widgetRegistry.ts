/**
 * Widget Registry
 *
 * Data-driven registry of all available widget templates.
 * Adding a new widget is as simple as adding a new entry to the registry.
 */

import { ReactNode } from 'react';

export type WidgetKind =
  | 'days_together'
  | 'countdown'
  | 'distance'
  | 'next_date'
  | 'appreciation_streak'
  | 'mood_checkin'
  | 'love_note'
  | 'memory_spotlight'
  | 'next_milestone'
  | 'prompt_of_day'
  | 'shared_goals'
  | 'quality_time';

export interface WidgetPreviewData {
  // Days Together
  totalDays?: number;
  anniversaryDate?: Date;

  // Countdown
  countdownLabel?: string;
  countdownTargetDate?: Date;

  // Distance
  distanceKm?: number;
  userInitial?: string;
  partnerInitial?: string;
  lastUpdated?: Date;

  // Next Date
  nextDateTitle?: string;
  nextDateTime?: Date;
  nextDateLocation?: string;

  // Appreciation Streak
  appreciationStreakDays?: number;
  lastMessageTime?: Date;

  // Mood Check-in
  userMood?: string;
  partnerMood?: string;

  // Love Note
  loveNoteText?: string;
  loveNoteFrom?: string;

  // Memory Spotlight
  memoryImageUrl?: string;
  memoryTitle?: string;
  memoryDate?: Date;

  // Next Milestone
  milestoneName?: string;
  milestoneDaysUntil?: number;
  milestoneTotalDays?: number;

  // Prompt of Day
  promptText?: string;

  // Shared Goals
  goalTitle?: string;
  goalProgress?: number;
  goalCurrentValue?: number;
  goalTargetValue?: number;

  // Quality Time
  qualityTimeThisWeek?: number;
  qualityTimeLastWeek?: number;
}

export interface WidgetDefinition {
  id: WidgetKind;
  titleKey: string; // i18n key
  subtitleKey?: string; // i18n key for description
  premiumLocked: boolean;
  previewDataBuilder: () => WidgetPreviewData;
  onAdd?: () => void;
}

/**
 * Default mock data builders for widget previews
 */
const mockPreviewDataBuilders: Record<WidgetKind, () => WidgetPreviewData> = {
  days_together: () => ({
    totalDays: 547,
    anniversaryDate: new Date(2023, 5, 15),
  }),

  countdown: () => ({
    countdownLabel: 'Until I see you',
    countdownTargetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  }),

  distance: () => ({
    distanceKm: 847,
    userInitial: 'E',
    partnerInitial: 'A',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
  }),

  next_date: () => ({
    nextDateTitle: 'Dinner date',
    nextDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    nextDateLocation: 'The Italian Place',
  }),

  appreciation_streak: () => ({
    appreciationStreakDays: 12,
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  }),

  mood_checkin: () => ({
    userMood: 'happy',
    partnerMood: 'calm',
  }),

  love_note: () => ({
    loveNoteText: "You make every day brighter",
    loveNoteFrom: 'E',
  }),

  memory_spotlight: () => ({
    memoryTitle: 'Beach sunset',
    memoryDate: new Date(2023, 7, 20),
    memoryImageUrl: undefined, // Will use placeholder
  }),

  next_milestone: () => ({
    milestoneName: '600 days',
    milestoneDaysUntil: 53,
    milestoneTotalDays: 600,
  }),

  prompt_of_day: () => ({
    promptText: "What's one thing you appreciate about us?",
  }),

  shared_goals: () => ({
    goalTitle: 'Trip to Rome',
    goalProgress: 0.35,
    goalCurrentValue: 350,
    goalTargetValue: 1000,
  }),

  quality_time: () => ({
    qualityTimeThisWeek: 260, // minutes
    qualityTimeLastWeek: 180,
  }),
};

/**
 * Widget Registry - all available widgets
 */
export const widgetRegistry: WidgetDefinition[] = [
  {
    id: 'days_together',
    titleKey: 'Days Together',
    subtitleKey: 'Track your journey together',
    premiumLocked: false,
    previewDataBuilder: mockPreviewDataBuilders.days_together,
  },
  {
    id: 'countdown',
    titleKey: 'Countdown',
    subtitleKey: 'Count down to your next moment',
    premiumLocked: false,
    previewDataBuilder: mockPreviewDataBuilders.countdown,
  },
  {
    id: 'distance',
    titleKey: 'Distance',
    subtitleKey: 'See how far apart you are',
    premiumLocked: true,
    previewDataBuilder: mockPreviewDataBuilders.distance,
  },
  {
    id: 'next_date',
    titleKey: 'Next Date',
    subtitleKey: 'Your upcoming plans',
    premiumLocked: false,
    previewDataBuilder: mockPreviewDataBuilders.next_date,
  },
  {
    id: 'appreciation_streak',
    titleKey: 'Appreciation Streak',
    subtitleKey: 'Keep the love flowing',
    premiumLocked: false,
    previewDataBuilder: mockPreviewDataBuilders.appreciation_streak,
  },
  {
    id: 'mood_checkin',
    titleKey: 'Mood Check-in',
    subtitleKey: "See how you're both feeling",
    premiumLocked: false,
    previewDataBuilder: mockPreviewDataBuilders.mood_checkin,
  },
  {
    id: 'love_note',
    titleKey: 'Love Note',
    subtitleKey: 'A sweet message for your day',
    premiumLocked: false,
    previewDataBuilder: mockPreviewDataBuilders.love_note,
  },
  {
    id: 'memory_spotlight',
    titleKey: 'Memory Spotlight',
    subtitleKey: 'Relive special moments',
    premiumLocked: true,
    previewDataBuilder: mockPreviewDataBuilders.memory_spotlight,
  },
  {
    id: 'next_milestone',
    titleKey: 'Next Milestone',
    subtitleKey: 'Celebrate your journey',
    premiumLocked: false,
    previewDataBuilder: mockPreviewDataBuilders.next_milestone,
  },
  {
    id: 'prompt_of_day',
    titleKey: 'Prompt of the Day',
    subtitleKey: 'Daily conversation starter',
    premiumLocked: false,
    previewDataBuilder: mockPreviewDataBuilders.prompt_of_day,
  },
  {
    id: 'shared_goals',
    titleKey: 'Shared Goals',
    subtitleKey: 'Track progress together',
    premiumLocked: true,
    previewDataBuilder: mockPreviewDataBuilders.shared_goals,
  },
  {
    id: 'quality_time',
    titleKey: 'Quality Time',
    subtitleKey: 'Time spent together',
    premiumLocked: true,
    previewDataBuilder: mockPreviewDataBuilders.quality_time,
  },
];

/**
 * Get a widget definition by ID
 */
export function getWidgetById(id: WidgetKind): WidgetDefinition | undefined {
  return widgetRegistry.find((w) => w.id === id);
}

/**
 * Get all unlocked widgets
 */
export function getUnlockedWidgets(): WidgetDefinition[] {
  return widgetRegistry.filter((w) => !w.premiumLocked);
}

/**
 * Get all premium widgets
 */
export function getPremiumWidgets(): WidgetDefinition[] {
  return widgetRegistry.filter((w) => w.premiumLocked);
}
