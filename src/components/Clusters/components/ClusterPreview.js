import { Button, FlexBox, RadioButton, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import './ClusterPreview.scss';
import { spacing } from '@ui5/webcomponents-react-base';

export function ClusterPreview({ token, kubeconfig, storage }) {
  const { t } = useTranslation();

  return (
    <>
      <Title level="H5" style={spacing.sapUiMediumMarginBottom}>
        {t('clusters.wizard.review')}
      </Title>
      <Title
        level="H5"
        className="cluster-preview__subtitle"
        style={spacing.sapUiSmallMarginTopBottom}
      >{`1. ${t('clusters.wizard.storage')}`}</Title>
      <p className="cluster-wizard__storage-preference">Kubeconfig:</p>
      <div
        className="cluster-preview__content"
        style={{
          ...spacing.sapUiMediumMarginBottom,
          ...spacing.sapUiTinyMarginTop,
        }}
      >
        <div>{}</div>
        <Button design="Transparent">Edit</Button>
      </div>
      <Title
        level="H5"
        className="cluster-preview__subtitle"
        style={spacing.sapUiSmallMarginTopBottom}
      >{`2. ${t('clusters.wizard.storage')}`}</Title>
      <p className="cluster-wizard__storage-preference">
        {`${t('clusters.token')}:`}
      </p>
      <div
        className="cluster-preview__content"
        style={{
          ...spacing.sapUiMediumMarginBottom,
          ...spacing.sapUiTinyMarginTop,
        }}
      >
        <div className="cluster-preview__token">
          {typeof token === 'string' ? token : ''}
        </div>
        <Button design="Transparent">Edit</Button>
      </div>
      <Title
        level="H5"
        className="cluster-preview__subtitle"
        style={spacing.sapUiSmallMarginTopBottom}
      >{`3. ${t('clusters.wizard.storage')}`}</Title>
      <p className="cluster-wizard__storage-preference">
        {`${t('clusters.storage.storage-preference')}:`}
      </p>
      <div
        className="cluster-preview__content"
        style={{
          ...spacing.sapUiMediumMarginBottom,
          ...spacing.sapUiTinyMarginTop,
        }}
      >
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
        <Button design="Transparent">Edit</Button>
      </div>
    </>
  );
}
