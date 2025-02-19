import { Toast, ToastDomRef } from '@ui5/webcomponents-react';
import { createContext, useContext, useRef, useState } from 'react';
import {
  ErrorModal,
  ErrorModalProps,
  ToastProps,
} from './ErrorModal/ErrorModal';
import { createPortal } from 'react-dom';

type NotificationContextProps = {
  children?: React.ReactNode;
  defaultVisibilityTime?: number;
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
  notifySuccess: () => {},
  notifyError: () => {},
});

export const NotificationProvider = ({
  children,
  defaultVisibilityTime = 3000,
}: NotificationContextProps) => {
  const [toastProps, setToastProps] = useState<ToastProps | null>();
  const [errorProps, setErrorProps] = useState<ErrorModalProps | null>();

  const toast = useRef<ToastDomRef | null>(null);

  const methods = {
    notifySuccess: function(notificationProps: ToastProps) {
      setToastProps(notificationProps);
      if (toast.current && !toastProps?.parentContainer) {
        toast.current.open = true;
      }
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
      {toastProps?.parentContainer &&
        createPortal(
          <Toast
            accessible-name="notification-toast"
            open={!!toastProps}
            ref={toast}
            duration={defaultVisibilityTime}
            style={{ zIndex: 1 }}
            onClose={e => {
              setToastProps(null);
              e.stopPropagation();
            }}
          >
            {toastProps?.content}
          </Toast>,
          toastProps.parentContainer,
        )}
      {!toastProps?.parentContainer && (
        <Toast
          accessible-name="notification-toast"
          ref={toast}
          duration={defaultVisibilityTime}
          style={{ zIndex: 1 }}
        >
          {toastProps?.content}
        </Toast>
      )}
      {errorProps &&
        createPortal(<ErrorModal {...errorProps} />, document.body)}
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  return useContext(NotificationContext);
}
