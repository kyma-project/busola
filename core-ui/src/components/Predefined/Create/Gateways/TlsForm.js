import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { Checkbox, Select, FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { TSL_MODES } from './helpers';

const setTlsValue = (server, variableName, value, servers, setServers) => {
  if (value === null) {
    delete server.port[variableName];
  } else {
    if (!server.tls) {
      server.tls = {};
    }
    server.tls[variableName] = value;
  }
  setServers([...servers]);
};

export const switchTLS = (server, tlsOn, servers, setServers) => {
  if (tlsOn) {
    server.tls = { ...server.tls };
  } else {
    delete server.tls;
  }

  setServers([...servers]);
};

export const TlsForm = ({ disabled = false, server, servers, setServers }) => {
  const { t } = useTranslation();

  const resourceOptions = TSL_MODES.map(mode => ({
    key: mode,
    text: mode,
  }));
  return (
    <CreateForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.tls.tls')}
      defaultOpen
      disabled={disabled}
      actions={
        <Checkbox
          compact
          checked={!!server.tls}
          onChange={() => switchTLS(server, !server.tls, servers, setServers)}
          dir="rtl"
        >
          {t('gateways.create-modal.advanced.enable-tls')}
        </Checkbox>
      }
    >
      <CreateForm.FormField
        label={
          <FormLabel required={!!server.tls}>
            {t('gateways.create-modal.advanced.tls.mode')}
          </FormLabel>
        }
        input={
          <Select
            compact
            required={!!server.tls}
            onSelect={(_, selected) => {
              setTlsValue(server, 'mode', selected.key, servers, setServers);
            }}
            selectedKey={server.tls?.mode || ''}
            options={resourceOptions}
            disabled={!server.tls}
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.tls.mode',
            )}
          ></Select>
        }
      />
      <CreateForm.FormField
        label={
          <FormLabel required={!!server.tls}>
            {t('gateways.create-modal.advanced.tls.credentialName')}
          </FormLabel>
        }
        input={
          <FormInput
            type="text"
            disabled={!server.tls}
            required={!!server.tls}
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.tls.credentialName',
            )}
            value={server.tls?.credentialName || ''}
            onChange={e =>
              setTlsValue(
                server,
                'credentialName',
                e.target.value || '',
                servers,
                setServers,
              )
            }
          />
        }
      />
    </CreateForm.CollapsibleSection>
  );
};
