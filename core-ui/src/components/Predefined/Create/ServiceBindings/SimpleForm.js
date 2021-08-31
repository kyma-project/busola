import React from 'react';
import { FormFieldset, FormLabel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { K8sNameInput } from 'react-shared';
import { LabelsInput } from 'components/Lambdas/components';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';

export function SimpleForm({ serviceBinding, setServiceBinding, namespaceId }) {
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
              kind={t('btp-service-bindings.resource-type')}
              onChange={e =>
                setServiceBinding({ ...serviceBinding, name: e.target.value })
              }
              value={serviceBinding.name}
              i18n={i18n}
            />
          }
        />
        <CreateForm.FormField
          label={<FormLabel>{t('common.headers.labels')}</FormLabel>}
          input={
            <LabelsInput
              showFormLabel={false}
              labels={serviceBinding.labels}
              onChange={labels =>
                setServiceBinding({ ...serviceBinding, labels })
              }
              i18n={i18n}
              compact
            />
          }
        />
        <CreateForm.FormField
          label={
            <FormLabel required>{t('btp-instances.resource-type')}</FormLabel>
          }
          input={
            <K8sResourceSelectWithUseGetList
              compact
              required
              value={serviceBinding.instanceName}
              resourceType={t('btp-instances.resource-type')}
              onSelect={instanceName =>
                setServiceBinding({ ...serviceBinding, instanceName })
              }
              url={`/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespaceId}/serviceinstances/`}
            />
          }
        />
      </FormFieldset>
    </CreateForm.Section>
  );
}
