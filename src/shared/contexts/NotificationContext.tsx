import { Toast, ToastDomRef } from '@ui5/webcomponents-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
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

type CloseFn = () => void;

type NotifySuccessFn = (props: ToastProps, visibilityTime?: number) => void;
type NotifyErrorFn = (props: {
  actions: (
    close: CloseFn,
    defaultCloseButton: (close: CloseFn) => React.ReactNode,
  ) =>
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | string
    | number
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | boolean
    | undefined
    | null;
  content: string | React.ReactElement;
  wider?: boolean;
}) => void;

export type NotificationContextArgs = {
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

  const notifySuccess = useCallback(
    function (notificationProps: ToastProps) {
      setToastProps(notificationProps);
      if (toast.current && !toastProps?.parentContainer) {
        toast.current.open = true;
      }
    },
    [toastProps?.parentContainer],
  );

  const notifyError = useCallback(function (
    notificationProps: Omit<ErrorModalProps, 'close'>,
  ) {
    setErrorProps({
      ...notificationProps,
      close: () => setErrorProps(null),
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      isOpen: !!toastProps,
      notifySuccess,
      notifyError,
    }),
    [toastProps, notifySuccess, notifyError],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {toastProps?.parentContainer &&
        createPortal(
          <Toast
            accessible-name="notification-content"
            open={!!toastProps}
            ref={toast}
            duration={defaultVisibilityTime}
            style={{ zIndex: 1 }}
            onClose={(e) => {
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
          accessible-name="notification-content"
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
