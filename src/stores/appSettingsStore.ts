import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { Language } from '@/i18n';

interface AppSettingsStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
);
