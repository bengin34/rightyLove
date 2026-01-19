import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNextAnniversary } from '@/utils/anniversary';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface AnniversaryReminderConfig {
  oneMonthBefore: boolean;
  oneWeekBefore: boolean;
  oneDayBefore: boolean;
  onDay: boolean;
}

const DEFAULT_REMINDER_CONFIG: AnniversaryReminderConfig = {
  oneMonthBefore: true,
  oneWeekBefore: true,
  oneDayBefore: true,
  onDay: true,
};

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('anniversary', {
      name: 'Anniversary Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B9D',
    });
  }

  return true;
}

/**
 * Schedule anniversary reminders
 */
export async function scheduleAnniversaryReminders(
  startDate: Date,
  config: AnniversaryReminderConfig = DEFAULT_REMINDER_CONFIG
): Promise<string[]> {
  // Cancel existing anniversary reminders first
  await cancelAnniversaryReminders();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return [];

  const nextAnniversary = getNextAnniversary(startDate);
  const scheduledIds: string[] = [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Helper to schedule a notification
  const scheduleNotification = async (
    triggerDate: Date,
    title: string,
    body: string,
    identifier: string
  ): Promise<string | null> => {
    // Don't schedule if the date is in the past
    if (triggerDate <= now) return null;

    // Set notification time to 10:00 AM
    triggerDate.setHours(10, 0, 0, 0);

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'anniversary', identifier },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: Platform.OS === 'android' ? 'anniversary' : undefined,
        },
        identifier,
      });
      return id;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  };

  const yearsText =
    nextAnniversary.yearsCompleted === 1
      ? '1 year'
      : `${nextAnniversary.yearsCompleted} years`;

  // One month before
  if (config.oneMonthBefore) {
    const oneMonthBefore = new Date(nextAnniversary.date);
    oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);

    const id = await scheduleNotification(
      oneMonthBefore,
      'Anniversary Coming Up! 💕',
      `Your ${yearsText} anniversary is in one month. Time to start planning something special!`,
      'anniversary-1-month'
    );
    if (id) scheduledIds.push(id);
  }

  // One week before
  if (config.oneWeekBefore) {
    const oneWeekBefore = new Date(nextAnniversary.date);
    oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

    const id = await scheduleNotification(
      oneWeekBefore,
      'One Week to Go! 🎉',
      `Your ${yearsText} anniversary is in one week. Have you planned something special?`,
      'anniversary-1-week'
    );
    if (id) scheduledIds.push(id);
  }

  // One day before
  if (config.oneDayBefore) {
    const oneDayBefore = new Date(nextAnniversary.date);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);

    const id = await scheduleNotification(
      oneDayBefore,
      'Tomorrow is the Day! 💝',
      `Your ${yearsText} anniversary is tomorrow! Get ready to celebrate your love.`,
      'anniversary-1-day'
    );
    if (id) scheduledIds.push(id);
  }

  // On the anniversary day
  if (config.onDay) {
    const id = await scheduleNotification(
      new Date(nextAnniversary.date),
      'Happy Anniversary! 🎊💕',
      `Congratulations on ${yearsText} together! Celebrate this beautiful milestone.`,
      'anniversary-day'
    );
    if (id) scheduledIds.push(id);
  }

  console.log('Scheduled anniversary reminders:', scheduledIds);
  return scheduledIds;
}

/**
 * Cancel all anniversary reminders
 */
export async function cancelAnniversaryReminders(): Promise<void> {
  const identifiers = [
    'anniversary-1-month',
    'anniversary-1-week',
    'anniversary-1-day',
    'anniversary-day',
  ];

  for (const identifier of identifiers) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      // Notification might not exist, that's okay
    }
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Schedule daily reminder notification
 */
export async function scheduleDailyReminder(time: Date): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  // Cancel existing daily reminder
  try {
    await Notifications.cancelScheduledNotificationAsync('daily-reminder');
  } catch (error) {
    // Notification might not exist
  }

  const hours = time.getHours();
  const minutes = time.getMinutes();

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for Your Daily Connection 💕',
        body: "Today's question is waiting for you and your partner!",
        data: { type: 'daily-reminder' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
      identifier: 'daily-reminder',
    });
    return id;
  } catch (error) {
    console.error('Failed to schedule daily reminder:', error);
    return null;
  }
}

/**
 * Cancel daily reminder
 */
export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync('daily-reminder');
  } catch (error) {
    // Notification might not exist
  }
}

/**
 * Schedule a milestone notification
 */
export async function scheduleMilestoneReminder(
  milestoneDate: Date,
  milestoneLabel: string
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const now = new Date();
  if (milestoneDate <= now) return null;

  // Set notification time to 10:00 AM
  milestoneDate.setHours(10, 0, 0, 0);

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${milestoneLabel} Together! 🌟`,
        body: `Congratulations on reaching ${milestoneLabel} together! What a beautiful journey.`,
        data: { type: 'milestone', label: milestoneLabel },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: milestoneDate,
        channelId: Platform.OS === 'android' ? 'anniversary' : undefined,
      },
      identifier: `milestone-${milestoneLabel.replace(/\s+/g, '-')}`,
    });
    return id;
  } catch (error) {
    console.error('Failed to schedule milestone reminder:', error);
    return null;
  }
}
