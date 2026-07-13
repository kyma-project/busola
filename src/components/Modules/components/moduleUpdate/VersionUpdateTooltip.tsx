import { FlexBox, Text } from '@ui5/webcomponents-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

type VersionUpdateTooltipProps = {
  currentVersion: string;
  latestVersion: string;
  button: React.ReactNode;
};

export const VersionUpdateTooltip = ({
  currentVersion,
  latestVersion,
  button,
}: VersionUpdateTooltipProps) => {
  const { t } = useTranslation();

  return (
    <>
      <FlexBox direction="Column" className="sap-margin-bottom-small">
        <Text>{`${t('modules.community.update.current-version')}: ${currentVersion}`}</Text>
        <Text>{`${t('modules.community.update.latest-version')}: ${latestVersion}`}</Text>
      </FlexBox>
      <FlexBox
        alignItems="End"
        direction="Column"
        className="status-update-button"
      >
        {button}
      </FlexBox>
    </>
  );
};
