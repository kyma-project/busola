import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

export const TslForm = ({ disabled = false, index, server, setServers }) => {
  const { t } = useTranslation();
  return (
    <CreateForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.tls.tls')}
      defaultOpen
      disabled
    >
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.tls.mode')}
          </FormLabel>
        }
        input={
          <FormInput
            type="text"
            required
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.tls.mode',
            )}
            value={server.tls.mode}
            onChange={e => setServers({ tls: { mode: e.target.value || '' } })}
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
