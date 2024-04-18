import {
  Button,
  ButtonDomRef,
  ButtonPropTypes,
  MessageBox,
  WithWebComponentPropTypes,
} from '@ui5/webcomponents-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

type CancelMessageBoxProps = {
  open: boolean;
  setOpen: Function;
  proceedButtonAction: Function;
};

export function CancelMessageBox({
  open,
  setOpen,
  proceedButtonAction,
}: CancelMessageBoxProps) {
  console.log(open);
  const handleClose = (event: {
    detail: {
      action:
        | string
        | ForwardRefExoticComponent<
            ButtonPropTypes &
              WithWebComponentPropTypes &
              RefAttributes<ButtonDomRef>
          >;
    };
  }) => {
    console.log(event.detail.action);
    console.log(typeof event.detail.action);
    if (event.detail.action === '0: custom action') {
      proceedButtonAction();
    } else if (event.detail.action === 'Cancel') {
      setOpen(false);
    }
    setOpen(false);
  };

  return (
    <MessageBox
      type="Warning"
      open={open}
      onClose={handleClose}
      titleText="Discard Changes"
      actions={[<Button design="Emphasized">Discard</Button>, 'Cancel']}
    >
      You haven't saved your changes. Navigating out will discard them.
    </MessageBox>
  );
}
