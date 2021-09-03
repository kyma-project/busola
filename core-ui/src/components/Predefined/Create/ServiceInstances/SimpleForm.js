import React from 'react';
import { FormFieldset, FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { K8sNameInput } from 'react-shared';
import { LabelsInput } from 'components/Lambdas/components';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';

export function SimpleForm({ serviceInstance, setServiceInstance }) {
  const { t, i18n } = useTranslation();

  return (
    <CreateForm.Section>
      <FormFieldset>
        <CreateForm.FormField
          label={<FormLabel required>{t('common.labels.name')}</FormLabel>}
          input={
            <K8sNameInput
              showLabel={false}
              compact
              kind={t('btp-instances.resource-type')}
              onChange={e =>
                setServiceInstance({ ...serviceInstance, name: e.target.value })
              }
              value={serviceInstance.name}
              i18n={i18n}
            />
          }
        />
        <CreateForm.FormField
          label={<FormLabel>{t('common.headers.labels')}</FormLabel>}
          input={
            <LabelsInput
              showFormLabel={false}
              labels={serviceInstance.labels}
              onChange={labels =>
                setServiceInstance({ ...serviceInstance, labels })
              }
              i18n={i18n}
              compact
            />
          }
        />
        <CreateForm.FormField
          label={
            <FormLabel required>{t('btp-instances.offering-name')}</FormLabel>
          }
          input={
            <FormInput
              required
              compact
              placeholder={t('btp-instances.create.offering-name-description')}
              value={serviceInstance.serviceOfferingName}
              onChange={e =>
                setServiceInstance({
                  ...serviceInstance,
                  serviceOfferingName: e.target.value,
                })
              }
            />
          }
        />
        <CreateForm.FormField
          label={<FormLabel required>{t('btp-instances.plan-name')}</FormLabel>}
          input={
            <FormInput
              required
              compact
              placeholder={t('btp-instances.create.plan-name-description')}
              value={serviceInstance.servicePlanName}
              onChange={e =>
                setServiceInstance({
                  ...serviceInstance,
                  servicePlanName: e.target.value,
                })
              }
            />
          }
        />
      </FormFieldset>
    </CreateForm.Section>
  );
}
