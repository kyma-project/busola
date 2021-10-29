import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import {
  createCronJobTemplate,
  createJobPresets,
  createCronJobPresets,
} from './templates';
import { SpecSection } from './SpecSection';
import { isCronExpressionValid, ScheduleSection } from './ScheduleSection';
import { ContainerSection, ContainersSection } from './ContainersSection';

const concurrencyPolicyOptions = ['Allow', 'Forbid', 'Replace'].map(p => ({
  key: p,
  text: p,
}));

const restartPolicyOptions = ['Never', 'OnFailure'].map(p => ({
  key: p,
  text: p,
}));

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

      <SpecSection
        advanced
        resource={cronJob.spec}
        setResource={spec => {
          jp.value(cronJob, '$.spec', spec);
          setCronJob({ ...cronJob });
        }}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.concurrencyPolicy"
        label={t('cron-jobs.create-modal.labels.concurrency-policy')}
        input={Inputs.Dropdown}
        defaultKey="Allow"
        options={concurrencyPolicyOptions}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.jobTemplate.spec.template.spec.restartPolicy"
        label={t('cron-jobs.create-modal.labels.restart-policy')}
        input={Inputs.Dropdown}
        options={restartPolicyOptions}
      />

      <ScheduleSection propertyPath="$.spec.schedule" />

      <ContainerSection
        resource={cronJob.spec.jobTemplate.spec}
        setResource={spec => {
          jp.value(cronJob, '$.spec.jobTemplate.spec', spec);
          setCronJob({ ...cronJob });
        }}
        simple
      />

      <ContainersSection
        resource={cronJob.spec.jobTemplate.spec}
        setResource={spec => {
          jp.value(cronJob, '$.spec.jobTemplate.spec', spec);
          setCronJob({ ...cronJob });
        }}
        advanced
      />
    </ResourceForm>
  );
}
