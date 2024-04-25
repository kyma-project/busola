import {
  Button,
  ButtonDomRef,
  ButtonPropTypes,
  MessageBox,
  WithWebComponentPropTypes,
} from '@ui5/webcomponents-react';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';

type CancelMessageBoxProps = {
  isEdited: boolean;
  isOpen?: boolean;
  proceedButtonAction: Function;
};

export function CancelMessageBox({
  proceedButtonAction,
  isOpen,
}: CancelMessageBoxProps) {
  const { t } = useGetTranslation();
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );

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
      if (isResourceEdited.discardAction) {
        isResourceEdited.discardAction();
      }
    } else if (event.detail.action === 'Cancel') {
      setIsResourceEdited({ isEdited: true, warningOpen: false });
    }
    setIsResourceEdited({ isEdited: false, warningOpen: false });
  };

  return (
    <MessageBox
      type="Warning"
      open={isOpen ?? isResourceEdited.warningOpen}
      onClose={handleClose}
      titleText="Discard Changes"
      actions={[
        <Button design="Emphasized">{t('common.buttons.discard')}</Button>,
        `${t('common.buttons.cancel')}`,
      ]}
    >
      {t('common.messages.discard-changes-warning')}
    </MessageBox>
  );
}
