import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

export function useGatewaysQuery(namespace) {
  const filterGateways = gateway =>
    gateway.metadata.namespace === namespace ||
    gateway.metadata.namespace === 'kyma-system';

  return useGetList(
    filterGateways,
  )(`/apis/networking.istio.io/v1beta1/gateways`, { pollingInterval: 7000 });
}

export function GatewayDropdown({
  gatewaysQuery,
  value: gateway,
  setValue: setGateway,
}) {
  const { t } = useTranslation();
  const { data: gateways, error, loading } = gatewaysQuery;

  const formatGatewayKey = gateway =>
    `${gateway.metadata.name}.${gateway.metadata.namespace}.svc.cluster.local`;

  useEffect(() => {
    // try to set kyma-system/kyma-gateway as default
    if (gateways && !gateway) {
      const findKymaGateway = ({ metadata }) =>
        metadata.namespace === 'kyma-system' &&
        metadata.name === 'kyma-gateway';

      const kymaGateway = gateways.find(findKymaGateway);
      if (kymaGateway) {
        setGateway(formatGatewayKey(kymaGateway));
      }
    }
  }, [gateways]); // eslint-disable-line react-hooks/exhaustive-deps

  const dropdownOptions = (gateways || []).map(gateway => ({
    key: formatGatewayKey(gateway),
    text: `${gateway.metadata.namespace}/${gateway.metadata.name}`,
  }));

  return (
    <ResourceForm.FormField
      advanced
      required
      propertyPath="$.spec.service"
      label={t('api-rules.form.gateway')}
      selectedKey={gateway}
      setValue={setGateway}
      input={Inputs.Dropdown}
      options={dropdownOptions}
      loading={loading}
      error={error}
    />
  );
}
