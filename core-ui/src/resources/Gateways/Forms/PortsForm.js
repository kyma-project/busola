import React from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import * as Inputs from 'shared/ResourceForm/inputs';
import { Select } from 'shared/components/Select/Select';
import { PROTOCOLS, DEFAULT_PORTS, isTLSProtocol } from './../helpers';
import { switchTLS } from './TlsForm';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField } from 'shared/ResourceForm/fields';

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

  const handleNameChange = name => {
    jp.value(server, '$.port.name', name);
    setServers([...servers]);
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
      <K8sNameField
        propertyPath="$.port.name"
        kind={t('gateways.aria-labels.port-name')}
        setValue={handleNameChange}
        className="fd-margin-bottom--sm"
        pattern=".*"
        showHelp={false}
      />

      <ResourceForm.FormField
        tooltipContent={t('gateways.create-modal.tooltips.target-port')}
        label={t('gateways.create-modal.advanced.port.target-port')}
        propertyPath="$.port.targetPort"
        input={Inputs.Port}
        ariaLabel={t('gateways.create-modal.advanced.port.target-port')}
      />
    </ResourceForm.CollapsibleSection>
  );
};
