/**
 * Widget Analytics Hooks
 *
 * Tracks user interactions with the widgets picker.
 * Currently logs to console; can be connected to your analytics service.
 */

import { useCallback } from 'react';
import { WidgetKind } from './widgetRegistry';

type WidgetEvent =
  | 'widget_picker_opened'
  | 'widget_picker_closed'
  | 'widget_selected'
  | 'widget_added'
  | 'widget_unlock_clicked';

interface WidgetEventData {
  widgetId?: WidgetKind;
  isLocked?: boolean;
  timestamp?: string;
}

/**
 * Log an analytics event
 * Replace with your actual analytics implementation
 */
function logEvent(event: WidgetEvent, data?: WidgetEventData) {
  const eventData = {
    event,
    ...data,
    timestamp: data?.timestamp ?? new Date().toISOString(),
  };

  // Console log for development
  if (__DEV__) {
    console.log('[Widget Analytics]', eventData);
  }

  // TODO: Connect to your analytics service
  // Example: analytics.track(event, eventData);
  // Example: Firebase.analytics().logEvent(event, eventData);
}

/**
 * Hook for widget picker analytics
 */
export function useWidgetAnalytics() {
  const trackPickerOpened = useCallback(() => {
    logEvent('widget_picker_opened');
  }, []);

  const trackPickerClosed = useCallback(() => {
    logEvent('widget_picker_closed');
  }, []);

  const trackWidgetSelected = useCallback((widgetId: WidgetKind, isLocked: boolean) => {
    logEvent('widget_selected', { widgetId, isLocked });
  }, []);

  const trackWidgetAdded = useCallback((widgetId: WidgetKind) => {
    logEvent('widget_added', { widgetId });
  }, []);

  const trackUnlockClicked = useCallback((widgetId: WidgetKind) => {
    logEvent('widget_unlock_clicked', { widgetId });
  }, []);

  return {
    trackPickerOpened,
    trackPickerClosed,
    trackWidgetSelected,
    trackWidgetAdded,
    trackUnlockClicked,
  };
}
