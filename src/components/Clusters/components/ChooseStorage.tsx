import { FlexBox, Label, RadioButton } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

interface ChooseStorageProps {
  storage: string;
  setStorage: (storage: string) => void;
  hideLabel?: boolean;
  disabled?: boolean;
  name?: string;
}

export function ChooseStorage({
  storage,
  setStorage,
  hideLabel = false,
  disabled = false,
  name = 'storage',
}: ChooseStorageProps) {
  const { t } = useTranslation();

  return (
    <>
      <FlexBox
        direction="Column"
        aria-labelledby="storage-preference"
        role="radiogroup"
      >
        {!hideLabel && (
          <Label
            id="storage-preference"
            className="cluster-wizard__storage-preference sap-margin-bottom-tiny"
          >
            {`${t('clusters.storage.storage-preference')}:`}
          </Label>
        )}
        <RadioButton
          name={name}
          value="localStorage"
          checked={storage === 'localStorage'}
          text={`${t('clusters.storage.labels.localStorage')}: ${t(
            'clusters.storage.descriptions.localStorage',
          )}`}
          disabled={disabled}
          onChange={(event) => setStorage(event.target.value)}
        />
        <RadioButton
          name={name}
          value="sessionStorage"
          checked={storage === 'sessionStorage'}
          text={`${t('clusters.storage.labels.sessionStorage')}: ${t(
            'clusters.storage.descriptions.sessionStorage',
          )}`}
          disabled={disabled}
          onChange={(event) => setStorage(event.target.value)}
        />
      </FlexBox>
    </>
  );
}
