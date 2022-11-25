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
  className?: string;
};

export function ErrorModal({
  header,
  buttonDismissText,
  content,
  actions,
  close,
  className,
}: ErrorModalProps) {
  useEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        e.stopPropagation();
      }
    },
    [],
    { capture: true },
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

  console.log(classNames('error-modal', className));
  return (
    <Dialog
      className={classNames('error-modal', className)}
      // @ts-ignore Type 'Element' is not assignable to type 'string'.
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
