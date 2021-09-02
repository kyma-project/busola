import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { Dropdown, FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { TSL_MODE } from './helpers';

export const TslForm = ({ disabled = false, index, server, setServers }) => {
  const { t } = useTranslation();

  const setTslValue = (server, variableName, value) => {
    const newValue = server;
    if (value === null) {
      delete newValue.port[variableName];
    } else {
      newValue.tsl[variableName] = value;
    }

    setServers(servers => [
      ...servers.slice(0, index),
      newValue,
      ...servers.slice(index + 1, servers.length),
    ]);
  };

  const resourceOptions = TSL_MODE.map(mode => ({
    key: mode,
    text: mode,
  }));
  console.log('resourceOptions', resourceOptions);
  return (
    <CreateForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.tls.tls')}
      defaultOpen
      disabled={disabled}
    >
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.tls.mode')}
          </FormLabel>
        }
        input={
          <Dropdown
            placeholder={t(
              'gateways.create-modal.placeholders.advanced.tls.mode',
            )}
            compact
            id={`tsl-mode`}
            options={resourceOptions}
            onSelect={(_, selected) => {
              setTslValue(server, 'tsl', selected.key);
            }}
            selectedKey={''}
            // selectedKey={server.tls?.mode}
          />
        }
      />
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.tls.credentialName')}
          </FormLabel>
        }
        input={
          <FormInput
            type="text"
            required
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.tls.credentialName',
            )}
            value={server.tls.credentialName}
            onChange={e =>
              setServers({ tls: { credentialName: e.target.value || '' } })
            }
          />
        }
      />
    </CreateForm.CollapsibleSection>
  );
};
