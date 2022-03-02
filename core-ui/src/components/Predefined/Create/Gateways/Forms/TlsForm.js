import React from 'react';
import { Switch, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import {
  TSL_MODES,
  TLS_VERSIONS,
  validateTLS,
  isTLSProtocol,
  isHTTPProtocol,
} from './../helpers';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import * as Inputs from 'shared/ResourceForm/inputs';

const HttpTlsForm = ({ server, servers, setServers }) => {
  const handleHttpsRedirect = () => {
    if (!server?.tls) {
      server['tls'] = {
        httpsRedirect: true,
      };
    } else {
      server.tls = undefined;
    }
  };

  const { t } = useTranslation();
  return (
    <ResourceForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.tls.tls')}
      resource={server}
      defaultOpen={true}
      setResource={() => setServers([...servers])}
    >
      <ResourceForm.FormField
        label={t('gateways.create-modal.advanced.tls.https-redirect')}
        tooltipContent={t(
          'gateways.create-modal.advanced.tls.https-redirect-description',
        )}
        input={() => (
          <Switch
            compact
            onChange={handleHttpsRedirect}
            checked={server.tls?.httpsRedirect}
          />
        )}
      />
    </ResourceForm.CollapsibleSection>
  );
};

const setTlsValue = (server, variableName, value, servers, setServers) => {
  server.tls[variableName] = value;

  setServers([...servers]);
};

export const switchTLS = (server, tlsOn, servers, setServers) => {
  if (tlsOn) {
    server.tls = { mode: 'SIMPLE', ...server.tls };
  } else {
    delete server.tls;
  }

  setServers([...servers]);
};

// generic Secret either type=Opaque and have cert data or type=kubernetes.io/tls
const filterMatchingSecrets = secret =>
  secret.type === 'kubernetes.io/tls' ||
  (secret.type === 'Opaque' && 'key' in secret.data && 'cert' in secret.data);

export const TlsForm = ({ server = {}, servers, setServers, isAdvanced }) => {
  const { t } = useTranslation();

  const resourceOptions = TSL_MODES.map(mode => ({
    key: mode,
    text: mode,
  }));

  const tlsVersions = Object.entries(TLS_VERSIONS).map(([key, text]) => ({
    key,
    text,
  }));

  const mode = server.tls?.mode;
  const hasTls = isTLSProtocol(server?.port?.protocol);

  const panelActions = !hasTls && (
    <MessageStrip type="information">
      {t('gateways.create-modal.advanced.tls.disabled-for-non-https')}
    </MessageStrip>
  );

  const isHTTP = isHTTPProtocol(server?.port?.protocol);
  if (isHTTP) {
    return (
      <HttpTlsForm server={server} servers={servers} setServers={setServers} />
    );
  }

  return (
    <ResourceForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.tls.tls')}
      defaultOpen={hasTls}
      disabled={!hasTls}
      actions={panelActions}
      resource={server}
      setResource={() => setServers([...servers])}
      isAdvanced={isAdvanced}
    >
      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.advanced.mode-tooltip')}
        required={!!server.tls}
        label={t('gateways.create-modal.advanced.tls.mode')}
        propertyPath="$.tls.mode"
        input={Inputs.Dropdown}
        options={resourceOptions}
      />
      <ResourceForm.FormField
        advanced
        label={t('gateways.create-modal.advanced.tls.http-redirect')}
        tooltipContent={t(
          'gateways.create-modal.advanced.tls.http-redirect-description',
        )}
        input={() => (
          <Switch
            compact
            onChange={() =>
              setTlsValue(
                server,
                'httpsRedirect',
                !server.tls?.httpsRedirect,
                servers,
                setServers,
              )
            }
            checked={server.httpsRedirect}
          />
        )}
      />
      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.tooltips.credential-name')}
        label={t('gateways.create-modal.advanced.tls.credentialName')}
        input={() => (
          <K8sResourceSelectWithUseGetList
            url={`/api/v1/namespaces/istio-system/secrets`}
            filter={filterMatchingSecrets}
            onSelect={secretName =>
              setTlsValue(
                server,
                'credentialName',
                secretName,
                servers,
                setServers,
              )
            }
            onChange={e =>
              setTlsValue(
                server,
                'credentialName',
                e.target.value,
                servers,
                setServers,
              )
            }
            resourceType={t('secrets.name_singular')}
            value={server.tls?.credentialName || ''}
          />
        )}
      />
      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.tooltips.server-certificate')}
        label={t('gateways.create-modal.advanced.tls.server-certificate')}
        propertyPath="$.tls.serverCertificate"
        placeholder={t(
          'gateways.create-modal.advanced.placeholders.tls.server-certificate',
        )}
        input={Inputs.Text}
      />
      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.tooltips.private-key')}
        label={t('gateways.create-modal.advanced.tls.private-key')}
        propertyPath="$.tls.privateKey"
        placeholder={t(
          'gateways.create-modal.advanced.placeholders.tls.private-key',
        )}
        input={Inputs.Text}
      />
      <ResourceForm.FormField
        advaced
        tooltipContent={t('gateways.create-modal.tooltips.ca-certificates')}
        required={mode === 'MUTUAL'}
        label={t('gateways.create-modal.advanced.tls.ca-certificates')}
        propertyPath="$.tls.caCertificates"
        placeholder={t(
          'gateways.create-modal.advanced.placeholders.tls.ca-certificates',
        )}
        input={Inputs.Text}
      />
      <ResourceForm.FormField
        advanced
        label={t('gateways.create-modal.advanced.tls.min-protocol-version')}
        propertyPath="$.tls.minProtocolVersion"
        defaultValue="TLS_AUTO"
        input={Inputs.Dropdown}
        options={tlsVersions}
      />
      <ResourceForm.FormField
        advanced
        label={t('gateways.create-modal.advanced.tls.max-protocol-version')}
        propertyPath="$.tls.maxProtocolVersion"
        defaultValue="TLS_AUTO"
        input={Inputs.Dropdown}
        options={tlsVersions}
      />
      {!validateTLS(server) && (
        <div className="fd-col">
          <MessageStrip
            type="warning"
            className="fd-col-md--11 fd-margin-top--sm"
          >
            {t(
              'gateways.create-modal.advanced.tls.messages.invalid-tls-warning',
            )}
          </MessageStrip>
        </div>
      )}
    </ResourceForm.CollapsibleSection>
  );
};
