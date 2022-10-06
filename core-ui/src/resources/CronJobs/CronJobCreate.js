import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { CronJobSpecSection } from 'resources/Jobs/SpecSection';
import {
  isCronExpressionValid,
  ScheduleSection,
} from 'resources/Jobs/ScheduleSection';
import {
  ContainerSection,
  ContainersSection,
} from 'resources/Jobs/ContainersSection';
import {
  createCronJobTemplate,
  createCronJobPresets,
} from 'resources/Jobs/templates';

function isCronJobValid(cronJob) {
  const containers =
    jp.value(cronJob, '$.spec.jobTemplate.spec.template.spec.containers') || [];

  const areContainersValid = !!containers.length;

  return areContainersValid && isCronExpressionValid(cronJob?.spec?.schedule);
}

export function CronJobCreate({
  formElementRef,
  resource: initialCronJob,
  namespace,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();

  const [cronJob, setCronJob] = useState(
    cloneDeep(initialCronJob) || createCronJobTemplate(namespace),
  );

  useEffect(() => {
    setCustomValid(isCronJobValid(cronJob));
  }, [cronJob, setCustomValid]);

  return (
    <ResourceForm
      {...props}
      pluralKind="cronjobs"
      singularName={t(`cron-jobs.name_singular`)}
      initialResource={initialCronJob}
      resource={cronJob}
      setResource={setCronJob}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={!initialCronJob && createCronJobPresets(namespace)}
      createUrl={resourceUrl}
    >
      <CronJobSpecSection advanced propertyPath="$.spec" />

      <ScheduleSection propertyPath="$.spec.schedule" />

      <ContainerSection
        simple
        defaultOpen
        propertyPath="$.spec.jobTemplate.spec.template.spec.containers"
      />

      <ContainersSection
        advanced
        defaultOpen
        propertyPath="$.spec.jobTemplate.spec.template.spec.containers"
      />
    </ResourceForm>
  );
}
CronJobCreate.allowEdit = true;
