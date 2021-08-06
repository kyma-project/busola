import React from 'react';

import { LabelsInput } from 'components/Lambdas/components';
import {
  Checkbox,
  FormFieldset,
  FormLabel,
  FormInput,
  FormItem,
} from 'fundamental-react';
import { K8sNameInput, Tooltip } from 'react-shared';
import { useTranslation } from 'react-i18next';

export default function BasicData({ deployment, setDeployment }) {
  const { t } = useTranslation();
  return (
    <FormFieldset>
      <K8sNameInput
        id="name"
        kind="Deployment"
        onChange={e => setDeployment({ ...deployment, name: e.target.value })}
        className="fd-margin-bottom--sm"
      />
      <LabelsInput
        labels={deployment.labels}
        onChange={labels => setDeployment({ ...deployment, labels })}
      />
      <FormItem>
        <FormLabel htmlFor="docker-image" required>
          Docker image
        </FormLabel>
        <Tooltip content={t('namespaces.docker-image.tooltip')}>
          <FormInput
            id="docker-image"
            required
            placeholder="Enter Docker image"
            onChange={e =>
              setDeployment({ ...deployment, dockerImage: e.target.value })
            }
            className="fd-margin-bottom--sm"
          />
        </Tooltip>
      </FormItem>

      <h3 className="configuration-data__title">Service options</h3>
      <Checkbox
        defaultChecked={deployment.createService}
        onChange={e =>
          setDeployment({ ...deployment, createService: e.target.checked })
        }
      >
        Create a separate Service to expose this Deployment
      </Checkbox>
    </FormFieldset>
  );
}
