import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Dialog, Bar, Title } from '@ui5/webcomponents-react';
import { useEventListener } from 'hooks/useEventListener';

import './ErrorModal.scss';

export type ToastProps = {
  content: React.ReactNode;
};

type CloseFn = () => void;

export type ErrorModalProps = ToastProps & {
  header?: JSX.Element;
  buttonDismissText?: string;
  close: CloseFn;
  actions?: (
    close: CloseFn,
    defaultCloseButton: (close: CloseFn) => React.ReactNode,
  ) => React.ReactNode[];
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
    <Button design="Emphasized" onClick={close}>
      {buttonDismissText}
    </Button>
  );

  return (
    <Dialog
      onAfterClose={close}
      className={classNames('error-modal', { 'error-modal--wider': wider })}
      header={
        <Bar
          design="Header"
          startContent={
            <>
              <Icon
                design="Negative"
                name="message-error"
                className="bsl-margin-end--tiny"
              />
              <Title level="H5">{header}</Title>
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
