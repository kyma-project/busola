import React from 'react';
import { Select } from 'shared/components/Select/Select';
import { useTranslation } from 'react-i18next';
import { PROTOCOLS, DEFAULT_PORTS, isTLSProtocol } from './../helpers';
import { switchTLS } from './TlsForm';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

export const PortsForm = ({ server = {}, servers, setServers }) => {
  const { t } = useTranslation();

  const onProtocolSelect = (_, selected) => {
    server.port.protocol = selected.key;

    if (DEFAULT_PORTS[selected.key]) {
      server.port.number = DEFAULT_PORTS[selected.key];
    }

    setServers([...servers]);

    switchTLS(server, isTLSProtocol(selected.key), servers, setServers);
  };

  return (
    <ResourceForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.port.ports')}
      defaultOpen
      resource={server}
      setResource={() => setServers([...servers])}
    >
      <ResourceForm.FormField
        required
        label={t('gateways.create-modal.advanced.port.number')}
        propertyPath="$.port.number"
        input={Inputs.Port}
        placeholder={t(
          'gateways.create-modal.advanced.placeholders.port.number',
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
        required
        label={t('gateways.create-modal.advanced.port.name')}
        propertyPath="$.port.name"
        input={Inputs.Text}
        placeholder={t('gateways.create-modal.advanced.placeholders.port.name')}
      />

      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.tooltips.target-port')}
        label={t('gateways.create-modal.advanced.port.target-port')}
        propertyPath="$.port.targetPort"
        placeholder={t(
          'gateways.create-modal.advanced.placeholders.port.target-port',
        )}
        input={Inputs.Port}
      />
    </ResourceForm.CollapsibleSection>
  );
};
