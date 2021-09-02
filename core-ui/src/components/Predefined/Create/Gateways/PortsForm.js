import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

export const PortsForm = ({ disabled = false, index, server, setServers }) => {
  const { t } = useTranslation();
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
            onChange={e => {
              console.log('e', e.target.valueAsNumber);
              return setServers(servers => {
                console.log('e', e.target.valueAsNumber);
                const newServices = [
                  ...servers.slice(0, index),
                  {
                    ...server,
                    port: {
                      ...server.port,
                      number: e.target.valueAsNumber || '',
                    },
                  },
                  ...servers.slice(index + 1, servers.length),
                ];
                console.log('newServices', newServices);
                return newServices;
              });
              // setServers({ port: { number: e.target.valueAsNumber || '' } })
            }}
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
            onChange={e => setServers({ port: { name: e.target.value || '' } })}
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
              setServers({ port: { protocol: e.target.value || '' } })
            }
          />
        }
      />
    </CreateForm.CollapsibleSection>
  );
};
