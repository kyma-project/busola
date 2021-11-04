import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

import { createCronJobTemplate, createCronJobPresets } from './templates';
import { CronJobSpecSection } from './SpecSection';
import { isCronExpressionValid, ScheduleSection } from './ScheduleSection';
import { ContainerSection, ContainersSection } from './ContainersSection';

function isCronJobValid(cronJob) {
  const containers =
    jp.value(cronJob, '$.spec.jobTemplate.spec.template.spec.containers') || [];

  const areContainersValid =
    !!containers.length &&
    containers.every(c => c.command?.length > 0 || c.args?.length > 0);

  return areContainersValid && isCronExpressionValid(cronJob?.spec?.schedule);
}

export function CronJobsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();

  const [cronJob, setCronJob] = useState(createCronJobTemplate(namespace));

  useEffect(() => {
    setCustomValid(isCronJobValid(cronJob));
  }, [cronJob, setCustomValid]);

  return (
    <ResourceForm
      pluralKind="cronjobs"
      singularName={t(`cron-jobs.name_singular`)}
      resource={cronJob}
      setResource={setCronJob}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={createCronJobPresets(namespace, t)}
      createUrl={`/apis/batch/v1beta1/namespaces/${namespace}/cronjobs`}
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
        propertyPath="$.spec.jobTemplate.spec.template.spec.containers"
      />

      <ContainersSection
        advanced
        propertyPath="$.spec.jobTemplate.spec.template.spec.containers"
      />
    </ResourceForm>
  );
}
