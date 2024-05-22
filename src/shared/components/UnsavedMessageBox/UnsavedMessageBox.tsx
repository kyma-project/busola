import {
  Button,
  ButtonDomRef,
  ButtonPropTypes,
  MessageBox,
  WithWebComponentPropTypes,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';

type UnsavedMessageBoxProps = {
  isOpen?: boolean;
};

export function UnsavedMessageBox({ isOpen }: UnsavedMessageBoxProps) {
  const { t } = useTranslation();
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
    } else if (event.detail.action === '1: custom action') {
      setIsResourceEdited({ isEdited: true, warningOpen: false });
    }
    setIsResourceEdited({ isEdited: false, warningOpen: false });
  };

  return (
    <MessageBox
      type="Warning"
      open={isOpen ?? isResourceEdited.warningOpen}
      onClose={handleClose}
      titleText={t('common.headers.discard-changes')}
      actions={[
        <Button design="Emphasized">{t('common.buttons.discard')}</Button>,
        <Button design="Transparent">{`${t('common.buttons.cancel')}`}</Button>,
      ]}
    >
      {t('common.messages.discard-changes-warning')}
    </MessageBox>
  );
}
