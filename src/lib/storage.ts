import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

// Create MMKV instance
export const storage = new MMKV({
  id: 'rightylove-storage',
});

// Zustand MMKV storage adapter
export const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};

// Helper functions for direct storage access
export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  ONBOARDING_DATA: 'onboarding_data',
  PHOTOS: 'photos',
  MOOD_ENTRIES: 'mood_entries',
  BUCKET_ITEMS: 'bucket_items',
  ACTIVITY_LOG: 'activity_log',
  APP_SETTINGS: 'app_settings',
} as const;

export function getStoredObject<T>(key: string): T | null {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function setStoredObject<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function clearStorage(): void {
  storage.clearAll();
}
