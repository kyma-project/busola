import React from 'react';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { LabelsInput } from 'components/Lambdas/components';
import { FormFieldset, FormLabel, FormInput } from 'fundamental-react';
import { K8sNameInput, Tooltip } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function SimpleForm({ deployment, setDeployment }) {
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
              kind="Deployment"
              onChange={e =>
                setDeployment({ ...deployment, name: e.target.value })
              }
              value={deployment.name}
              i18n={i18n}
            />
          }
        />
        <CreateModal.FormField
          label={<FormLabel>{t('common.headers.labels')}</FormLabel>}
          input={
            <LabelsInput
              showFormLabel={false}
              labels={deployment.labels}
              onChange={labels => setDeployment({ ...deployment, labels })}
              i18n={i18n}
              compact
            />
          }
        />
        <CreateModal.FormField
          label={
            <FormLabel required>
              {t('deployments.create-modal.simple.docker-image')}
            </FormLabel>
          }
          input={
            <Tooltip content={t('workloads.docker-image.tooltip')}>
              <FormInput
                required
                compact
                placeholder={t(
                  'deployments.create-modal.simple.docker-image-placeholder',
                )}
                value={deployment.dockerImage}
                onChange={e =>
                  setDeployment({ ...deployment, dockerImage: e.target.value })
                }
              />
            </Tooltip>
          }
        />
      </FormFieldset>
    </CreateModal.Section>
  );
}
