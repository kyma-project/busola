import { AtomEffect } from 'recoil';

export const localStorageEffect: <T>(
  localStorageKey: string,
) => AtomEffect<T> = (localStorageKey: string) => ({ setSelf, onSet }) => {
  const savedValue = localStorage.getItem(localStorageKey);
  if (savedValue != null) {
    setSelf(JSON.parse(savedValue));
  }

  onSet(newValue =>
    localStorage.setItem(localStorageKey, JSON.stringify(newValue)),
  );
};
