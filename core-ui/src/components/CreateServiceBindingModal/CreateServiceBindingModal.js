import React from 'react';
import LuigiClient from '@luigi-project/client';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { Button } from 'fundamental-react';
import { usePost, useNotification } from 'react-shared';
import {
  serviceBindingToYaml,
  yamlToServiceBinding,
  createServiceBindingTemplate,
} from './helpers';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';
import { useTranslation } from 'react-i18next';

export function CreateServiceBindingModal({ namespaceId }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const [serviceBinding, setServiceBinding] = React.useState(
    createServiceBindingTemplate(namespaceId),
  );

  const createServiceBinding = async () => {
    try {
      await postRequest(
        `/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespaceId}/servicebindings/`,
        serviceBindingToYaml(serviceBinding),
      );

      notification.notifySuccess({
        content: t('common.create-modal.success', {
          resourceType: t('btp-service-bindings.resource-type'),
        }),
      });
      LuigiClient.linkManager()
        .fromContext('servicebindings')
        .navigate('details/' + serviceBinding.name);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('common.create-modal.failure', {
          resourceType: t('btp-service-bindings.resource-type'),
        }),
        content: e.message,
      });
      return false;
    }
  };

  return (
    <CreateModal
      title={t('btp-service-bindings.create.title')}
      simpleForm={
        <SimpleForm
          serviceBinding={serviceBinding}
          setServiceBinding={setServiceBinding}
          namespaceId={namespaceId}
        />
      }
      advancedForm={
        <AdvancedForm
          serviceBinding={serviceBinding}
          setServiceBinding={setServiceBinding}
          namespaceId={namespaceId}
        />
      }
      modalOpeningComponent={
        <Button glyph="add">{t('btp-service-bindings.create.title')}</Button>
      }
      resource={serviceBinding}
      setResource={setServiceBinding}
      onClose={() =>
        setServiceBinding(createServiceBindingTemplate(namespaceId))
      }
      toYaml={serviceBindingToYaml}
      fromYaml={yamlToServiceBinding}
      onCreate={createServiceBinding}
    />
  );
}
