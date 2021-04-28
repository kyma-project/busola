import React from 'react';
import LuigiClient from '@luigi-project/client';

import { usePost, useNotification } from 'react-shared';

import './CreateWorkloadForm.scss';
import BasicData from './BasicData';
import ServiceData from './ServiceData';
import ScalingData from './ScalingData';
import {
  formatDeployment,
  formatService,
  createDeploymentTemplate,
} from './helpers';

export default function CreateWorkloadForm({
  namespaceId,
  formElementRef,
  onChange,
}) {
  const postRequest = usePost();
  const [deployment, setDeployment] = React.useState(
    createDeploymentTemplate(namespaceId),
  );
  const notification = useNotification();

  const handleFormSubmit = async e => {
    e.preventDefault();
    let createdResource = null;
    try {
      createdResource = await postRequest(
        `/apis/apps/v1/namespaces/${namespaceId}/deployments/`,
        formatDeployment(deployment),
      );
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: 'Failed to create the Deployment',
        content: e.message,
      });
      return;
    }
    const createdResourceUID = createdResource?.metadata?.uid;

    try {
      if (deployment.createService && createdResourceUID) {
        await postRequest(
          `/api/v1/namespaces/${namespaceId}/services`,
          formatService(deployment, createdResourceUID),
        );
      }
      notification.notifySuccess({ title: 'Succesfully created Deployment' });
      LuigiClient.linkManager()
        .fromContext('namespaces')
        .navigate('/deployments');
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: 'Succesfully created Deployment, failed to create the Service',
        content: e.message,
      });
    }
  };

  return (
    <>
      <form
        onChange={onChange}
        ref={formElementRef}
        onSubmit={handleFormSubmit}
        className="create-workload-form"
      >
        <div>
          <BasicData deployment={deployment} setDeployment={setDeployment} />
          <ServiceData deployment={deployment} setDeployment={setDeployment} />
        </div>
        <ScalingData deployment={deployment} setDeployment={setDeployment} />
      </form>
      {/* <p className="create-workload-info fd-has-type-2 fd-has-color-status-4">
        For more advanced configuration options, use "Upload YAML" option.
      </p> */}
    </>
  );
}
