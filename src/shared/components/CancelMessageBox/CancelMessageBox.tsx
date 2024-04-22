import {
  Button,
  ButtonDomRef,
  ButtonPropTypes,
  MessageBox,
  WithWebComponentPropTypes,
} from '@ui5/webcomponents-react';
import {
  ForwardRefExoticComponent,
  RefAttributes,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';

type CancelMessageBoxProps = {
  isEdited: boolean;
  //setOpen: Function;
  proceedButtonAction: Function;
};

export function CancelMessageBox({
  isEdited,
  //setOpen,
  proceedButtonAction,
}: CancelMessageBoxProps) {
  const [open, setOpen] = useState(false);
  const [layoutState] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  useEffect(() => {
    if (isEdited && layoutState?.layout !== 'TwoColumnsMidExpanded') {
      setOpen(true);
    }
  }, [layoutState, isEdited, layout]);
  console.log(isEdited);
  console.log(open);
  console.log(layoutState);
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
