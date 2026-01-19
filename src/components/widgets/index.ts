/**
 * Widget Components Index
 *
 * Export all widget-related components and utilities
 */

// Registry & Types
export {
  widgetRegistry,
  getWidgetById,
  getUnlockedWidgets,
  getPremiumWidgets,
  type WidgetKind,
  type WidgetDefinition,
  type WidgetPreviewData,
} from './widgetRegistry';

// Components
export { default as WidgetCardShell, WIDGET_CARD_WIDTH, WIDGET_CARD_HEIGHT } from './WidgetCardShell';
export { default as WidgetsPickerScreen } from './WidgetsPickerScreen';

// Preview Components
export {
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

// Analytics
export { useWidgetAnalytics } from './useWidgetAnalytics';
