import React from 'react';
import { useGet, useMicrofrontendContext } from 'react-shared';

const apiGatewayUri =
  '/apis/networking.istio.io/v1beta1/namespaces/kyma-system/gateways/kyma-gateway';

export function useGetGatewayDomain() {
  const k8sApiUrl = useMicrofrontendContext().k8sApiUrl;

  const [domain, setDomain] = React.useState(
    (k8sApiUrl || '').replace('api.', ''),
  );
  const [loading, setLoading] = React.useState(!domain);
  const [error, setError] = React.useState(null);

  const { error: getError, loading: getLoading, data } = useGet(apiGatewayUri, {
    skip: !!domain,
  });
  React.useEffect(() => {
    if (!data) return;
    setError(getError);
    setLoading(getLoading);
    setDomain(data?.spec.servers[0].hosts[0].replace('*.', '') || '');
  }, [getError, getLoading, data]);

  return { domain, loading, error };
}
