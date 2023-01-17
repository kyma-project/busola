import React, { createContext, useState } from 'react';

export function scopePaths(storeKeys) {
  const indexes = storeKeys
    .toArray()
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => typeof item === 'number')
    .map(({ item, index }) => index);

  return [
    '',
    ...indexes.map(index =>
      storeKeys
        .slice(0, index + 1)
        .toArray()
        .join('.'),
    ),
  ];
}

function pathMatch(subKeys, triggerKeys, modifiers) {
  const subPaths = scopePaths(subKeys);
  const triggerPaths = scopePaths(triggerKeys);

  let subPath = subPaths.pop();
  if (modifiers.includes('$root')) {
    subPath = '';
  } else {
    modifiers
      .filter(mod => mod === '$parent')
      .forEach(() => (subPath = subPaths.pop()));
  }

  return triggerPaths.includes(subPath);
}

export const TriggerContext = createContext({
  trigger: () => {},
  subscribe: () => {},
  unsubscribe: () => {},
  setResource: () => {},
  disable: () => {},
  enable: () => {},
});

export function TriggerContextProvider({ children }) {
  const [subs, setSubs] = useState([]);
  const [enabled, setEnabled] = useState(true);

  const trigger = (name, storeKeys) => {
    if (!enabled) return;
    setTimeout(() =>
      subs
        .map(sub => sub.current[name])
        .filter(sub => !!sub)
        .filter(sub => pathMatch(sub.storeKeys, storeKeys, sub.modifiers))
        .forEach(sub => sub.callback()),
    );
  };

  const subscribe = sub => {
    setSubs(subs => [...subs, sub]);
  };

  const unsubscribe = sub => {
    setSubs(subs => subs.filter(s => s.sub !== sub));
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
      }}
    >
      {children}
    </TriggerContext.Provider>
  );
}
