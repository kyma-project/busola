import React from 'react';
import { FormItem, FormLabel } from 'fundamental-react';
import { Dropdown, useGetList } from 'react-shared';

function useGetGatewaysQuery(namespace) {
  const ownNamespaceQuery = useGetList()(
    `/apis/networking.istio.io/v1alpha3/namespaces/${namespace}/gateways`,
    { pollingInterval: 8000 },
  );
  const kymaSystemNamespaceQuery = useGetList()(
    '/apis/networking.istio.io/v1alpha3/namespaces/kyma-system/gateways',
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
  const toString = gateway =>
    gateway ? `${gateway.metadata.namespace}/${gateway.metadata.name}` : '';

  const gatewaysQuery = useGetGatewaysQuery(namespace);

  const options = (gatewaysQuery.gateways || []).map(gateway => ({
    key: toString(gateway),
    text: toString(gateway),
  }));

  const selectGateway = (_, selected) => {
    const [namespace, name] = selected.text.split('/');
    setGateway(
      gatewaysQuery.gateways.find(
        g => g.metadata.namespace === namespace && g.metadata.name === name,
      ),
    );
  };

  return (
    <FormItem>
      <FormLabel>Gateway</FormLabel>
      <Dropdown
        id="gateway-dropdown"
        options={options}
        selectedKey={toString(gateway)}
        onSelect={selectGateway}
      />
    </FormItem>
  );
}
