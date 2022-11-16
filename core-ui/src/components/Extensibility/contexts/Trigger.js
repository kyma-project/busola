import React, { createContext, useState } from 'react';

export const TriggerContext = createContext({
  trigger: () => {},
  subscribe: () => {},
  unsubscribe: () => {},
  setResource: () => {},
});

export function TriggerContextProvider({ children }) {
  const [subs, setSubs] = useState([]);

  const trigger = name => {
    setTimeout(() =>
      subs
        .map(sub => sub.current[name])
        .filter(sub => !!sub)
        .forEach(sub => sub()),
    );
  };

  const subscribe = sub => {
    setSubs(subs => {
      subs.push(sub);
      return subs;
    });
  };

  const unsubscribe = sub => {
    setSubs(subs => subs.filter(s => s !== sub));
  };

  return (
    <TriggerContext.Provider
      value={{
        trigger,
        subscribe,
        unsubscribe,
      }}
    >
      {children}
    </TriggerContext.Provider>
  );
}
