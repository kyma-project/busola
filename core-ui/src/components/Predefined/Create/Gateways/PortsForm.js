import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { FormLabel, FormInput, Select } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { PROTOCOLS } from './helpers';
import { switchTLS } from './TlsForm';

export const PortsForm = ({
  disabled = false,
  server,
  servers,
  setServers,
}) => {
  const { t } = useTranslation();

  const setPortValue = (server, variableName, value) => {
    const newPortValue = server;
    if (value === null) {
      delete newPortValue.port[variableName];
    } else {
      newPortValue.port[variableName] = value;
    }

    setServers([...servers]);
  };

  return (
    <CreateForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.port.ports')}
      defaultOpen
      disabled={disabled}
    >
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.port.number')}
          </FormLabel>
        }
        input={
          <FormInput
            type="number"
            required
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.port.number',
            )}
            value={server.port?.number}
            onChange={e =>
              setPortValue(server, 'number', e.target.valueAsNumber || '')
            }
          />
        }
      />
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.port.protocol')}
          </FormLabel>
        }
        input={
          <Select
            compact
            onSelect={(_, selected) => {
              setPortValue(server, 'protocol', selected.key);
              if (selected.key === 'HTTP') {
                switchTLS(server, false, servers, setServers);
              } else {
                switchTLS(server, true, servers, setServers);
              }
            }}
            selectedKey={server.port?.protocol || ''}
            options={PROTOCOLS.map(mode => ({
              key: mode,
              text: mode,
            }))}
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.port.protocol',
            )}
          ></Select>
        }
      />
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.port.name')}
          </FormLabel>
        }
        input={
          <FormInput
            type="text"
            required
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.port.name',
            )}
            value={server.port?.name}
            onChange={e => setPortValue(server, 'name', e.target.value || '')}
          />
        }
      />

      <CreateForm.FormField
        label={
          <FormLabel>
            {t('gateways.create-modal.advanced.port.target-port')}
          </FormLabel>
        }
        input={
          <FormInput
            type="number"
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.port.target-port',
            )}
            value={server.port?.targetPort}
            onChange={e =>
              setPortValue(server, 'targetPort', e.target.valueAsNumber || null)
            }
          />
        }
      />
    </CreateForm.CollapsibleSection>
  );
};
