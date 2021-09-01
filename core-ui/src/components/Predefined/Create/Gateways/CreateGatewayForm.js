import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { usePost, useNotification } from 'react-shared';
import {
  gatewayToYaml,
  yamlToGateway,
  createGatewayTemplate,
  createPresets,
} from './helpers';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';
import { useTranslation } from 'react-i18next';

export function CreateGatewayForm({ namespaceId, formElementRef, onChange }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const [gateway, setGateway] = useState(createGatewayTemplate(namespaceId));
  console.log('gateway', gateway);
  const createGateway = async () => {
    try {
      await postRequest(
        `/apis/networking.istio.io/v1alpha3/namespaces/${namespaceId}/gateways/`,
        gatewayToYaml(gateway),
      );
      notification.notifySuccess({
        content: t('gateways.create-modal.messages.success'),
      });
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/gateways/details/${gateway.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('gateways.create-modal.messages.failure'),
        content: e.message,
      });
      return false;
    }
  };

  return (
    <CreateForm
      title={t('gateways.create-modal.title')}
      simpleForm={<SimpleForm gateway={gateway} setGateway={setGateway} />}
      advancedForm={<AdvancedForm gateway={gateway} setGateway={setGateway} />}
      resource={gateway}
      setResource={setGateway}
      toYaml={gatewayToYaml}
      fromYaml={yamlToGateway}
      onCreate={createGateway}
      onChange={onChange}
      presets={createPresets(namespaceId, t)}
      formElementRef={formElementRef}
    />
  );
}
