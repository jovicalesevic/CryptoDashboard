import test from "node:test";
import assert from "node:assert/strict";

import {
  getNextLanguage,
  getSavedLanguagePreference,
  isSupportedLanguage,
  saveLanguagePreference,
} from "../language.js";
import { SUPPORTED_LANGUAGES } from "../messages.js";

function createStorageMock(): Storage {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key) ?? null : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    get length() {
      return store.size;
    },
  };
}

test("language toggle switches between SR and EN", () => {
  assert.equal(getNextLanguage("sr"), "en");
  assert.equal(getNextLanguage("en"), "sr");
});

test("language persistence stores and reads selected language", () => {
  const storage = createStorageMock();
  saveLanguagePreference(storage, "en");

  assert.equal(getSavedLanguagePreference(storage), "en");
});

test("supported language check rejects unsupported values", () => {
  assert.equal(isSupportedLanguage("sr", SUPPORTED_LANGUAGES), true);
  assert.equal(isSupportedLanguage("en", SUPPORTED_LANGUAGES), true);
  assert.equal(isSupportedLanguage("de", SUPPORTED_LANGUAGES), false);
});
