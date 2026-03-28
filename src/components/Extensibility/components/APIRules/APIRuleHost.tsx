import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { CopiableLink } from 'shared/components/ExternalLink/CopiableLink';
import { WidgetProps } from 'components/Extensibility/components/Widget';

type Gateway = {
  spec: {
    servers: {
      hosts: string[];
      port: {
        protocol: string;
      };
    }[];
  };
};
function getGatewayHost(gateway: Gateway | null) {
  if (!gateway || !gateway.spec) return null;

  const properServers = gateway.spec.servers.filter(
    (server) => server.port.protocol === 'HTTPS',
  );
  if (properServers.length > 0 && properServers[0].hosts?.length)
    return properServers[0].hosts[0].replace('*.', '');
  return null;
}

export const APIRuleHost = ({ value }: WidgetProps) => {
  const { t } = useTranslation();

  let hostname = value?.host;

  // regex is explained here: https://stackoverflow.com/questions/17986371/regular-expression-to-validate-fqdn-in-c-sharp-and-javascript
  const fqdnRegex =
    /^(?=.{1,254}$)((?=[a-z0-9-]{1,63}\.)(xn--+)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/i;
  const isFQDN = hostname?.match(fqdnRegex);
  const [gatewayName, gatewayNamespace] = value?.gateway
    ? value.gateway.split('.', 2)
    : [null, null];
  const gatewayUrl = `/apis/networking.istio.io/v1beta1/namespaces/${gatewayNamespace}/gateways/${gatewayName}`;

  const {
    data: gateway,
    error,
    loading,
  } = useGet(gatewayUrl, {
    skip: !(gatewayName && gatewayNamespace),
  }) as {
    data: Gateway | null;
    loading: boolean;
    error: Error | null;
  };

  if (!value) return t('common.headers.loading');
  if (!isFQDN) {
    if (loading) return t('common.headers.loading');
    if (error) return `${t('common.tooltips.error')} ${error.message}`;
    hostname = `${hostname}.${getGatewayHost(gateway)}`;
  }

  return <CopiableLink url={`https://${hostname}`} />;
};
