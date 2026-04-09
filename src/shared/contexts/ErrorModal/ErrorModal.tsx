import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Bar, Button, Dialog, Icon, Title } from '@ui5/webcomponents-react';
import { useEventListener } from 'hooks/useEventListener';

import './ErrorModal.scss';

export type ToastProps = {
  content: React.ReactNode;
  title?: string;
  parentContainer?: HTMLElement | null;
};

type CloseFn = () => void;

export type ErrorModalProps = ToastProps & {
  header?: React.ReactNode | string;
  buttonDismissText?: string;
  close: CloseFn;
  actions?: (
    close: CloseFn,
    defaultCloseButton: (close: CloseFn) => React.ReactNode,
  ) => React.ReactNode[] | React.ReactNode;
  content: React.ReactNode;
  wider?: boolean;
};

export function ErrorModal({
  header,
  buttonDismissText,
  content,
  actions,
  close,
  wider,
}: ErrorModalProps) {
  const { t } = useTranslation();
  buttonDismissText = buttonDismissText ?? t('common.buttons.close');
  header = header ?? t('common.errors.error');

  useEventListener(
    'keydown',
    (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        close();
        e.stopPropagation();
      }
    },
    [],
    { capture: true }, // capture to not propagate further
  );

  const defaultCloseButton = (close: CloseFn): React.ReactNode => (
    <Button onClick={close}>{buttonDismissText}</Button>
  );

  return (
    <Dialog
      onClose={close}
      className={classNames(
        'error-modal',
        'contentPartNoPadding',
        'popupHeaderNoLeftPadding',
        {
          'error-modal--wider': wider,
        },
      )}
      header={
        <Bar
          design="Header"
          startContent={
            <>
              <Icon
                design="Negative"
                name="error"
                className="sap-margin-end-tiny"
              />
              <Title>{header}</Title>
            </>
          }
        />
      }
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              {actions
                ? actions(close, defaultCloseButton)
                : defaultCloseButton(close)}
            </>
          }
        />
      }
      open
    >
      {content}
    </Dialog>
  );
}
