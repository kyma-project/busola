import { Button, MessageBox } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';

type UnsavedMessageBoxProps = {
  isOpen?: boolean;
};

export function UnsavedMessageBox({ isOpen }: UnsavedMessageBoxProps) {
  const { t } = useTranslation();
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);

  const handleClose = (action, escapedPressed) => {
    if (action === '0: custom action' || escapedPressed) {
      if (isResourceEdited.discardAction) {
        isResourceEdited.discardAction();
      }
      setIsFormOpen({ formOpen: false, leavingForm: false });
    } else if (action === '1: custom action') {
      setIsResourceEdited({ isEdited: true });
      setIsFormOpen({ formOpen: true, leavingForm: false });
      return;
    }
    setIsResourceEdited({ isEdited: false });
  };

  return (
    <MessageBox
      type="Warning"
      open={
        isOpen ??
        (isResourceEdited.isEdited &&
          isFormOpen.formOpen &&
          isFormOpen.leavingForm)
      }
      onClose={handleClose}
      titleText={t('common.headers.discard-changes')}
      actions={[
        <Button design="Emphasized" key="discard">
          {t('common.buttons.discard')}
        </Button>,
        <Button design="Transparent" key="cancel">{`${t(
          'common.buttons.cancel',
        )}`}</Button>,
      ]}
    >
      {t('common.messages.discard-changes-warning')}
    </MessageBox>
  );
}
