import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel, FormInput } from 'fundamental-react';

import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { LabelsInput } from 'components/Lambdas/components';
import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ secret, setSecret }) {
  const { t, i18n } = useTranslation();

  const setData = ({ key, value }) => {
    setSecret({ ...secret, data: { ...secret.data, [key]: value } });
  };

  const additionalFields = Object.keys(secret.data).map(key => (
    <CreateModal.FormField
      label={<FormLabel> {key} </FormLabel>}
      input={
        <FormInput
          value={secret.data[key]}
          onChange={e => {
            setData({ key, value: e.target.value });
          }}
        />
      }
    />
  ));

  return (
    <>
      <SimpleForm secret={secret} setSecret={setSecret} />

      <CreateModal.Section>
        <FormFieldset>
          <CreateModal.FormField
            label={<FormLabel>{t('common.headers.annotations')}</FormLabel>}
            input={
              <LabelsInput
                showFormLabel={false}
                labels={secret.annotations}
                onChange={annotations => setSecret({ ...secret, annotations })}
                i18n={i18n}
                compact
              />
            }
          />
        </FormFieldset>

        {secret.data && Object.keys(secret.data)?.length
          ? additionalFields
          : null}
      </CreateModal.Section>
    </>
  );
}
