import { createContext, useContext, useState } from 'react';
import { ErrorModal } from './ErrorModal/ErrorModal';

export const NotificationContext = createContext({
  isOpen: false,
  notifySuccess: () => {},
  notifyError: () => {},
});

export const NotificationProvider = ({
  children,
  defaultVisibilityTime = 5000,
}) => {
  const [toastProps, setToastProps] = useState();
  const [errorProps, setErrorProps] = useState();

  const methods = {
    notifySuccess: function(
      notificationProps,
      visibilityTime = defaultVisibilityTime,
    ) {
      if (visibilityTime !== 0) {
        setTimeout(() => {
          setToastProps(null);
        }, visibilityTime);
      }
      setToastProps(notificationProps);
    },
    notifyError: function(notificationProps) {
      setErrorProps({
        type: 'error',
        buttonConfirm: false,
        buttonDismissText: 'Close',
        header: 'Error',
        close: () => setErrorProps(null),
        ...notificationProps,
      });
    },
  };

  return (
    <NotificationContext.Provider
      value={{
        isOpen: !!toastProps,
        ...methods,
      }}
    >
      {toastProps && (
        <div
          className="message-toast--wrapper"
          onClick={() => setToastProps(null)}
        >
          <div className="fd-message-toast">
            {toastProps.content || toastProps.title}
          </div>
        </div>
      )}
      {errorProps && <ErrorModal {...errorProps} />}
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  return useContext(NotificationContext);
}
