import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

export const PortsForm = ({ disabled = false, index, server, setServers }) => {
  const { t } = useTranslation();

  const setPortValue = (server, variableName, value) => {
    const newPortValue = server;
    if (value === null) {
      delete newPortValue.port[variableName];
    } else {
      newPortValue.port[variableName] = value;
    }

    setServers(servers => [
      ...servers.slice(0, index),
      newPortValue,
      ...servers.slice(index + 1, servers.length),
    ]);
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
            value={server.port.number}
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
          <FormInput
            type="text"
            required
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.port.protocol',
            )}
            value={server.port.protocol}
            onChange={e =>
              setPortValue(server, 'protocol', e.target.value || '')
            }
          />
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
            value={server.port.name}
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
            value={server.port.targetPort}
            onChange={e =>
              setPortValue(server, 'targetPort', e.target.valueAsNumber || null)
            }
          />
        }
      />
    </CreateForm.CollapsibleSection>
  );
};
