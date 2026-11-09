import { useTranslation } from 'react-i18next';

import { Labels } from '../Labels/Labels';
import { ContainerFields, VolumeFields } from './components';
import { Card, CardHeader, FormGroup, Text } from '@ui5/webcomponents-react';
import { PodTemplateRow } from './PodTemplateRow';
import { ResourceDetailsForm } from '../ResourceDetails/ResourceDetailsForm';

import './PodTemplate.scss';

export function PodTemplate({ template }: { template: any }) {
  const { t } = useTranslation();

  return (
    <Card
      accessibleName={t('pods.labels.pod-template')}
      className="pod-template"
      key="pod-template"
      header={<CardHeader titleText={t('pods.labels.pod-template')} />}
    >
      <ResourceDetailsForm>
        <FormGroup>
          <PodTemplateRow
            label={t('pods.labels.restart-policy')}
            component={<Text>{template.spec.restartPolicy}</Text>}
          />
          <PodTemplateRow
            label={t('common.headers.labels')}
            component={<Labels labels={template.metadata.labels} />}
          />
        </FormGroup>
        {template.spec.containers?.map((container: Record<string, any>) => (
          <FormGroup
            key={container.name}
            headerLevel="H4"
            headerText={container.name}
          >
            <ContainerFields container={container} />
          </FormGroup>
        ))}
        {template.spec.initContainers?.map((container: Record<string, any>) => (
          <FormGroup
            key={container.name}
            headerLevel="H4"
            headerText={`${container.name} (${t('pods.labels.init-container')})`}
          >
            <ContainerFields container={container} />
          </FormGroup>
        ))}
        {template.spec.volumes?.map((volume: any) => (
          <FormGroup
            key={volume.name}
            headerLevel="H4"
            headerText={volume.name}
          >
            <VolumeFields volume={volume} />
          </FormGroup>
        ))}
      </ResourceDetailsForm>
    </Card>
  );
}
