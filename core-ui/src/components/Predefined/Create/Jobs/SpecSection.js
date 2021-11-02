import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ResourceForm,
  ResourceFormWrapper,
} from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

const restartPolicyOptions = ['Never', 'OnFailure'].map(p => ({
  key: p,
  text: p,
}));

const concurrencyPolicyOptions = ['Allow', 'Forbid', 'Replace'].map(p => ({
  key: p,
  text: p,
}));

export const CronJobSpecSection = ({ resource, setResource }) => {
  const { t } = useTranslation();

  return (
    <ResourceFormWrapper resource={resource} setResource={setResource}>
      <ResourceForm.FormField
        advanced
        propertyPath="$.jobTemplate.spec.template.spec.startingDeadlineSeconds"
        label={t('jobs.create-modal.labels.starting-deadline')}
        input={Inputs.Number}
        placeholder={t('jobs.create-modal.placeholders.starting-deadline')}
        tooltipContent={t('jobs.create-modal.tooltips.starting-deadline')}
        min={0}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.jobTemplate.spec.template.spec.suspend"
        label={t('jobs.create-modal.labels.suspend')}
        input={Inputs.Switch}
        tooltipContent={t('jobs.create-modal.tooltips.suspend')}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.jobTemplate.spec.template.spec.successfulJobsHistoryLimit"
        label={t('jobs.create-modal.labels.successful-jobs-history-limit')}
        input={Inputs.Number}
        min={0}
        placeholder={t(
          'jobs.create-modal.placeholders.successful-jobs-history-limit',
        )}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.jobTemplate.spec.template.spec.failedJobsHistoryLimit"
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
    </ResourceFormWrapper>
  );
};

export const JobSpecSection = ({ resource, setResource }) => {
  const { t } = useTranslation();

  return (
    <ResourceFormWrapper resource={resource} setResource={setResource}>
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
      />
    </ResourceFormWrapper>
  );
};
