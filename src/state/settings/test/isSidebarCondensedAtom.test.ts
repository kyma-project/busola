import { describe, it, expect } from 'vitest';
import { createStore } from 'jotai';
import { isSidebarCondensedAtom } from '../isSidebarCondensedAtom';

describe('isSidebarCondensedAtom', () => {
  it('defaults to false', () => {
    const store = createStore();
    expect(store.get(isSidebarCondensedAtom)).toBe(false);
  });

  it('can be set to true', () => {
    const store = createStore();
    store.set(isSidebarCondensedAtom, true);
    expect(store.get(isSidebarCondensedAtom)).toBe(true);
  });

  it('can be toggled back to false', () => {
    const store = createStore();
    store.set(isSidebarCondensedAtom, true);
    store.set(isSidebarCondensedAtom, false);
    expect(store.get(isSidebarCondensedAtom)).toBe(false);
  });
});
