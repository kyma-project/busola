import { Button, FlexBox, RadioButton, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import './ClusterPreview.scss';
import { spacing } from '@ui5/webcomponents-react-base';

export function ClusterPreview({
  token,
  kubeconfig,
  storage,
  setSelected,
  hasAuth,
}) {
  const { t } = useTranslation();
  /*const radioButtons = document.getElementsByClassName(
    'cluster-preview__storage',
  );

  for (let i = 0; i < radioButtons?.length; i++) {
    const element = radioButtons[i]?.shadowRoot?.querySelector(
      '.ui5-radio-root',
    );

    if (element) {
      element.style['opacity'] = '0.7';

     /* const circle = element.querySelector('.ui5-radio-svg-outer');
      if (circle) {
        circle.style['fill'] = 'var(--sapButton_Lite_Hover_Background)';
      }

      const checkedCircle = element.querySelector(
        ':host([checked]) .ui5-radio-svg-inner',
      );
      if (checkedCircle) {
        checkedCircle.style['fill'] = 'var(--sapList_TextColor)';
      }
    }
  }*/

  return (
    <div className="cluster-preview add-cluster__content-container">
      <Title level="H5" style={spacing.sapUiMediumMarginBottom}>
        {t('clusters.wizard.review')}
      </Title>
      <Title
        level="H5"
        className="cluster-preview__subtitle"
        style={spacing.sapUiSmallMarginTopBottom}
      >{`1. ${t('configuration.title')}`}</Title>
      <p className="cluster-wizard__storage-preference">Kubeconfig:</p>
      <div
        className="cluster-preview__content"
        style={{
          ...spacing.sapUiMediumMarginBottom,
          ...spacing.sapUiTinyMarginTop,
        }}
      >
        <div>{kubeconfig?.['current-context']}</div>
        <Button design="Transparent" onClick={() => setSelected(1)}>
          Edit
        </Button>
      </div>
      <Title
        level="H5"
        className="cluster-preview__subtitle"
        style={spacing.sapUiSmallMarginTopBottom}
      >{`2. ${t('clusters.wizard.authentication')}`}</Title>
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
          {typeof token === 'string' ? token : 'None'}
        </div>
        <Button
          design="Transparent"
          onClick={() => (hasAuth ? setSelected(1) : setSelected(2))}
        >
          Edit
        </Button>
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
            className="cluster-preview__storage"
          />
          <RadioButton
            checked={storage === 'sessionStorage'}
            text={`${t('clusters.storage.labels.sessionStorage')}: ${t(
              'clusters.storage.descriptions.sessionStorage',
            )}`}
            disabled
            className="cluster-preview__storage"
          />
          <RadioButton
            checked={storage === 'inMemory'}
            text={`${t('clusters.storage.labels.inMemory')}: ${t(
              'clusters.storage.descriptions.inMemory',
            )}`}
            disabled
            className="cluster-preview__storage"
          />
        </FlexBox>
        <Button
          design="Transparent"
          onClick={() => {
            hasAuth ? setSelected(2) : setSelected(3);
          }}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}
