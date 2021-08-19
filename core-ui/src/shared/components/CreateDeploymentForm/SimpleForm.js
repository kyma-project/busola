import React from 'react';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { LabelsInput } from 'components/Lambdas/components';
import {
  FormFieldset,
  FormLabel,
  FormInput,
  FormItem,
} from 'fundamental-react';
import { K8sNameInput, Tooltip } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function SimpleForm({ deployment, setDeployment }) {
  const { t, i18n } = useTranslation();

  return (
    <CreateModal.Section>
      <FormFieldset>
        <K8sNameInput
          id="name"
          kind="Deployment"
          onChange={e => setDeployment({ ...deployment, name: e.target.value })}
          className="fd-margin-bottom--sm"
          value={deployment.name}
          i18n={i18n}
        />
        <LabelsInput
          labels={deployment.labels}
          onChange={labels => setDeployment({ ...deployment, labels })}
          i18n={i18n}
        />
        <FormItem>
          <FormLabel htmlFor="docker-image" required>
            {t('deployments.create-modal.simple.docker-image')}
          </FormLabel>
          <Tooltip content={t('workloads.docker-image.tooltip')}>
            <FormInput
              id="docker-image"
              required
              placeholder={t(
                'deployments.create-modal.simple.docker-image-placeholder',
              )}
              onChange={e =>
                setDeployment({ ...deployment, dockerImage: e.target.value })
              }
              className="fd-margin-bottom--sm"
              value={deployment.dockerImage}
            />
          </Tooltip>
        </FormItem>
      </FormFieldset>
    </CreateModal.Section>
  );
}
