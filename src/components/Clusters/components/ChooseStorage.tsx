import { FlexBox, Label, RadioButton } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

interface ChooseStorageProps {
  storage: string;
  setStorage: (storage: string) => void;
  hideLabel?: boolean;
}

export function ChooseStorage({
  storage,
  setStorage,
  hideLabel = false,
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
          name="storage"
          value="localStorage"
          checked={storage === 'localStorage'}
          text={`${t('clusters.storage.labels.localStorage')}: ${t(
            'clusters.storage.descriptions.localStorage',
          )}`}
          onChange={(event) => setStorage(event.target.value)}
        />
        <RadioButton
          name="storage"
          value="sessionStorage"
          checked={storage === 'sessionStorage'}
          text={`${t('clusters.storage.labels.sessionStorage')}: ${t(
            'clusters.storage.descriptions.sessionStorage',
          )}`}
          onChange={(event) => setStorage(event.target.value)}
        />
        <RadioButton
          name="storage"
          value="inMemory"
          checked={storage === 'inMemory'}
          text={`${t('clusters.storage.labels.inMemory')}: ${t(
            'clusters.storage.descriptions.inMemory',
          )}`}
          onChange={(event) => setStorage(event.target.value)}
        />
      </FlexBox>
    </>
  );
}
