import { describe, it, expect } from 'vitest';
import { createStore } from 'jotai';
import { isSettingsOpenAtom } from '../isSettingsModalOpenAtom';

describe('isSettingsOpenAtom', () => {
  it('defaults to false', () => {
    const store = createStore();
    expect(store.get(isSettingsOpenAtom)).toBe(false);
  });

  it('updates to true when set', () => {
    const store = createStore();
    store.set(isSettingsOpenAtom, true);
    expect(store.get(isSettingsOpenAtom)).toBe(true);
  });

  it('updates back to false when set', () => {
    const store = createStore();
    store.set(isSettingsOpenAtom, true);
    store.set(isSettingsOpenAtom, false);
    expect(store.get(isSettingsOpenAtom)).toBe(false);
  });

  it('is independent across stores', () => {
    const storeA = createStore();
    const storeB = createStore();
    storeA.set(isSettingsOpenAtom, true);
    expect(storeA.get(isSettingsOpenAtom)).toBe(true);
    expect(storeB.get(isSettingsOpenAtom)).toBe(false);
  });
});
