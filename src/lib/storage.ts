import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

type StorageLike = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  clearAll: () => void;
};

function createStorage(): StorageLike {
  try {
    return new MMKV({ id: 'rightylove-storage' });
  } catch (error) {
    if (__DEV__) {
      console.warn(
        'MMKV unavailable (likely remote debugger). Falling back to in-memory storage.',
        error
      );
    }
    const memory = new Map<string, string>();
    return {
      getString: (key: string) => memory.get(key),
      set: (key: string, value: string) => {
        memory.set(key, value);
      },
      delete: (key: string) => {
        memory.delete(key);
      },
      clearAll: () => {
        memory.clear();
      },
    };
  }
}

// Create MMKV instance (or fallback)
export const storage: StorageLike = createStorage();

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
