import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel, FormInput } from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';

export function PrivateKeyForm({ issuer, setIssuer, disabled }) {
  const { t } = useTranslation();

  return (
    <>
      <FormFieldset>
        <CreateForm.FormField
          label={
            <FormLabel required={!disabled}>
              {t('issuers.private-key')}
            </FormLabel>
          }
          input={
            <SecretRef
              resourceRef={issuer.privateKeySecretRef}
              onChange={(e, privateKeySecretRef) =>
                setIssuer({ ...issuer, privateKeySecretRef })
              }
            />
          }
        />
      </FormFieldset>
    </>
  );
}
