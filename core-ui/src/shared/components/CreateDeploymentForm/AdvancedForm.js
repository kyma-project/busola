import React from 'react';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import {
  FormFieldset,
  FormLabel,
  FormInput,
  FormItem,
} from 'fundamental-react';
import { TextFormItem } from 'react-shared';
import { merge } from 'lodash';
import { SimpleForm } from './SimpleForm';
import './AdvancedForm.scss';
import { useTranslation } from 'react-i18next';

export function AdvancedForm({ deployment, setDeployment }) {
  const { t } = useTranslation();
  const setServiceData = data => {
    setDeployment({
      ...merge(deployment, {
        serviceData: {
          ...data,
        },
      }),
    });
  };

  const serviceActions = (
    <label>
      {t('deployments.create-modal.advanced.expose-service')}{' '}
      <input
        type="checkbox"
        checked={deployment.serviceData.create}
        onChange={() =>
          setServiceData({ create: !deployment.serviceData.create })
        }
      />
    </label>
  );

  const setLimits = limits => {
    setDeployment({
      ...deployment,
      limits: {
        ...deployment.limits,
        ...limits,
      },
    });
  };

  const setRequests = limits => {
    setDeployment({
      ...deployment,
      requests: {
        ...deployment.requests,
        ...limits,
      },
    });
  };

  const runtimeProfileForm = (
    <CreateModal.CollapsibleSection
      title={t('deployments.create-modal.advanced.runtime-profile')}
    >
      <FormFieldset className="runtime-profile-form">
        <FormItem>
          <FormLabel required>
            {t('deployments.create-modal.advanced.memory-requests')}
          </FormLabel>
          <FormInput
            required
            value={deployment.requests.memory}
            onChange={e => setRequests({ memory: e.target.value })}
          />
        </FormItem>
        <FormItem>
          <FormLabel required>
            {t('deployments.create-modal.advanced.memory-limits')}
          </FormLabel>
          <FormInput
            required
            value={deployment.limits.memory}
            onChange={e => setLimits({ memory: e.target.value })}
          />
        </FormItem>
      </FormFieldset>
      <FormFieldset className="runtime-profile-form">
        <FormItem>
          <FormLabel required>
            {t('deployments.create-modal.advanced.cpu-requests')}
          </FormLabel>
          <FormInput
            required
            value={deployment.requests.cpu}
            onChange={e => setRequests({ cpu: e.target.value })}
          />
        </FormItem>
        <FormItem>
          <FormLabel required>
            {t('deployments.create-modal.advanced.cpu-limits')}
          </FormLabel>
          <FormInput
            required
            value={deployment.limits.cpu}
            onChange={e => setLimits({ cpu: e.target.value })}
          />
        </FormItem>
      </FormFieldset>
    </CreateModal.CollapsibleSection>
  );

  const serviceForm = (
    <CreateModal.CollapsibleSection
      title={t('services.labels.service')}
      actions={serviceActions}
    >
      <FormFieldset>
        <TextFormItem
          type="number"
          inputKey="port"
          required
          label={t('deployments.create-modal.advanced.port')}
          placeholder={t('deployments.create-modal.advanced.port-placeholder')}
          defaultValue={deployment.serviceData.port.port || 0}
          value={deployment.serviceData.port.port}
          inputProps={{ disabled: !deployment.serviceData.create }}
          onChange={e =>
            setServiceData({ port: { port: e.target.valueAsNumber } })
          }
        />
        <TextFormItem
          type="number"
          inputKey="target-port"
          required
          inputProps={{ disabled: !deployment.serviceData.create }}
          label={t('deployments.create-modal.advanced.target-port')}
          placeholder={t(
            'deployments.create-modal.advanced.target-port-placeholder',
          )}
          defaultValue={deployment.serviceData.port.targetPort || 0}
          value={deployment.serviceData.port.targetPort}
          onChange={e =>
            setServiceData({ port: { targetPort: e.target.valueAsNumber } })
          }
        />
      </FormFieldset>
    </CreateModal.CollapsibleSection>
  );

  return (
    <>
      <SimpleForm deployment={deployment} setDeployment={setDeployment} />
      {serviceForm}
      {runtimeProfileForm}
    </>
  );
}
