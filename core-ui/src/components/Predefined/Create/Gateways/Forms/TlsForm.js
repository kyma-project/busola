import React from 'react';
import {
  Checkbox,
  FormLabel,
  FormInput,
  MessageStrip,
} from 'fundamental-react';
import { Select } from 'shared/components/Select/Select';
import { useTranslation } from 'react-i18next';
import { TSL_MODES, validateTLS } from './../helpers';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import { useMicrofrontendContext } from 'react-shared';

const setTlsValue = (server, variableName, value, servers, setServers) => {
  if (value === null) {
    delete server.port[variableName];
  } else {
    if (!server.tls) {
      server.tls = { mode: 'SIMPLE' };
    }
    server.tls[variableName] = value;
  }
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

// generic Secret is type=Opaque
const filterMatchingSecrets = secret =>
  secret.type === 'Opaque' && 'key' in secret.data && 'cert' in secret.data;

export const TlsForm = ({ server, servers, setServers }) => {
  const { t } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();

  const resourceOptions = TSL_MODES.map(mode => ({
    key: mode,
    text: mode,
  }));

  const mode = server.tls?.mode;
  const hasTls = server?.port?.protocol === 'HTTPS';

  return (
    <ResourceForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.tls.tls')}
      defaultOpen={hasTls}
      disabled={!hasTls}
      actions={
        !hasTls && (
          <MessageStrip type="information">
            {t('gateways.create-modal.advanced.tls.disabled-for-non-https')}
          </MessageStrip>
        )
      }
    >
      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.advanced.mode-tooltip')}
        required={!!server.tls}
        label={t('gateways.create-modal.advanced.tls.mode')}
        input={() => (
          <Select
            compact
            onSelect={(_, selected) =>
              setTlsValue(server, 'mode', selected.key, servers, setServers)
            }
            selectedKey={mode}
            options={resourceOptions}
            fullWidth
          />
        )}
      />
      <ResourceForm.FormField
        label={t('gateways.create-modal.advanced.tls.http-redirect')}
        input={() => (
          <div className="fd-display-flex fd-justify-between">
            <FormLabel>
              {t(
                'gateways.create-modal.advanced.tls.http-redirect-description',
              )}
            </FormLabel>
            <Checkbox
              compact
              checked={server.httpsRedirect}
              ariaLabel={t('gateways.create-modal.advanced.tls.http-redirect')}
              onChange={() =>
                setTlsValue(
                  server,
                  'httpsRedirect',
                  !server.httpsRedirect,
                  servers,
                  setServers,
                )
              }
            />
          </div>
        )}
      />
      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.tooltips.credential-name')}
        label={t('gateways.create-modal.advanced.tls.credentialName')}
        input={() => (
          <K8sResourceSelectWithUseGetList
            url={`/api/v1/namespaces/${namespace}/secrets`}
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
        required
        label={t('gateways.create-modal.advanced.tls.server-certificate')}
        input={() => (
          <FormInput
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.tls.server-certificate',
            )}
            value={server.tls?.serverCertificate || ''}
            onChange={e =>
              setTlsValue(
                server,
                'serverCertificate',
                e.target.value || '',
                servers,
                setServers,
              )
            }
          />
        )}
      />
      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.tooltips.private-key')}
        required
        label={t('gateways.create-modal.advanced.tls.private-key')}
        input={() => (
          <FormInput
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.tls.private-key',
            )}
            value={server.tls?.privateKey || ''}
            onChange={e =>
              setTlsValue(
                server,
                'privateKey',
                e.target.value || '',
                servers,
                setServers,
              )
            }
          />
        )}
      />
      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.tooltips.ca-certificates')}
        required={mode === 'MUTUAL'}
        label={t('gateways.create-modal.advanced.tls.ca-certificates')}
        input={() => (
          <FormInput
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.tls.ca-certificates',
            )}
            value={server.tls?.caCertificates || ''}
            onChange={e =>
              setTlsValue(
                server,
                'caCertificates',
                e.target.value || '',
                servers,
                setServers,
              )
            }
          />
        )}
      />
      {!validateTLS(server) && (
        <MessageStrip type="warning" className="fd-margin-top--sm">
          {t('gateways.create-modal.advanced.tls.messages.invalid-tls-warning')}
        </MessageStrip>
      )}
    </ResourceForm.CollapsibleSection>
  );
};
