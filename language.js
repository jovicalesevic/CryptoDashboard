export const LANGUAGE_STORAGE_KEY = "cryptoDashboardLanguage";
export function isSupportedLanguage(language, supportedLanguages) {
    return supportedLanguages.includes(language);
}
export function getNextLanguage(currentLanguage) {
    return currentLanguage === "sr" ? "en" : "sr";
}
export function saveLanguagePreference(storage, language) {
    try {
        storage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
    catch {
        // Ignore storage failures (private mode/restricted settings).
    }
}
export function getSavedLanguagePreference(storage) {
    try {
        return storage.getItem(LANGUAGE_STORAGE_KEY);
    }
    catch {
        return null;
    }
}
