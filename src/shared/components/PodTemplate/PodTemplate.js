import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Labels } from '../Labels/Labels';
import { ContainersPanel, Volume } from './components';
import { Title } from '@ui5/webcomponents-react';
import { UI5Panel } from '../UI5Panel/UI5Panel';

import { spacing } from '@ui5/webcomponents-react-base';
import './PodTemplate.scss';

export function PodTemplate({ template }) {
  const { t } = useTranslation();

  const header = (
    <>
      <Title level="H5">{t('pods.labels.pod-template')}</Title>
      <Labels
        style={spacing.sapUiTinyMarginBegin}
        labels={template.metadata.labels}
      />
    </>
  );

  const body = (
    <>
      <LayoutPanelRow
        name={t('pods.labels.restart-policy')}
        value={template.spec.restartPolicy}
      />
      {template.spec.containers && (
        <ContainersPanel
          title={t('pods.labels.containers')}
          containers={template.spec.containers}
        />
      )}
      {template.spec.initContainers && (
        <ContainersPanel
          title={t('pods.labels.init-containers')}
          containers={template.spec.initContainers}
        />
      )}
      {template.spec.volumes && (
        <>
          <UI5Panel
            disableMargin
            title={
              <>
                <Title level="H5">{t('pods.labels.volumes')}</Title>
                <Labels
                  labels={template.metadata.labels}
                  style={spacing.sapUiTinyMarginBegin}
                />
              </>
            }
          >
            {template.spec.volumes.map(volume => (
              <Volume key={volume.name} volume={volume} />
            ))}
          </UI5Panel>
        </>
      )}
    </>
  );

  return (
    <UI5Panel key="pod-template" title={header}>
      {body}
    </UI5Panel>
  );
}
