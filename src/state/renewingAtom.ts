import { atom } from 'jotai';

// Counts in-flight silent renews, since cluster OIDC and SSO can renew at
// the same time. Reads as a boolean (true while any renew runs); writing
// true/false increments/decrements the counter.
const renewCountAtom = atom<number>(0);
renewCountAtom.debugLabel = 'renewCountAtom';

export const renewingAtom = atom(
  (get) => get(renewCountAtom) > 0,
  (get, set, renewing: boolean) => {
    const current = get(renewCountAtom);
    set(renewCountAtom, renewing ? current + 1 : Math.max(0, current - 1));
  },
);
renewingAtom.debugLabel = 'renewingAtom';
