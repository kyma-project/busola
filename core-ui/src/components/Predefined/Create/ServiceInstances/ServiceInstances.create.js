import React from 'react';
import LuigiClient from '@luigi-project/client';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { Button } from 'fundamental-react';
import { usePost, useNotification } from 'react-shared';
import {
  serviceInstanceToYaml,
  yamlToServiceInstance,
  createServiceInstanceTemplate,
} from './helpers.js';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm.js';
import { useTranslation } from 'react-i18next';

export function ServiceInstancesCreate(props) {
  return <ServiceInstancesForm namespaceId={props.namespace} {...props} />;
}

function ServiceInstancesForm({ namespaceId, formElementRef, onChange }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const [serviceInstance, setServiceInstance] = React.useState(
    createServiceInstanceTemplate(namespaceId),
  );

  const createServiceInstance = async () => {
    try {
      await postRequest(
        `/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespaceId}/serviceinstances/`,
        serviceInstanceToYaml(serviceInstance),
      );

      notification.notifySuccess({
        content: t('common.create-modal.messages.success', {
          resourceType: t('btp-instances.resource-type'),
        }),
      });
      LuigiClient.linkManager()
        .fromContext('serviceinstances')
        .navigate('details/' + serviceInstance.name);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('common.create-modal.messages.failure', {
          resourceType: t('btp-instances.resource-type'),
        }),
        content: e.message,
      });
      return false;
    }
  };

  return (
    <CreateForm
      simpleForm={
        <SimpleForm
          serviceInstance={serviceInstance}
          setServiceInstance={setServiceInstance}
        />
      }
      advancedForm={
        <AdvancedForm
          serviceInstance={serviceInstance}
          setServiceInstance={setServiceInstance}
        />
      }
      modalOpeningComponent={
        <Button glyph="add">{t('btp-instances.create.title')}</Button>
      }
      resource={serviceInstance}
      setResource={setServiceInstance}
      onClose={() =>
        setServiceInstance(createServiceInstanceTemplate(namespaceId))
      }
      toYaml={serviceInstanceToYaml}
      fromYaml={yamlToServiceInstance}
      onCreate={createServiceInstance}
      onChange={onChange}
      formElementRef={formElementRef}
    />
  );
}
