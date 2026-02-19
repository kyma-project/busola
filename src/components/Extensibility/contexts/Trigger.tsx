import { StoreKeys } from '@ui-schema/ui-schema';
import { fromJS } from 'immutable';
import { createContext, useState, useRef, ReactNode } from 'react';

export function scopePaths(storeKeys: StoreKeys) {
  const indexes = fromJS(storeKeys)
    .toArray()
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => typeof item === 'number')
    .map(({ index }) => index);

  return [
    '',
    ...indexes.map((index) =>
      storeKeys
        .slice(0, index + 1)
        .toArray()
        .join('.'),
    ),
  ];
}

function pathMatch(
  subKeys: StoreKeys,
  triggerKeys: StoreKeys,
  modifiers: string[],
) {
  const subPaths = scopePaths(subKeys);
  const triggerPaths = scopePaths(triggerKeys);

  let subPath = subPaths.pop();
  if (modifiers.includes('$root')) {
    subPath = '';
  } else {
    modifiers
      .filter((mod) => mod === '$parent')
      .forEach(() => (subPath = subPaths.pop()));
  }

  return triggerPaths.includes(subPath as string);
}

export const TriggerContext = createContext({
  trigger: (() => {}) as (name: string, storeKeys: StoreKeys) => void,
  subscribe: (() => {}) as (sub: Record<string, any>) => void,
  unsubscribe: (() => {}) as (sub: Record<string, any>) => void,
  disable: () => {},
  enable: () => {},
  enabled: true,
  subs: [] as any,
});

export function TriggerContextProvider({ children }: { children: ReactNode }) {
  const subs = useRef<Record<string, any>[]>([]);
  const [enabled, setEnabled] = useState(true);

  const trigger = (name: string, storeKeys: StoreKeys) => {
    if (!enabled) return;
    setTimeout(() =>
      subs.current
        .map((sub) => sub.current[name])
        .filter((sub) => !!sub)
        .filter((sub) => pathMatch(sub.storeKeys, storeKeys, sub.modifiers))
        .forEach((sub) => sub.callback()),
    );
  };

  const subscribe = (sub: Record<string, any>) => {
    subs.current = [...subs.current, sub];
  };

  const unsubscribe = (sub: Record<string, any>) => {
    subs.current = subs.current.filter((s) => s.sub !== sub);
  };

  const disable = () => {
    setEnabled(false);
  };

  const enable = () => {
    setEnabled(true);
  };

  return (
    <TriggerContext.Provider
      value={{
        trigger,
        subscribe,
        unsubscribe,
        disable,
        enable,
        enabled,
        subs,
      }}
    >
      {children}
    </TriggerContext.Provider>
  );
}
