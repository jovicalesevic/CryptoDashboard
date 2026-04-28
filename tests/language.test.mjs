import test from "node:test";
import assert from "node:assert/strict";

import {
  getNextLanguage,
  getSavedLanguagePreference,
  isSupportedLanguage,
  saveLanguagePreference,
} from "../language.js";
import { SUPPORTED_LANGUAGES } from "../messages.js";

function createStorageMock() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
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
