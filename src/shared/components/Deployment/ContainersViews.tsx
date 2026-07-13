import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import { Containers } from './Containers';

import jp from 'jsonpath';
import {
  getDescription,
  getPartialSchema,
  SchemaContext,
} from 'shared/helpers/schema';
import { useContext } from 'react';

type AdvancedContainersViewProps = {
  resource: Record<string, any>;
  setResource: (resource: Record<string, any>) => void;
  onChange: (event: Event) => void;
  namespace: string;
  createContainerTemplate: () => Record<string, any>;
};

export function AdvancedContainersView({
  resource,
  setResource,
  onChange,
  namespace,
  createContainerTemplate,
}: AdvancedContainersViewProps) {
  const { t } = useTranslation();
  const schema = useContext(SchemaContext);

  const imgPullSecretsDesc = getDescription(
    schema,
    'spec.template.spec.imagePullSecrets',
  );
  const containersDesc = getDescription(
    schema,
    `spec.template.spec.containers`,
  );

  const containerSchema = getPartialSchema(
    schema,
    'spec.template.spec.containers',
  );

  return (
    <ResourceForm.Wrapper resource={resource} setResource={setResource as any}>
      <ResourceForm.CollapsibleSection
        title={t('deployments.create-modal.image-pull-secret')}
        resource={resource}
        setResource={setResource as any}
        tooltipContent={imgPullSecretsDesc}
      >
        <ResourceForm.FormField
          label={t('deployments.create-modal.image-pull-secret')}
          input={() => (
            <K8sResourceSelectWithUseGetList
              url={`/api/v1/namespaces/${namespace}/secrets`}
              onSelect={(secretName: string) => {
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
      <SchemaContext.Provider value={containerSchema as any}>
        <ResourceForm.CollapsibleSection
          title={t('deployments.create-modal.containers')}
          defaultOpen
          resource={resource}
          setResource={setResource as any}
          tooltipContent={containersDesc}
          actions={(setOpen) => (
            <Button
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
      </SchemaContext.Provider>
    </ResourceForm.Wrapper>
  );
}
