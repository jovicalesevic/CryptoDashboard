import type { Language } from "./types.js";

export const LANGUAGE_STORAGE_KEY = "cryptoDashboardLanguage";

export function isSupportedLanguage(
  language: string,
  supportedLanguages: readonly string[]
): language is Language {
  return supportedLanguages.includes(language);
}

export function getNextLanguage(currentLanguage: Language): Language {
  return currentLanguage === "sr" ? "en" : "sr";
}

export function saveLanguagePreference(storage: Storage, language: Language): void {
  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage failures (private mode/restricted settings).
  }
}

export function getSavedLanguagePreference(storage: Storage): string | null {
  try {
    return storage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}
