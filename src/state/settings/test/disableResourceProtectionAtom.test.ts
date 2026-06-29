import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { disableResourceProtectionAtom } from '../disableResourceProtectionAtom';

const STORAGE_KEY = 'busola.disableResourceProtection';

describe('disableResourceProtectionAtom', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to false when localStorage has no entry', () => {
    const store = createStore();
    expect(store.get(disableResourceProtectionAtom)).toBe(false);
  });

  it('persists true to localStorage when set', () => {
    const store = createStore();
    store.set(disableResourceProtectionAtom, true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('persists false to localStorage when set back to false', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    const store = createStore();
    store.set(disableResourceProtectionAtom, false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
  });
});
