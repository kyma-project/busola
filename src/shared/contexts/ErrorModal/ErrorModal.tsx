import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Dialog, Bar, Button } from '@ui5/webcomponents-react';
import { Icon } from 'fundamental-react';
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
    <Button slot="endContent" design="Emphasized" onClick={close}>
      {buttonDismissText}
    </Button>
  );

  const title = (
    <>
      <Icon glyph="message-error" className="fd-margin-end--tiny" />
      {header}
    </>
  );

  return (
    <Dialog
      className={classNames('error-modal', { 'error-modal--wider': wider })}
      // @ts-ignore Type 'Element' is not assignable to type 'string', but we need an icon inside
      header-text={title}
      open
    >
      {content}
      <Bar slot="footer" design="Footer">
        {actions
          ? actions(close, defaultCloseButton)
          : [defaultCloseButton(close)]}
      </Bar>
    </Dialog>
  );
}
