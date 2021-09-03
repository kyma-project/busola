import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { FormLabel } from 'fundamental-react';
import { StringInput, Tooltip } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const HostsForm = ({ disabled = false, index, server, setServers }) => {
  const { t } = useTranslation();
  const setValue = (server, value) => {
    const newPortValue = server;
    newPortValue.hosts = value;

    setServers(servers => [
      ...servers.slice(0, index),
      newPortValue,
      ...servers.slice(index + 1, servers.length),
    ]);
  };
  return (
    <CreateForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.hosts')}
      defaultOpen
      disabled={disabled}
    >
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.hosts')}
          </FormLabel>
        }
        input={
          <Tooltip
            content={t('gateways.create-modal.advanced.placeholders.hosts')}
          >
            <StringInput
              required
              compact
              stringList={server.hosts || []}
              onChange={hosts => setValue(server, hosts || [])}
              regexp={/^[^, ]+$/}
              placeholder={t(
                'gateways.create-modal.advanced.placeholders.hosts',
              )}
              id={`hosts-${disabled ? 'simple' : 'advanced'}`}
            />
          </Tooltip>
        }
      />
    </CreateForm.CollapsibleSection>
  );
};
