import React from 'react';
import { FormInput } from 'fundamental-react';
import { Select } from 'shared/components/Select/Select';
import { useTranslation } from 'react-i18next';
import { PROTOCOLS, DEFAULT_PORTS } from './../helpers';
import { switchTLS } from './TlsForm';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

export const PortsForm = ({
  disabled = false,
  server,
  servers,
  setServers,
}) => {
  const { t } = useTranslation();

  const setPortValue = (server, variableName, value) => {
    server.port[variableName] = value;
    setServers([...servers]);
  };

  const onProtocolSelect = (_, selected) => {
    setPortValue(server, 'protocol', selected.key);

    if (DEFAULT_PORTS[selected.key]) {
      setPortValue(server, 'number', DEFAULT_PORTS[selected.key]);
    }

    switchTLS(server, selected.key === 'HTTPS', servers, setServers);
  };

  return (
    <ResourceForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.port.ports')}
      defaultOpen
      disabled={disabled}
    >
      <ResourceForm.FormField
        required
        label={t('gateways.create-modal.advanced.port.number')}
        input={() => (
          <FormInput
            type="number"
            min={0}
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
        )}
      />
      <ResourceForm.FormField
        required
        tooltipContent={t('gateways.create-modal.tooltips.protocol')}
        label={t('gateways.create-modal.advanced.port.protocol')}
        input={() => (
          <Select
            compact
            onSelect={onProtocolSelect}
            selectedKey={server.port?.protocol || ''}
            options={PROTOCOLS.map(mode => ({
              key: mode,
              text: mode,
            }))}
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.port.protocol',
            )}
            fullWidth
          />
        )}
      />
      <ResourceForm.FormField
        label={t('gateways.create-modal.advanced.port.name')}
        input={() => (
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
        )}
      />

      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.tooltips.target-port')}
        label={t('gateways.create-modal.advanced.port.target-port')}
        input={() => (
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
        )}
      />
    </ResourceForm.CollapsibleSection>
  );
};
