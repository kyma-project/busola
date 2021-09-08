import React from 'react';
import { LabelsInput } from 'components/Lambdas/components';
import { useTranslation } from 'react-i18next';
import { K8sNameInput, usePost } from 'react-shared';
import { ResourceForm } from './ResourceForm';
import { Button, FormFieldset, FormItem, FormLabel } from 'fundamental-react';
import * as jp from 'jsonpath';
import './AdvancedForm.scss';

function createContainerTemplate() {
  return {
    name: '',
    image: '',
    resources: {
      requests: {
        memory: '64Mi',
        cpu: '50m',
      },
      limits: {
        memory: '128Mi',
        cpu: '100m',
      },
    },
  };
}

export function createDeploymentTemplate(namespaceId) {
  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: '',
      namespace: namespaceId,
      labels: {},
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: '',
        },
      },
      template: {
        metadata: {
          labels: {
            app: '',
          },
        },
        spec: {
          containers: [createContainerTemplate()],
        },
      },
    },
  };
}

export function DeploymentsCreate({ formElementRef, namespace, onChange }) {
  const postRequest = usePost();
  const { t, i18n } = useTranslation();

  const [deployment, setDeployment] = React.useState(
    createDeploymentTemplate(namespace),
  );

  const renderEditor = ({ defaultEditor }) => (
    <>
      <FormLabel>Deployment</FormLabel>
      {defaultEditor}
      <FormLabel>Service</FormLabel>
      <p>service editor</p>
    </>
  );

  return (
    <ResourceForm
      kind="Deployment"
      resource={deployment}
      setResource={setDeployment}
      onChange={onChange}
      formElementRef={formElementRef}
      createFn={async () =>
        postRequest(`/api/v1/namespaces/${namespace}/deployments/`, deployment)
      }
      renderEditor={renderEditor}
    >
      <ResourceForm.FormField
        required
        yamlPath="$.metadata.name"
        label={t('common.labels.name')}
        input={(value, setValue) => (
          <K8sNameInput
            kind="Deployment"
            compact
            required
            showLabel={false}
            onChange={e => setValue(e.target.value)}
            value={value}
            i18n={i18n}
          />
        )}
      />
      <ResourceForm.FormField
        yamlPath="$.metadata.labels"
        label={t('common.headers.labels')}
        input={(value, setValue) => (
          <LabelsInput
            compact
            showFormLabel={false}
            labels={value}
            onChange={labels => setValue(labels)}
            i18n={i18n}
          />
        )}
      />
      <ResourceForm.FormField
        advanced
        yamlPath="$.metadata.annotations"
        label={t('common.headers.annotations')}
        input={(value, setValue) => (
          <LabelsInput
            compact
            showFormLabel={false}
            labels={value}
            onChange={labels => setValue(labels)}
            i18n={i18n}
          />
        )}
      />
      <ResourceForm.FormField
        required
        simple
        yamlPath="$.spec.template.spec.containers[0].name"
        label="Container name"
        input={(value, setValue) => (
          <ResourceForm.Input required setValue={setValue} value={value} />
        )}
      />
      <ResourceForm.FormField
        required
        simple
        yamlPath="$.spec.template.spec.containers[0].image"
        label="Docker image"
        input={(value, setValue) => (
          <ResourceForm.Input required setValue={setValue} value={value} />
        )}
      />
      <ResourceForm.CollapsibleSection
        advanced
        title="Containers"
        defaultOpen
        resource={deployment}
        setResource={setDeployment}
        actions={
          <Button
            glyph="add"
            compact
            onClick={() => {
              const containers =
                jp.value(deployment, '$.spec.template.spec.containers') || [];
              containers.push(createContainerTemplate());
              jp.value(
                deployment,
                '$.spec.template.spec.containers',
                containers,
              );
              setDeployment({ ...deployment });
              setTimeout(() => {
                // todo
                onChange(new Event('input', { bubbles: true }));
              });
            }}
          >
            Add Container
          </Button>
        }
      >
        <Containers
          containers={deployment?.spec?.template?.spec?.containers || []}
          setContainers={containers => {
            jp.value(deployment, '$.spec.template.spec.containers', containers);
            setDeployment({ ...deployment });
          }}
        />
      </ResourceForm.CollapsibleSection>
    </ResourceForm>
  );
}

function Containers({ containers, setContainers }) {
  const { t } = useTranslation();

  const removeContainer = index => {
    setContainers(containers.filter((_, i) => index !== i));
  };

  return containers.map((container, i) => (
    <ResourceForm.CollapsibleSection
      key={i}
      title={container.name || 'Container ' + (i + 1)}
      actions={
        <Button glyph="delete" compact onClick={() => removeContainer(i)} />
      }
    >
      <ResourceForm.FormField
        label="Name"
        value={container.name}
        setValue={name => {
          container.name = name;
          setContainers([...containers]);
        }}
        required
        input={(value, onChange) => (
          <ResourceForm.Input required value={value} setValue={onChange} />
        )}
      />
      <ResourceForm.FormField
        label="Image"
        value={container.image}
        setValue={image => {
          container.image = image;
          setContainers([...containers]);
        }}
        required
        input={(value, onChange) => (
          <ResourceForm.Input required value={value} setValue={onChange} />
        )}
        className="fd-margin-bottom--md"
      />

      <ResourceForm.CollapsibleSection
        title={t('deployments.create-modal.advanced.runtime-profile')}
      >
        <FormFieldset className="runtime-profile-form">
          <FormItem>
            <FormLabel required>
              {t('deployments.create-modal.advanced.memory-requests')}
            </FormLabel>
            <ResourceForm.Input
              required
              value={jp.value(container, '$.resources.requests.memory') || ''}
              setValue={memory => {
                jp.value(container, '$.resources.requests.memory', memory);
                setContainers([...containers]);
              }}
            />
          </FormItem>
          <FormItem>
            <FormLabel required>
              {t('deployments.create-modal.advanced.memory-limits')}
            </FormLabel>
            <ResourceForm.Input
              required
              value={jp.value(container, '$.resources.limits.memory') || ''}
              setValue={memory => {
                jp.value(container, '$.resources.limits.memory', memory);
                setContainers([...containers]);
              }}
            />
          </FormItem>
        </FormFieldset>
        <FormFieldset className="runtime-profile-form">
          <FormItem>
            <FormLabel required>
              {t('deployments.create-modal.advanced.cpu-requests')}
            </FormLabel>
            <ResourceForm.Input
              required
              value={jp.value(container, '$.resources.requests.cpu') || ''}
              setValue={cpu => {
                jp.value(container, '$.resources.requests.cpu', cpu);
                setContainers([...containers]);
              }}
            />
          </FormItem>
          <FormItem>
            <FormLabel required>
              {t('deployments.create-modal.advanced.cpu-limits')}
            </FormLabel>
            <ResourceForm.Input
              required
              value={jp.value(container, '$.resources.limits.cpu') || ''}
              setValue={cpu => {
                jp.value(container, '$.resources.limits.cpu', cpu);
                setContainers([...containers]);
              }}
            />
          </FormItem>
        </FormFieldset>
      </ResourceForm.CollapsibleSection>
    </ResourceForm.CollapsibleSection>
  ));
}
