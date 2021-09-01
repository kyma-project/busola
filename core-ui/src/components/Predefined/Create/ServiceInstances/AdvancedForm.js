import React from 'react';
import { FormFieldset, FormInput, FormLabel } from 'fundamental-react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { SimpleForm } from './SimpleForm';
import { useTranslation } from 'react-i18next';
import { JSONSection } from 'shared/components/CreateForm/JSONInputSection';

export function AdvancedForm({ serviceInstance, setServiceInstance }) {
  const { t } = useTranslation();

  return (
    <>
      <SimpleForm
        serviceInstance={serviceInstance}
        setServiceInstance={setServiceInstance}
      />
      <CreateForm.Section>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel>{t('btp-instances.external-name')}</FormLabel>}
            input={
              <FormInput
                compact
                value={serviceInstance.externalName}
                placeholder={t(
                  'btp-instances.create.external-name-placeholder',
                )}
                onChange={e =>
                  setServiceInstance({
                    ...serviceInstance,
                    externalName: e.target.value,
                  })
                }
              />
            }
          />
        </FormFieldset>
      </CreateForm.Section>
      <JSONSection
        title={t('btp-instances.parameters')}
        value={serviceInstance.parameters}
        setValue={parameters =>
          setServiceInstance({ ...serviceInstance, parameters })
        }
        invalidValueMessage={t('btp-instances.create.params-invalid')}
        validate={parsed => !!parsed && typeof parsed === 'object'}
      />
    </>
  );
}
