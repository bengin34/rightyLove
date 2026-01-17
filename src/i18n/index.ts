import { useCallback } from 'react';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { translations, type Language, languageLabels } from './translations';

type Params = Record<string, string | number>;

export function translate(language: Language, key: string, params?: Params): string {
  const table = translations[language] || translations.en;
  const fallback = translations.en;
  let text = table[key] ?? fallback[key] ?? key;

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    });
  }

  return text;
}

export function translateError(
  language: Language,
  error?: string,
  fallbackKey = 'Something went wrong. Please try again.'
): string {
  if (!error) {
    return translate(language, fallbackKey);
  }

  if (language === 'en') {
    return translate(language, error);
  }

  const table = translations[language];
  const fallback = translations.en;
  if (table?.[error] || fallback?.[error]) {
    return translate(language, error);
  }

  return translate(language, fallbackKey);
}

export function getLocale(language: Language): string {
  switch (language) {
    case 'tr':
      return 'tr-TR';
    case 'de':
      return 'de-DE';
    case 'it':
      return 'it-IT';
    case 'fr':
      return 'fr-FR';
    case 'es':
      return 'es-ES';
    default:
      return 'en-US';
  }
}

export function useTranslation() {
  const language = useAppSettingsStore((state) => state.language);
  const setLanguage = useAppSettingsStore((state) => state.setLanguage);

  const t = useCallback(
    (key: string, params?: Params) => translate(language, key, params),
    [language]
  );
  const tError = useCallback(
    (error?: string, fallbackKey?: string) =>
      translateError(language, error, fallbackKey),
    [language]
  );

  return { t, tError, language, setLanguage };
}

export type { Language };
export { languageLabels };
