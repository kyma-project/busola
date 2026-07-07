import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { dontConfirmDeleteAtom } from '../dontConfirmDeleteAtom';

const STORAGE_KEY = 'busola.dontConfirmDelete';

describe('dontConfirmDeleteAtom', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to false when localStorage has no entry', () => {
    const store = createStore();
    expect(store.get(dontConfirmDeleteAtom)).toBe(false);
  });

  it('persists true to localStorage when set', () => {
    const store = createStore();
    store.set(dontConfirmDeleteAtom, true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('persists false to localStorage when set back to false', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    const store = createStore();
    store.set(dontConfirmDeleteAtom, false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
  });
});
