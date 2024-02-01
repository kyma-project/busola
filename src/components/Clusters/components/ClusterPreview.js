import { FlexBox, RadioButton } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function ClusterPreview({ token, kubeconfig, storage }) {
  const { t } = useTranslation();

  return (
    <>
      <p className="cluster-wizard__storage-preference">Kubeconfig:</p>
      <div>{}</div>
      <p className="cluster-wizard__storage-preference">Token:</p>
      <div>{typeof token === 'string' ? token : ''}</div>
      <p className="cluster-wizard__storage-preference">Storage preference:</p>
      <FlexBox direction="Column">
        <RadioButton
          checked={storage === 'localStorage'}
          text={`${t('clusters.storage.labels.localStorage')}: ${t(
            'clusters.storage.descriptions.localStorage',
          )}`}
          disabled
        />
        <RadioButton
          checked={storage === 'sessionStorage'}
          text={`${t('clusters.storage.labels.sessionStorage')}: ${t(
            'clusters.storage.descriptions.sessionStorage',
          )}`}
          disabled
        />
        <RadioButton
          checked={storage === 'inMemory'}
          text={`${t('clusters.storage.labels.inMemory')}: ${t(
            'clusters.storage.descriptions.inMemory',
          )}`}
          disabled
        />
      </FlexBox>
    </>
  );
}
