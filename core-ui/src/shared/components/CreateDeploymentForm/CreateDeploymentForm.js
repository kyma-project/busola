import React from 'react';
import LuigiClient from '@luigi-project/client';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { Button } from 'fundamental-react';
import { usePost, useNotification } from 'react-shared';
import {
  formatService,
  deploymentToYaml,
  yamlToDeployment,
  createDeploymentTemplate,
  createPresets,
} from './helpers';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';

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
