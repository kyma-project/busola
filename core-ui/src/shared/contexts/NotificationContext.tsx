import { createContext, useContext, useState } from 'react';
import {
  ErrorModal,
  ErrorModalProps,
  ToastProps,
} from './ErrorModal/ErrorModal';

type NotificationContextProps = {
  children: React.ReactNode;
  defaultVisibilityTime: number;
};

type NotifySuccessFn = (props: ToastProps) => void;
type NotifyErrorFn = (props: ErrorModalProps) => void;

type NotificationContextArgs = {
  isOpen: boolean;
  notifySuccess: NotifySuccessFn;
  notifyError: NotifyErrorFn;
};

export const NotificationContext = createContext<NotificationContextArgs>({
  isOpen: false,
  notifySuccess: props => {},
  notifyError: props => {},
});

export const NotificationProvider = ({
  children,
  defaultVisibilityTime = 5000,
}: NotificationContextProps) => {
  const [toastProps, setToastProps] = useState<null | ToastProps>();
  const [errorProps, setErrorProps] = useState<null | ErrorModalProps>();

  const methods = {
    notifySuccess: function(
      notificationProps: ToastProps,
      visibilityTime: number = defaultVisibilityTime,
    ) {
      if (visibilityTime !== 0) {
        setTimeout(() => {
          setToastProps(null);
        }, visibilityTime);
      }
      setToastProps(notificationProps);
    },
    notifyError: function(notificationProps: ErrorModalProps) {
      setErrorProps({
        //@ts-ignore
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
          <div className="fd-message-toast">{toastProps.content}</div>
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
