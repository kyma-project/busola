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
import { useTranslation } from 'react-i18next';

export function CreateDeploymentModal({ namespaceId, modalOpeningComponent }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const [deployment, setDeployment] = React.useState(
    createDeploymentTemplate(namespaceId),
  );

  modalOpeningComponent = modalOpeningComponent || (
    <Button glyph="add">{t('deployments.create-modal.title')}</Button>
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
        title: t('deployments.create-modal.messages.failure'),
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
      notification.notifySuccess({
        content: t('deployments.create-modal.messages.success'),
      });
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/deployments/details/${deployment.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('deployments.create-modal.messages.deployment-ok-service-bad'),
        content: e.message,
      });
    }
  };

  return (
    <CreateModal
      title={t('deployments.create-modal.title')}
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
      presets={createPresets(namespaceId, t)}
    />
  );
}
