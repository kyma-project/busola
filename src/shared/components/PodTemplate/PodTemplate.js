import { useTranslation } from 'react-i18next';

import { Labels } from '../Labels/Labels';
import { ContainersPanel, VolumesPanel } from './components';
import { Card, CardHeader, Text } from '@ui5/webcomponents-react';
import { PodTemplateRow } from './PodTemplateRow';

import './PodTemplate.scss';

export function PodTemplate({ template }) {
  const { t } = useTranslation();

  return (
    <div className="sap-margin-x-small sap-margin-bottom-small">
      <Card
        className="pod-template"
        key="pod-template"
        header={<CardHeader titleText={t('pods.labels.pod-template')} />}
      >
        <PodTemplateRow
          label={t('pods.labels.restart-policy')}
          component={<Text>{template.spec.restartPolicy}</Text>}
        />
        <PodTemplateRow
          label={t('common.headers.labels')}
          component={<Labels labels={template.metadata.labels} />}
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
          <VolumesPanel
            title={t('pods.labels.volumes')}
            labels={template.metadata.labels}
            volumes={template.spec.volumes}
          />
        )}
      </Card>
    </div>
  );
}
