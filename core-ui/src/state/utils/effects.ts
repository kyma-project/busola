import { AtomEffect } from 'recoil';
import LuigiClient from '@luigi-project/client';

type LocalStorageEffectFn = <T>(
  localStorageKey: string,
  setSelfFn?: any,
) => AtomEffect<T>;

export const localStorageEffect: LocalStorageEffectFn = (
  localStorageKey,
  setSelfFn,
) => ({ setSelf, onSet }) => {
  setSelf(previousValue => {
    const savedValue = localStorage.getItem(localStorageKey);

    if (savedValue !== null) return JSON.parse(savedValue);
    return previousValue;
  });

  // setSelf(previousValue => {
  //   const savedValue = localStorage.getItem(localStorageKey);
  //   console.log(localStorageKey, savedValue);

  //   if (savedValue === null) {
  //     setSelfFn && setSelfFn(previousValue);
  //     return previousValue;
  //   }

  //   try {
  //     const parsedValue = JSON.parse(savedValue);
  //     setSelfFn && setSelfFn(parsedValue);
  //     return parsedValue;
  //   } catch (_) {
  //     setSelfFn && setSelfFn(previousValue);
  //     return previousValue;
  //   }
  // });

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
