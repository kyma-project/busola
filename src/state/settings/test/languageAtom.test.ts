import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { languageAtom } from '../languageAtom';

const STORAGE_KEY = 'busola.language';

describe('languageAtom', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to "en" when localStorage has no entry', () => {
    const store = createStore();
    expect(store.get(languageAtom)).toBe('en');
  });

  it('persists a new language to localStorage when set', () => {
    const store = createStore();
    store.set(languageAtom, 'de');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('"de"');
  });

  it('can be changed to a different language', () => {
    const store = createStore();
    store.set(languageAtom, 'de');
    store.set(languageAtom, 'ja');
    expect(store.get(languageAtom)).toBe('ja');
  });

  it('stores are isolated — changing one does not affect another', () => {
    const storeA = createStore();
    const storeB = createStore();
    storeA.set(languageAtom, 'de');
    expect(storeB.get(languageAtom)).toBe('en');
  });
});
