import React, { createContext, useContext, useState } from 'react';
import { Notification } from '@kyma-project/react-components';

export const NotificationContext = createContext({
  isOpen: false,
  notify: () => {},
});

export const NotificationProvider = ({
  children,
  defaultVisibilityTime = 35000,
}) => {
  const [state, setState] = useState({
    isOpen: false,
  });

  return (
    <NotificationContext.Provider
      value={{
        isOpen: state.isOpen,
        notify: function(
          notificationProps,
          visibilityTime = defaultVisibilityTime,
        ) {
          setState({ isOpen: true, notificationProps });
          setTimeout(() => {
            setState({ isOpen: false });
          }, visibilityTime);
        },
      }}
    >
      {state.isOpen && (
        <Notification
          visible={true}
          {...state.notificationProps}
          onClick={setState({ isOpen: false })}
        />
      )}
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  return useContext(NotificationContext);
}
