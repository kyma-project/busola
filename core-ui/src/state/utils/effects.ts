import { AtomEffect } from 'recoil';

type LocalStorageEffectFn = <T>(localStorageKey: string) => AtomEffect<T>;

export const localStorageEffect: LocalStorageEffectFn = localStorageKey => ({
  setSelf,
  onSet,
}) => {
  const savedValue = localStorage.getItem(localStorageKey);
  if (savedValue != null) {
    setSelf(JSON.parse(savedValue));
  }

  onSet(newValue =>
    localStorage.setItem(localStorageKey, JSON.stringify(newValue)),
  );
};
