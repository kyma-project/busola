import classNames from 'classnames';
import { Button, Dialog, Icon } from 'fundamental-react';
import { useEventListener } from 'hooks/useEventListener';
import './ErrorModal.scss';

type CloseFn = () => void;

type ErrorModalProps = {
  header: JSX.Element;
  buttonDismissText: string;
  content: JSX.Element;
  close: CloseFn;
  actions: (
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
    <Button option="emphasized" compact onClick={close}>
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
      title={title}
      actions={
        actions
          ? actions(close, defaultCloseButton)
          : [defaultCloseButton(close)]
      }
      show
    >
      {content}
    </Dialog>
  );
}
