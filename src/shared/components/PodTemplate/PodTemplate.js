import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Labels } from '../Labels/Labels';
import { ContainersPanel, Volume } from './components';
import { Panel, Title, Toolbar } from '@ui5/webcomponents-react';

import './PodTemplate.scss';

export function PodTemplate({ template }) {
  const { t } = useTranslation();

  const header = (
    <Toolbar style={{ height: '10vh' }}>
      <Title level="H5">{t('pods.labels.pod-template')}</Title>
      <Labels
        className="fd-margin-begin--tiny"
        labels={template.metadata.labels}
      />
    </Toolbar>
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
          <Panel
            fixed
            className="fd-margin--md"
            header={
              <Toolbar style={{ height: '10vh' }}>
                <Title level="H5">{t('pods.labels.volumes')}</Title>
                <Labels
                  className="fd-margin-begin--tiny"
                  labels={template.metadata.labels}
                />
              </Toolbar>
            }
          >
            {template.spec.volumes.map(volume => (
              <Volume key={volume.name} volume={volume} />
            ))}
          </Panel>
        </>
      )}
    </>
  );

  return (
    <Panel fixed className="fd-margin--md" key="pod-template" header={header}>
      {body}
    </Panel>
  );
}
