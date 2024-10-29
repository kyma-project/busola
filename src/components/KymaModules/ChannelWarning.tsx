import { Button, MessageBox } from '@ui5/webcomponents-react';
import { Trans, useTranslation } from 'react-i18next';

type ManagedWarningsTypes = {
  showMessageBox: { isOpen: boolean };
  handleCreate(): void;
  setShowMessageBox(value: { isOpen: boolean }): void;
};

export const ChannelWarning = ({
  handleCreate,
  setShowMessageBox,
  showMessageBox,
}: ManagedWarningsTypes) => {
  const { t } = useTranslation();

  return (
    <MessageBox
      type="Warning"
      open={showMessageBox.isOpen}
      onClose={() => {
        setShowMessageBox({ isOpen: false });
      }}
      titleText={t('kyma-modules.change-release-channel')}
      actions={[
        <Button
          accessibleName="change-kyma"
          design="Emphasized"
          key="change-kyma"
          onClick={() => {
            handleCreate();
          }}
        >
          {t('kyma-modules.change')}
        </Button>,
        <Button
          accessibleName="cancel-kyma"
          design="Transparent"
          key="cancel-kyma"
        >
          {t('common.buttons.cancel')}
        </Button>,
      ]}
    >
      <Trans i18nKey="kyma-modules.change-release-channel-warning">
        <span style={{ fontWeight: 'bold' }} />
      </Trans>
    </MessageBox>
  );
};
