import React from 'react';
import { FormItem, FormLabel } from 'fundamental-react';
import { Dropdown, useGetList } from 'react-shared';
import { useTranslation } from 'react-i18next';

function useGetGatewaysQuery(namespace) {
  const ownNamespaceQuery = useGetList()(
    `/apis/networking.istio.io/v1alpha1/namespaces/${namespace}/gateways`,
    { pollingInterval: 8000 },
  );
  const kymaSystemNamespaceQuery = useGetList()(
    '/apis/networking.istio.io/v1alpha1/namespaces/kyma-system/gateways',
    { pollingInterval: 9000, skip: namespace === 'kyma-system' },
  );

  const gateways = [
    ...(ownNamespaceQuery?.data || []),
    ...(kymaSystemNamespaceQuery?.data || []),
  ];
  const loading = ownNamespaceQuery.loading || kymaSystemNamespaceQuery.loading;
  const error = ownNamespaceQuery.error || kymaSystemNamespaceQuery.error;

  return { gateways, loading, error };
}

export function GatewayDropdown({ namespace, gateway, setGateway }) {
  const { t } = useTranslation();
  const formatGateway = gateway =>
    gateway ? `${gateway.metadata.namespace}/${gateway.metadata.name}` : '';

  const { gateways, loading, error } = useGetGatewaysQuery(namespace);

  const options = (gateways || []).map(gateway => ({
    key: formatGateway(gateway),
    text: formatGateway(gateway),
    gateway,
  }));

  const getValidationState = () => {
    if (error) {
      return {
        state: 'error',
        text: t('common.messages.error', { error: error.message }),
      };
    } else if (loading) {
      return {
        state: 'information',
        text: t('common.headers.loading'),
      };
    } else {
      return null;
    }
  };

  return (
    <FormItem>
      <FormLabel>{t('api-rules.form.gateway')}</FormLabel>
      <Dropdown
        id="gateway-dropdown"
        options={options}
        selectedKey={formatGateway(gateway)}
        onSelect={(_, { gateway }) => setGateway(gateway)}
        validationState={getValidationState()}
      />
    </FormItem>
  );
}
