import React from 'react';
import { FormFieldset, FormLabel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { K8sNameInput } from 'react-shared';
import { LabelsInput } from 'components/Lambdas/components';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { K8sResourceSelect } from '../../shared/components/K8sResourceSelect';

export function SimpleForm({ serviceBinding, setServiceBinding, namespaceId }) {
  const { t, i18n } = useTranslation();

  return (
    <CreateModal.Section>
      <FormFieldset>
        <CreateModal.FormField
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
        <CreateModal.FormField
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
        <CreateModal.FormField
          label={
            <FormLabel required>{t('btp-instances.resource-type')}</FormLabel>
          }
          input={
            <K8sResourceSelect
              compact
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
    </CreateModal.Section>
  );
}
