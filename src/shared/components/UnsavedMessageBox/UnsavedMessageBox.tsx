import { Button, MessageBox } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isFormOpenState } from 'state/formOpenAtom';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';

type UnsavedMessageBoxProps = {
  isOpen?: boolean;
};

export function UnsavedMessageBox({ isOpen }: UnsavedMessageBoxProps) {
  const { t } = useTranslation();
  const { formOpen, leavingForm } = useRecoilValue(isFormOpenState);
  const { confirmDiscard, cancelDiscard } = useFormNavigation();

  const handleClose = (
    action: string | undefined,
    escapedPressed?: true | undefined,
  ) => {
    if (action === '0: custom action') {
      confirmDiscard();
    } else if (action === '1: custom action' || escapedPressed) {
      cancelDiscard();
    }
  };

  return (
    <MessageBox
      type="Warning"
      open={isOpen ?? (formOpen && leavingForm)}
      onClose={handleClose}
      titleText={t('common.headers.discard-changes')}
      actions={[
        <Button design="Emphasized" key="discard">
          {t('common.buttons.discard')}
        </Button>,
        <Button design="Transparent" key="cancel">
          {t('common.buttons.cancel')}
        </Button>,
      ]}
    >
      {t('common.messages.discard-changes-warning')}
    </MessageBox>
  );
}
