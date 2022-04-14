import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

const restartPolicyOptions = ['Never', 'OnFailure'].map(p => ({
  key: p,
  text: p,
}));

const concurrencyPolicyOptions = ['Allow', 'Forbid', 'Replace'].map(p => ({
  key: p,
  text: p,
}));

export const CronJobSpecSection = ({ value, setValue, ...props }) => {
  const { t } = useTranslation();

  return (
    <ResourceForm.Wrapper resource={value} setResource={setValue} {...props}>
      <ResourceForm.FormField
        advanced
        propertyPath="$.startingDeadlineSeconds"
        label={t('jobs.create-modal.labels.starting-deadline')}
        input={Inputs.Number}
        placeholder={t('jobs.create-modal.placeholders.starting-deadline')}
        tooltipContent={t('jobs.create-modal.tooltips.starting-deadline')}
        min={0}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.suspend"
        label={t('jobs.create-modal.labels.suspend')}
        input={Inputs.Switch}
        tooltipContent={t('jobs.create-modal.tooltips.suspend')}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.successfulJobsHistoryLimit"
        label={t('jobs.create-modal.labels.successful-jobs-history-limit')}
        input={Inputs.Number}
        min={0}
        placeholder={t(
          'jobs.create-modal.placeholders.successful-jobs-history-limit',
        )}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.failedJobsHistoryLimit"
        label={t('jobs.create-modal.labels.failed-jobs-history-limit')}
        input={Inputs.Number}
        min={0}
        placeholder={t(
          'jobs.create-modal.placeholders.failed-jobs-history-limit',
        )}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.jobTemplate.spec.template.spec.restartPolicy"
        label={t('cron-jobs.create-modal.labels.restart-policy')}
        input={Inputs.Dropdown}
        options={restartPolicyOptions}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.concurrencyPolicy"
        label={t('cron-jobs.create-modal.labels.concurrency-policy')}
        input={Inputs.Dropdown}
        defaultKey="Allow"
        options={concurrencyPolicyOptions}
      />
    </ResourceForm.Wrapper>
  );
};

export const JobSpecSection = ({ value, setValue, readOnly, ...props }) => {
  const { t } = useTranslation();

  return (
    <ResourceForm.Wrapper resource={value} setResource={setValue} {...props}>
      <ResourceForm.FormField
        advanced
        propertyPath="$.parallelism"
        label={t('jobs.create-modal.labels.parallelism')}
        input={Inputs.Number}
        placeholder={t('jobs.create-modal.placeholders.parallelism')}
        min={0}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.suspend"
        label={t('jobs.create-modal.labels.suspend')}
        input={Inputs.Switch}
        tooltipContent={t('jobs.create-modal.tooltips.suspend')}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.template.spec.restartPolicy"
        label={t('cron-jobs.create-modal.labels.restart-policy')}
        input={Inputs.Dropdown}
        options={restartPolicyOptions}
        readOnly={readOnly}
      />
    </ResourceForm.Wrapper>
  );
};
