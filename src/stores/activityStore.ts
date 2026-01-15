import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { DailyActivity, StreakData, WeeklyRecap, Mood } from '@/types';

interface ActivityStore {
  // State
  activities: DailyActivity[];
  streak: StreakData;

  // Actions
  logPhotoActivity: () => void;
  logMoodActivity: () => void;
  logBucketActivity: () => void;
  logQuestionSubmit: () => void;
  logQuestionUnlock: () => void;
  getTodayActivity: () => DailyActivity;
  calculateStreak: () => void;
  getWeeklyRecap: (moods: (Mood | null)[]) => WeeklyRecap;
}

const getTodayKey = () => new Date().toISOString().split('T')[0];

const getWeekDates = (): { start: string; end: string; dates: string[] } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
    dates,
  };
};

const createEmptyActivity = (dateKey: string): DailyActivity => ({
  dateKey,
  didPhoto: false,
  didMood: false,
  didBucket: false,
  didQuestionSubmit: false,
  didQuestionUnlock: false,
});

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      // Initial state
      activities: [],
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        activeDaysThisWeek: 0,
        coupleUnlockStreak: 0,
      },

      // Actions
      logPhotoActivity: () => {
        const dateKey = getTodayKey();
        set((state) => {
          const activities = [...state.activities];
          const index = activities.findIndex((a) => a.dateKey === dateKey);
          if (index >= 0) {
            activities[index] = { ...activities[index], didPhoto: true };
          } else {
            activities.unshift({ ...createEmptyActivity(dateKey), didPhoto: true });
          }
          return { activities };
        });
        get().calculateStreak();
      },

      logMoodActivity: () => {
        const dateKey = getTodayKey();
        set((state) => {
          const activities = [...state.activities];
          const index = activities.findIndex((a) => a.dateKey === dateKey);
          if (index >= 0) {
            activities[index] = { ...activities[index], didMood: true };
          } else {
            activities.unshift({ ...createEmptyActivity(dateKey), didMood: true });
          }
          return { activities };
        });
        get().calculateStreak();
      },

      logBucketActivity: () => {
        const dateKey = getTodayKey();
        set((state) => {
          const activities = [...state.activities];
          const index = activities.findIndex((a) => a.dateKey === dateKey);
          if (index >= 0) {
            activities[index] = { ...activities[index], didBucket: true };
          } else {
            activities.unshift({ ...createEmptyActivity(dateKey), didBucket: true });
          }
          return { activities };
        });
        get().calculateStreak();
      },

      logQuestionSubmit: () => {
        const dateKey = getTodayKey();
        set((state) => {
          const activities = [...state.activities];
          const index = activities.findIndex((a) => a.dateKey === dateKey);
          if (index >= 0) {
            activities[index] = { ...activities[index], didQuestionSubmit: true };
          } else {
            activities.unshift({ ...createEmptyActivity(dateKey), didQuestionSubmit: true });
          }
          return { activities };
        });
        get().calculateStreak();
      },

      logQuestionUnlock: () => {
        const dateKey = getTodayKey();
        set((state) => {
          const activities = [...state.activities];
          const index = activities.findIndex((a) => a.dateKey === dateKey);
          if (index >= 0) {
            activities[index] = { ...activities[index], didQuestionUnlock: true };
          } else {
            activities.unshift({ ...createEmptyActivity(dateKey), didQuestionUnlock: true });
          }
          return { activities };
        });
        get().calculateStreak();
      },

      getTodayActivity: () => {
        const dateKey = getTodayKey();
        const activity = get().activities.find((a) => a.dateKey === dateKey);
        return activity || createEmptyActivity(dateKey);
      },

      calculateStreak: () => {
        const activities = get().activities;
        const { dates: weekDates } = getWeekDates();

        // Check if a day is active (at least one action)
        const isActiveDay = (a: DailyActivity) =>
          a.didPhoto || a.didMood || a.didBucket || a.didQuestionSubmit;

        // Sort by date descending
        const sortedActivities = [...activities]
          .filter(isActiveDay)
          .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        const checkDate = new Date(today);

        while (true) {
          const dateKey = checkDate.toISOString().split('T')[0];
          const activity = sortedActivities.find((a) => a.dateKey === dateKey);
          if (activity) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        let lastDate: Date | null = null;

        for (const activity of sortedActivities) {
          const activityDate = new Date(activity.dateKey);
          if (lastDate === null) {
            tempStreak = 1;
          } else {
            const diffDays = Math.round(
              (lastDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays === 1) {
              tempStreak++;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
          lastDate = activityDate;
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

        // Calculate active days this week
        const activeDaysThisWeek = weekDates.filter((dateKey) =>
          sortedActivities.some((a) => a.dateKey === dateKey)
        ).length;

        // Calculate couple unlock streak
        const unlockActivities = activities
          .filter((a) => a.didQuestionUnlock)
          .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

        let coupleUnlockStreak = 0;
        const unlockCheckDate = new Date(today);

        while (true) {
          const dateKey = unlockCheckDate.toISOString().split('T')[0];
          const activity = unlockActivities.find((a) => a.dateKey === dateKey);
          if (activity) {
            coupleUnlockStreak++;
            unlockCheckDate.setDate(unlockCheckDate.getDate() - 1);
          } else {
            break;
          }
        }

        set({
          streak: {
            currentStreak,
            longestStreak,
            activeDaysThisWeek,
            coupleUnlockStreak,
          },
        });
      },

      getWeeklyRecap: (moods) => {
        const { start, end, dates } = getWeekDates();
        const activities = get().activities;

        let photosLiked = 0;
        let photosShared = 0;
        let questionsAnswered = 0;
        let questionsUnlocked = 0;
        let bucketItemsCompleted = 0;
        let activeDays = 0;

        for (const dateKey of dates) {
          const activity = activities.find((a) => a.dateKey === dateKey);
          if (activity) {
            if (activity.didPhoto) {
              photosLiked++;
              activeDays++;
            }
            if (activity.didQuestionSubmit) questionsAnswered++;
            if (activity.didQuestionUnlock) questionsUnlocked++;
            if (activity.didBucket) bucketItemsCompleted++;
          }
        }

        return {
          weekStartDate: start,
          weekEndDate: end,
          activeDays,
          photosLiked,
          photosShared, // Would need to track separately
          questionsAnswered,
          questionsUnlocked,
          bucketItemsCompleted,
          moods,
        };
      },
    }),
    {
      name: 'activity-storage',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateStreak();
        }
      },
    }
  )
);
