import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Labels } from '../Labels/Labels';
import { ContainersPanel, Volume } from './components';
import './PodTemplate.scss';

export function PodTemplate({ template }) {
  const { t } = useTranslation();

  const header = (
    <LayoutPanel.Header>
      <LayoutPanel.Head title={t('pods.labels.pod-template')} />
      <Labels
        className="fd-margin-begin--tiny"
        labels={template.metadata.labels}
      />
    </LayoutPanel.Header>
  );

  const body = (
    <LayoutPanel.Body>
      <LayoutPanelRow
        name={t('pods.labels.restart-policy')}
        value={template.spec.restartPolicy}
      />
      <ContainersPanel
        title={t('pods.labels.constainers')}
        containers={template.spec.containers}
      />
      {template.spec.initContainers && (
        <ContainersPanel
          title={t('pods.labels.init-constainers')}
          containers={template.spec.initContainers}
        />
      )}
      {template.spec.volumes && (
        <>
          <LayoutPanel className="fd-margin--md">
            <LayoutPanel.Header>
              <LayoutPanel.Head title={t('pods.labels.volumes')} />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              {template.spec.volumes.map(volume => (
                <Volume key={volume.name} volume={volume} />
              ))}
            </LayoutPanel.Body>
          </LayoutPanel>
        </>
      )}
    </LayoutPanel.Body>
  );

  return (
    <LayoutPanel className="fd-margin--md" key="pod-template">
      {header}
      {body}
    </LayoutPanel>
  );
}
