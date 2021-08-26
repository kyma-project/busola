import React from 'react';
import { FormFieldset, FormInput, FormLabel } from 'fundamental-react';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { SimpleForm } from './SimpleForm';
import { useTranslation } from 'react-i18next';
import { JSONSection } from '../CreateModal/JSONInputSection';

export function AdvancedForm({ serviceInstance, setServiceInstance }) {
  const { t } = useTranslation();

  return (
    <>
      <SimpleForm
        serviceInstance={serviceInstance}
        setServiceInstance={setServiceInstance}
      />
      <CreateModal.Section>
        <FormFieldset>
          <CreateModal.FormField
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
      </CreateModal.Section>
      <JSONSection
        title={t('btp-instances.parameters')}
        value={serviceInstance.parameters}
        setValue={parameters =>
          setServiceInstance({ ...serviceInstance, parameters })
        }
        validate={parsed => !!parsed && typeof parsed === 'object'}
      />
    </>
  );
}
