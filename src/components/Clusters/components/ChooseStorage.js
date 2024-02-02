import { FlexBox, RadioButton } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import './ChooseStorage.scss';

export function ChooseStorage({ storage, setStorage }) {
  const { t } = useTranslation();

  return (
    <>
      <p className="cluster-wizard__storage-preference">
        {t('clusters.storage.storage-preference')}
      </p>
      <FlexBox direction="Column">
        <RadioButton
          name="storage"
          value="localStorage"
          checked={storage === 'localStorage'}
          text={`${t('clusters.storage.labels.localStorage')}: ${t(
            'clusters.storage.descriptions.localStorage',
          )}`}
          onChange={event => setStorage(event.target.value)}
        />
        <RadioButton
          name="storage"
          value="sessionStorage"
          checked={storage === 'sessionStorage'}
          text={`${t('clusters.storage.labels.sessionStorage')}: ${t(
            'clusters.storage.descriptions.sessionStorage',
          )}`}
          onChange={event => setStorage(event.target.value)}
        />
        <RadioButton
          name="storage"
          value="inMemory"
          checked={storage === 'inMemory'}
          text={`${t('clusters.storage.labels.inMemory')}: ${t(
            'clusters.storage.descriptions.inMemory',
          )}`}
          onChange={event => setStorage(event.target.value)}
        />
      </FlexBox>
    </>
  );
}
