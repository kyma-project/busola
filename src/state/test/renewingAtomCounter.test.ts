import { describe, it, expect } from 'vitest';
import { createStore } from 'jotai';
import { renewingAtom } from '../renewingAtom';

describe('renewingAtom', () => {
  it('stays true while any of multiple concurrent renews is in flight', () => {
    // Cluster OIDC and SSO can renew at the same time; the one finishing
    // first must not flip the flag while the other still runs.
    const store = createStore();

    expect(store.get(renewingAtom)).toBe(false);

    // Two renews start.
    store.set(renewingAtom, true);
    store.set(renewingAtom, true);
    expect(store.get(renewingAtom)).toBe(true);

    // First one settles.
    store.set(renewingAtom, false);
    expect(store.get(renewingAtom)).toBe(true);

    // Second one settles.
    store.set(renewingAtom, false);
    expect(store.get(renewingAtom)).toBe(false);
  });

  it('never underflows below zero', () => {
    const store = createStore();

    // Over-decrement from a stray extra false.
    store.set(renewingAtom, false);
    expect(store.get(renewingAtom)).toBe(false);

    store.set(renewingAtom, true);
    expect(store.get(renewingAtom)).toBe(true);

    store.set(renewingAtom, false);
    store.set(renewingAtom, false);
    expect(store.get(renewingAtom)).toBe(false);

    store.set(renewingAtom, true);
    expect(store.get(renewingAtom)).toBe(true);
  });
});
