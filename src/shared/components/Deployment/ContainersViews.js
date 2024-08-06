import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import { Containers } from './Containers';

import * as jp from 'jsonpath';
import { enhanceLink, getDescription } from 'shared/helpers/crd';

export function AdvancedContainersView({
  resource,
  setResource,
  onChange,
  namespace,
  createContainerTemplate,
  schema,
}) {
  const { t } = useTranslation();
  const imgPullSecretsDesc = getDescription(
    schema,
    'spec.template.spec.imagePullSecrets',
  );
  const containersDesc = getDescription(
    schema,
    `spec.template.spec.containers`,
  );

  return (
    <ResourceForm.Wrapper resource={resource} setResource={setResource}>
      <ResourceForm.CollapsibleSection
        title={t('deployments.create-modal.image-pull-secret')}
        resource={resource}
        setResource={setResource}
        tooltipContent={imgPullSecretsDesc}
      >
        <ResourceForm.FormField
          label={t('deployments.create-modal.image-pull-secret')}
          input={() => (
            <K8sResourceSelectWithUseGetList
              url={`/api/v1/namespaces/${namespace}/secrets`}
              onSelect={secretName => {
                jp.value(
                  resource,
                  '$.spec.template.spec.imagePullSecrets[0].name',
                  secretName,
                );
                setResource({ ...resource });
              }}
              resourceType={t('secrets.name_singular')}
              value={
                jp.value(
                  resource,
                  '$.spec.template.spec.imagePullSecrets[0].name',
                ) ?? ''
              }
            />
          )}
        />
      </ResourceForm.CollapsibleSection>

      <ResourceForm.CollapsibleSection
        title={t('deployments.create-modal.containers')}
        defaultOpen
        resource={resource}
        setResource={setResource}
        tooltipContent={containersDesc}
        actions={setOpen => (
          <Button
            icon="add"
            onClick={() => {
              const path = '$.spec.template.spec.containers';
              const nextContainers = [
                ...(jp.value(resource, path) || []),
                createContainerTemplate(),
              ];
              jp.value(resource, path, nextContainers);

              setResource({ ...resource });
              onChange(new Event('input', { bubbles: true }));
              setOpen(true);
            }}
            design="Transparent"
          >
            {t('deployments.create-modal.add-container')}
          </Button>
        )}
      >
        <Containers propertyPath="$.spec.template.spec.containers" />
      </ResourceForm.CollapsibleSection>
    </ResourceForm.Wrapper>
  );
}
