import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ResourceForm,
  ResourceFormWrapper,
} from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

const concurrencyPolicyOptions = ['Allow', 'Forbid', 'Replace'].map(p => ({
  key: p,
  text: p,
}));

const restartPolicyOptions = ['Never', 'OnFailure'].map(p => ({
  key: p,
  text: p,
}));

export const SpecSection = ({ resource, setResource }) => {
  const { t } = useTranslation();

  return (
    <ResourceFormWrapper resource={resource} setResource={setResource}>
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.concurrencyPolicy"
        label={t('cron-jobs.concurrency-policy.label')}
        input={Inputs.Dropdown}
        defaultKey="Allow"
        options={concurrencyPolicyOptions}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.startingDeadlineSeconds"
        label={t('cron-jobs.starting-deadline')}
        input={Inputs.Number}
        placeholder={t('cron-jobs.create-modal.placeholders.starting-deadline')}
        tooltipContent={t('cron-jobs.create-modal.tooltips.starting-deadline')}
        min={0}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.suspend"
        label={t('cron-jobs.suspend')}
        input={Inputs.Switch}
        tooltipContent={t('cron-jobs.create-modal.tooltips.suspend')}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.successfulJobsHistoryLimit"
        label={t('cron-jobs.successful-jobs-history-limit')}
        input={Inputs.Number}
        min={0}
        placeholder={t(
          'cron-jobs.create-modal.placeholders.successful-jobs-history-limit',
        )}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.failedJobsHistoryLimit"
        label={t('cron-jobs.failed-jobs-history-limit')}
        input={Inputs.Number}
        min={0}
        placeholder={t(
          'cron-jobs.create-modal.placeholders.failed-jobs-history-limit',
        )}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.jobTemplate.spec.template.spec.restartPolicy"
        label={t('cron-jobs.restart-policy')}
        input={Inputs.Dropdown}
        options={restartPolicyOptions}
      />
    </ResourceFormWrapper>
  );
};
