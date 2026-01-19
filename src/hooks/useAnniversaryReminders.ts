import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { scheduleAnniversaryReminders, cancelAnniversaryReminders } from '@/services/notifications';
import { updateWidgetData } from '@/services/widgetBridge';

/**
 * Hook to automatically schedule anniversary reminders and update widgets
 * when the relationship start date changes
 */
export function useAnniversaryReminders() {
  const relationshipStartDate = useAuthStore((state) => state.onboarding.relationshipStartDate);

  useEffect(() => {
    if (relationshipStartDate) {
      const startDate = new Date(relationshipStartDate);

      // Schedule anniversary reminders
      scheduleAnniversaryReminders(startDate).catch((error) => {
        console.error('Failed to schedule anniversary reminders:', error);
      });

      // Update widget data
      updateWidgetData(startDate).catch((error) => {
        console.error('Failed to update widget data:', error);
      });
    } else {
      // Cancel reminders if date is removed
      cancelAnniversaryReminders().catch((error) => {
        console.error('Failed to cancel anniversary reminders:', error);
      });

      // Clear widget data
      updateWidgetData(null).catch((error) => {
        console.error('Failed to clear widget data:', error);
      });
    }
  }, [relationshipStartDate]);
}
