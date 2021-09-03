import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { FormLabel, FormInput, StringInput } from 'fundamental-react';
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
          //  <StringInput
          //   stringList={server.hosts || []}
          //   onChange={hosts => setValue(server, hosts || [])}
          //   regexp={/^[^, ]+$/}
          //   placeholder={'ddd'}
          //   id={'hosts'}
          // />
          <FormInput
            type="text"
            required
            compact
            placeholder={t('gateways.create-modal.advanced.placeholders.hosts')}
            value={server.hosts}
            onChange={e => setValue(server, e.target.value || '')}
          />
        }
      />
    </CreateForm.CollapsibleSection>
  );
};
