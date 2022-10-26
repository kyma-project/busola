import { AtomEffect } from 'recoil';
import LuigiClient from '@luigi-project/client';

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

type LuigiMessageEffect = <T>(
  luigiMessageId: string,
  newValueKey: string,
) => AtomEffect<T>;

export const luigiMessageEffect: LuigiMessageEffect = (
  luigiMessageId,
  newValueKey,
) => ({ onSet }) => {
  onSet(newValue => {
    LuigiClient.sendCustomMessage({
      id: luigiMessageId,
      [newValueKey]: newValue,
    });
  });
};
