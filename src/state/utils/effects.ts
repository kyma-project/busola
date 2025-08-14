import { AtomEffect } from 'recoil';

type LocalStorageEffectFn = <T>(localStorageKey: string) => AtomEffect<T>;

export const localStorageEffect: LocalStorageEffectFn = localStorageKey => ({
  setSelf,
  onSet,
}) => {
  setSelf(previousValue => {
    const savedValue = localStorage.getItem(localStorageKey);

    try {
      if (savedValue !== null) return JSON.parse(savedValue);
      return previousValue ?? {};
    } catch (e) {
      console.warn('Cannot get clusters', e);
      return previousValue ?? {};
    }
  });

  onSet(newValue =>
    localStorage.setItem(localStorageKey, JSON.stringify(newValue)),
  );
};
