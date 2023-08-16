import { MessageStrip } from '@ui5/webcomponents-react';
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

type NotifySuccessFn = (props: ToastProps, visibilityTime?: number) => void;
type NotifyErrorFn = (props: Omit<ErrorModalProps, 'close'>) => void;

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
  const [toastProps, setToastProps] = useState<ToastProps | null>();
  const [errorProps, setErrorProps] = useState<ErrorModalProps | null>();

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
    notifyError: function(notificationProps: Omit<ErrorModalProps, 'close'>) {
      setErrorProps({
        ...notificationProps,
        close: () => setErrorProps(null),
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
          <MessageStrip design="Information" hideCloseButton>
            {toastProps.content}
          </MessageStrip>
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
