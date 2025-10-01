import { Button, MessageBox } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';

type UnsavedMessageBoxProps = {
  isOpen?: boolean;
  isReset?: boolean;
  setIsReset?: (value: boolean) => void;
  customMessage?: string;
};

export function UnsavedMessageBox({
  isOpen,
  isReset = false,
  setIsReset,
  customMessage,
}: UnsavedMessageBoxProps) {
  const { t } = useTranslation();
  const { formOpen, leavingForm } = useAtomValue(isFormOpenAtom);
  const { confirmDiscard, cancelDiscard } = useFormNavigation();

  const handleClose = (
    action: string | undefined,
    escapedPressed?: true | undefined,
  ) => {
    if (action === '0: custom action') {
      confirmDiscard(isReset);

      if (setIsReset) {
        setIsReset(false);
      }
    } else if (action === '1: custom action' || escapedPressed) {
      cancelDiscard();

      if (setIsReset) {
        setIsReset(false);
      }
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
      {customMessage ?? t('common.messages.discard-changes-warning')}
    </MessageBox>
  );
}
