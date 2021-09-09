import React from 'react';
import { LabelsInput } from 'components/Lambdas/components';
import { useTranslation } from 'react-i18next';
import { K8sNameInput, usePost } from 'react-shared';
import { ResourceForm } from './ResourceForm';
import {
  Button,
  FormFieldset,
  FormItem,
  FormLabel,
  Checkbox,
} from 'fundamental-react';
import * as jp from 'jsonpath';
import './AdvancedForm.scss';
import './Deployments.create.scss';

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

function createServiceTemplate(namespace) {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      selector: {
        app: '',
      },
      ports: [
        {
          protocol: 'TCP',
          port: 80,
          targetPort: 8080,
        },
      ],
    },
  };
}

export function DeploymentsCreate({ formElementRef, namespace, onChange }) {
  const postRequest = usePost();
  const { t, i18n } = useTranslation();

  const [deployment, setDeployment] = React.useState(
    createDeploymentTemplate(namespace),
  );
  const [service, setService] = React.useState(
    createServiceTemplate(namespace),
  );
  const [addService, setAddService] = React.useState(true);

  const serviceActions = (
    <Checkbox
      compact
      checked={addService}
      onChange={(_, checked) => setAddService(checked)}
      dir="rtl"
    >
      {t('deployments.create-modal.advanced.expose-service')}
    </Checkbox>
  );

  const renderEditor = ({ defaultEditor, Editor }) => (
    <div className="double-editor">
      <ResourceForm.CollapsibleSection title="Deployment" defaultOpen>
        {defaultEditor}
      </ResourceForm.CollapsibleSection>
      <ResourceForm.CollapsibleSection title="Service" actions={serviceActions}>
        <Editor
          resource={service}
          setResource={setService}
          readonly={!addService}
        />
      </ResourceForm.CollapsibleSection>
    </div>
  );

  const handleNameChange = name => {
    jp.value(deployment, '$.metadata.name', name);
    jp.value(deployment, '$.spec.template.spec.containers[0].name', name);
    jp.value(deployment, '$.spec.selector.matchLabels.app', name); // match labels
    jp.value(deployment, `$.spec.template.metadata.labels.app`, name); // pod labels
    setDeployment({ ...deployment });

    jp.value(service, '$.metadata.name', name);
    jp.value(service, '$.spec.selector.app', name);
    setService({ ...service });
  };

  return (
    <ResourceForm
      kind="deployment"
      resource={deployment}
      setResource={setDeployment}
      onChange={onChange}
      formElementRef={formElementRef}
      createFn={async () =>
        postRequest(
          `/apis/apps/v1/namespaces/${namespace}/deployments/`,
          deployment,
        )
      }
      renderEditor={renderEditor}
    >
      <ResourceForm.FormField
        required
        propertyPath="$.metadata.name"
        label={t('common.labels.name')}
        input={value => (
          <K8sNameInput
            kind="Deployment"
            compact
            required
            showLabel={false}
            onChange={e => handleNameChange(e.target.value)}
            value={value}
            i18n={i18n}
          />
        )}
      />
      <ResourceForm.FormField
        propertyPath="$.metadata.labels"
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
        propertyPath="$.metadata.annotations"
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
        propertyPath="$.spec.template.spec.containers[0].name"
        label="Container name"
        input={(value, setValue) => (
          <ResourceForm.Input
            required
            setValue={setValue}
            value={value}
            placeholder="Name of the first container"
          />
        )}
      />
      <ResourceForm.FormField
        required
        simple
        propertyPath="$.spec.template.spec.containers[0].image"
        label="Docker image"
        input={(value, setValue) => (
          <ResourceForm.Input
            required
            setValue={setValue}
            value={value}
            placeholder={t(
              'deployments.create-modal.simple.docker-image-placeholder',
            )}
          />
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
      <ResourceForm.CollapsibleSection
        advanced
        title="Service"
        resource={service}
        setResource={setService}
        actions={serviceActions}
      >
        <ResourceForm.FormField
          advanced
          propertyPath="$.spec.ports[0].port"
          label={t('deployments.create-modal.advanced.port')}
          input={(value, setValue) => (
            <ResourceForm.Input
              type="number"
              required
              placeholder={t(
                'deployments.create-modal.advanced.port-placeholder',
              )}
              disabled={!addService}
              value={value}
              onChange={e => setValue(e.target.valueAsNumber)}
            />
          )}
        />
        <ResourceForm.FormField
          advanced
          propertyPath="$.spec.ports[0].targetPort"
          label={t('deployments.create-modal.advanced.port')}
          input={(value, setValue) => (
            <ResourceForm.Input
              type="number"
              required
              placeholder={t(
                'deployments.create-modal.advanced.target-port-placeholder',
              )}
              disabled={!addService}
              value={value}
              onChange={e => setValue(e.target.valueAsNumber)}
            />
          )}
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
      title={'Container ' + (container.name || i + 1)}
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
