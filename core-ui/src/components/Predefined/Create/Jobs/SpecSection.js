import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ResourceForm,
  ResourceFormWrapper,
} from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

export const SpecSection = ({ resource, setResource }) => {
  const { t } = useTranslation();

  return (
    <ResourceFormWrapper resource={resource} setResource={setResource}>
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
    </ResourceFormWrapper>
  );
};
