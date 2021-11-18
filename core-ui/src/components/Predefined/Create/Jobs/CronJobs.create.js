import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

import { createCronJobTemplate, createCronJobPresets } from './templates';
import { CronJobSpecSection } from './SpecSection';
import { isCronExpressionValid, ScheduleSection } from './ScheduleSection';
import { ContainerSection, ContainersSection } from './ContainersSection';
import * as _ from 'lodash';

function isCronJobValid(cronJob) {
  const containers =
    jp.value(cronJob, '$.spec.jobTemplate.spec.template.spec.containers') || [];

  const areContainersValid =
    !!containers.length &&
    containers.every(c => c.command?.length > 0 || c.args?.length > 0);

  return areContainersValid && isCronExpressionValid(cronJob?.spec?.schedule);
}

function CronJobsCreate({
  formElementRef,
  resource: initialCronJob,
  namespace,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { t } = useTranslation();

  const [cronJob, setCronJob] = useState(
    _.cloneDeep(initialCronJob) || createCronJobTemplate(namespace),
  );

  useEffect(() => {
    setCustomValid(isCronJobValid(cronJob));
  }, [cronJob, setCustomValid]);

  return (
    <ResourceForm
      pluralKind="cronjobs"
      singularName={t(`cron-jobs.name_singular`)}
      initialResource={initialCronJob}
      resource={cronJob}
      setResource={setCronJob}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={createCronJobPresets(namespace, t)}
      createUrl={resourceUrl}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('cron-jobs.name_singular')}
        setValue={name => {
          jp.value(cronJob, '$.metadata.name', name);
          jp.value(
            cronJob,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setCronJob({ ...cronJob });
        }}
        readOnly={!!initialCronJob}
      />

      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />

      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />

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
CronJobsCreate.allowEdit = true;
export { CronJobsCreate };
