import React from 'react';
import LuigiClient from '@luigi-project/client';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { LabelsInput } from 'components/Lambdas/components';
import {
  FormFieldset,
  FormLabel,
  FormInput,
  FormItem,
  Button,
} from 'fundamental-react';
import {
  K8sNameInput,
  Tooltip,
  TextFormItem,
  usePost,
  useNotification,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { merge } from 'lodash';
import {
  formatService,
  deploymentToYaml,
  yamlToDeployment,
  createDeploymentTemplate,
  presets,
  createPresets,
} from './helpers';

const SimpleForm = ({ deployment, setDeployment }) => {
  const { t, i18n } = useTranslation();

  return (
    <CreateModal.Section>
      <FormFieldset>
        <K8sNameInput
          id="name"
          kind="Deployment"
          onChange={e => setDeployment({ ...deployment, name: e.target.value })}
          className="fd-margin-bottom--sm"
          value={deployment.name}
          i18n={i18n}
        />
        <LabelsInput
          labels={deployment.labels}
          onChange={labels => setDeployment({ ...deployment, labels })}
        />
        <FormItem>
          <FormLabel htmlFor="docker-image" required>
            Docker image
          </FormLabel>
          <Tooltip content={t('namespaces.docker-image.tooltip')}>
            <FormInput
              id="docker-image"
              required
              placeholder="Enter Docker image"
              onChange={e =>
                setDeployment({ ...deployment, dockerImage: e.target.value })
              }
              className="fd-margin-bottom--sm"
              value={deployment.dockerImage}
            />
          </Tooltip>
        </FormItem>
      </FormFieldset>
    </CreateModal.Section>
  );
};

const AdvancedForm = ({ deployment, setDeployment }) => {
  const setServiceData = data => {
    setDeployment({
      ...merge(deployment, {
        serviceData: {
          ...data,
        },
      }),
    });
  };

  const serviceActions = (
    <label>
      Expose separate Service{' '}
      <input
        type="checkbox"
        checked={deployment.serviceData.create}
        onChange={() =>
          setServiceData({ create: !deployment.serviceData.create })
        }
      />
    </label>
  );

  const setLimits = limits => {
    setDeployment({
      ...deployment,
      limits: {
        ...deployment.limits,
        ...limits,
      },
    });
  };

  const setRequests = limits => {
    setDeployment({
      ...deployment,
      requests: {
        ...deployment.requests,
        ...limits,
      },
    });
  };

  const runtimeProfileForm = (
    <CreateModal.CollapsibleSection title="Runtime profile">
      <FormFieldset className="configuration-data__form">
        <FormItem>
          <FormLabel required>Memory requests</FormLabel>
          <FormInput
            required
            value={deployment.requests.memory}
            onChange={e => setRequests({ memory: e.target.value })}
          />
        </FormItem>
        <FormItem>
          <FormLabel required>Memory limits</FormLabel>
          <FormInput
            required
            value={deployment.limits.memory}
            onChange={e => setLimits({ memory: e.target.value })}
          />
        </FormItem>
      </FormFieldset>
      <FormFieldset className="configuration-data__form">
        <FormItem>
          <FormLabel required>CPU requests</FormLabel>
          <FormInput
            required
            value={deployment.requests.cpu}
            onChange={e => setRequests({ cpu: e.target.value })}
          />
        </FormItem>
        <FormItem>
          <FormLabel required>CPU limits</FormLabel>
          <FormInput
            required
            value={deployment.limits.cpu}
            onChange={e => setLimits({ cpu: e.target.value })}
          />
        </FormItem>
      </FormFieldset>
    </CreateModal.CollapsibleSection>
  );

  const serviceForm = (
    <CreateModal.CollapsibleSection title="Service" actions={serviceActions}>
      <FormFieldset>
        <TextFormItem
          type="number"
          inputKey="port"
          required
          label="Port"
          placeholder="Enter port"
          defaultValue={deployment.serviceData.port.port || 0}
          value={deployment.serviceData.port.port}
          inputProps={{ disabled: !deployment.serviceData.create }}
          onChange={e =>
            setServiceData({ port: { port: e.target.valueAsNumber } })
          }
        />
        <TextFormItem
          type="number"
          inputKey="target-port"
          required
          inputProps={{ disabled: !deployment.serviceData.create }}
          label="Target port"
          placeholder="Enter target port"
          defaultValue={deployment.serviceData.port.targetPort || 0}
          value={deployment.serviceData.port.targetPort}
          onChange={e =>
            setServiceData({ port: { targetPort: e.target.valueAsNumber } })
          }
        />
      </FormFieldset>
    </CreateModal.CollapsibleSection>
  );

  return (
    <>
      <SimpleForm deployment={deployment} setDeployment={setDeployment} />
      {serviceForm}
      {runtimeProfileForm}
    </>
  );
};

export function CreateDeploymentForm({
  namespaceId,
  modalOpeningComponent = <Button glyph="add">Create Deployment</Button>,
}) {
  const notification = useNotification();
  const postRequest = usePost();
  const [deployment, setDeployment] = React.useState(
    createDeploymentTemplate(namespaceId),
  );

  const createDeployment = async () => {
    let createdDeployment = null;
    try {
      createdDeployment = await postRequest(
        `/apis/apps/v1/namespaces/${namespaceId}/deployments/`,
        deploymentToYaml(deployment),
      );
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: 'Failed to create the Deployment',
        content: e.message,
      });
      return false;
    }
    const createdResourceUID = createdDeployment?.metadata?.uid;

    try {
      if (deployment.serviceData.create && createdResourceUID) {
        await postRequest(
          `/api/v1/namespaces/${namespaceId}/services`,
          formatService(deployment, createdResourceUID),
        );
      }
      notification.notifySuccess({ content: 'Deployment created' });
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/deployments/details/${deployment.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: 'Deployment created, failed to create the Service',
        content: e.message,
      });
    }
  };

  return (
    <CreateModal
      title="Create Deployment"
      simpleForm={
        <SimpleForm deployment={deployment} setDeployment={setDeployment} />
      }
      advancedForm={
        <AdvancedForm deployment={deployment} setDeployment={setDeployment} />
      }
      modalOpeningComponent={modalOpeningComponent}
      resource={deployment}
      setResource={setDeployment}
      onClose={() => setDeployment(createDeploymentTemplate(namespaceId))}
      toYaml={deploymentToYaml}
      fromYaml={yamlToDeployment}
      onCreate={createDeployment}
      presets={createPresets(namespaceId)}
    />
  );
}
