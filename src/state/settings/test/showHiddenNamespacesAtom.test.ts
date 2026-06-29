import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { showHiddenNamespacesAtom } from '../showHiddenNamespacesAtom';

const STORAGE_KEY = 'busola.showHiddenNamespaces';

describe('showHiddenNamespacesAtom', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to true when localStorage has no entry', () => {
    const store = createStore();
    expect(store.get(showHiddenNamespacesAtom)).toBe(true);
  });

  it('can be set to false', () => {
    const store = createStore();
    store.set(showHiddenNamespacesAtom, false);
    expect(store.get(showHiddenNamespacesAtom)).toBe(false);
  });

  it('persists the value to localStorage when set', () => {
    const store = createStore();
    store.set(showHiddenNamespacesAtom, false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
  });

  it('can be toggled back to true', () => {
    const store = createStore();
    store.set(showHiddenNamespacesAtom, false);
    store.set(showHiddenNamespacesAtom, true);
    expect(store.get(showHiddenNamespacesAtom)).toBe(true);
  });

  it('stores are isolated — changing one does not affect another', () => {
    const storeA = createStore();
    const storeB = createStore();
    storeA.set(showHiddenNamespacesAtom, false);
    expect(storeB.get(showHiddenNamespacesAtom)).toBe(true);
  });
});
