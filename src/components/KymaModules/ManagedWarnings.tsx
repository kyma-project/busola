import { Button, MessageBox } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

type ShowManagedBox = {
  isOpen: boolean;
  onSave: boolean;
};
type ManagedWarningsTypes = {
  showManagedBox: ShowManagedBox;
  setShowManagedBox(value: ShowManagedBox): void;
  handleCreate(): void;
  isEdited: boolean;
  setShowMessageBox(value: ShowManagedBox): void;
};

export const ManagedWarnings = ({
  showManagedBox,
  setShowManagedBox,
  handleCreate,
  isEdited,
  setShowMessageBox,
}: ManagedWarningsTypes) => {
  const { t } = useTranslation();

  if (showManagedBox?.onSave) {
    return (
      <MessageBox
        type="Warning"
        open={showManagedBox.isOpen}
        onClose={() => {
          setShowManagedBox({
            isOpen: false,
            onSave: false,
          });
        }}
        titleText={t('common.headers.warning')}
        actions={[
          <Button
            accessibleName={'change-managed'}
            design="Emphasized"
            key={'change-managed'}
            onClick={() =>
              isEdited
                ? setShowManagedBox({
                    isOpen: false,
                    onSave: false,
                  })
                : handleCreate()
            }
          >
            {t(isEdited ? 'common.buttons.ok' : 'kyma-modules.change')}
          </Button>,
          <Button
            accessibleName="cancel-managed"
            design="Transparent"
            key="cancel-managed"
            onClick={() => {
              setShowManagedBox({
                isOpen: false,
                onSave: false,
              });
              setShowMessageBox({
                isOpen: false,
                onSave: false,
              });
            }}
          >
            {t('common.buttons.cancel')}
          </Button>,
        ]}
      >
        {t('kyma-modules.unmanaged-modules-save-warning')}
      </MessageBox>
    );
  } else {
    return (
      <MessageBox
        type="Warning"
        open={showManagedBox.isOpen}
        titleText={t('common.headers.warning')}
        actions={[
          <Button
            accessibleName={'ok-managed'}
            design="Emphasized"
            key={'ok-managed'}
            onClick={() =>
              setShowManagedBox({
                isOpen: false,
                onSave: false,
              })
            }
          >
            {t('common.buttons.ok')}
          </Button>,
        ]}
      >
        {t('kyma-modules.unmanaged-modules-warning')}
      </MessageBox>
    );
  }
};
