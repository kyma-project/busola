import React from 'react';
import { useTranslation } from 'react-i18next';

import { FormFieldset, FormLabel, FormInput } from 'fundamental-react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';

export function PrivateKeyForm({ issuer, setIssuer, disabled }) {
  const { t } = useTranslation();

  return (
    <>
      <FormFieldset>
        <CreateForm.FormField
          label={
            <FormLabel required={!disabled}>
              {t('issuers.private-key-name')}
            </FormLabel>
          }
          input={
            <FormInput
              compact
              value={issuer.privateKeyName}
              disabled={disabled}
              required={!disabled}
              onChange={e =>
                setIssuer({ ...issuer, privateKeyName: e.target.value })
              }
            />
          }
        />
      </FormFieldset>
      <FormFieldset>
        <CreateForm.FormField
          label={
            <FormLabel required={!disabled}>
              {t('issuers.private-key-namespace')}
            </FormLabel>
          }
          input={
            <FormInput
              compact
              disabled={disabled}
              required={!disabled}
              value={issuer.privateKeyNamespace}
              onChange={e =>
                setIssuer({ ...issuer, privateKeyNamespace: e.target.value })
              }
            />
          }
        />
      </FormFieldset>
    </>
  );
}
