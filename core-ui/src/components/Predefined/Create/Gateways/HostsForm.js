import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

export const HostsForm = ({ disabled = false, index, server, setServers }) => {
  const { t } = useTranslation();
  return (
    <CreateForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.hosts')}
      defaultOpen
      disabled
    >
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.hosts')}
          </FormLabel>
        }
        input={
          <FormInput
            type="text"
            required
            compact
            placeholder={t('gateways.create-modal.advanced.placeholders.hosts')}
            value={server.hosts}
            onChange={e => setServers({ hosts: e.target.value || '' })}
          />
        }
      />
    </CreateForm.CollapsibleSection>
  );
};
