import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { Switch } from 'fundamental-react';
import { useMicrofrontendContext } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';

import { createCronJobTemplate, createCronJobPresets } from './templates';
import { CronJobSpecSection } from './SpecSection';
import { isCronExpressionValid, ScheduleSection } from './ScheduleSection';
import { ContainerSection, ContainersSection } from './ContainersSection';
import { cloneDeep } from 'lodash';

const SIDECAR_INJECTION_LABEL = 'sidecar.istio.io/inject';
const SIDECAR_INJECTION_VALUE = 'false';

function isCronJobValid(cronJob) {
  const containers =
    jp.value(cronJob, '$.spec.jobTemplate.spec.template.spec.containers') || [];

  const areContainersValid = !!containers.length;

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
  const { features } = useMicrofrontendContext();
  const istioEnabled = features.ISTIO?.isEnabled;

  const [cronJob, setCronJob] = useState(
    cloneDeep(initialCronJob) || createCronJobTemplate(namespace),
  );
  const [isSidecar, setSidecar] = useState(
    initialCronJob
      ? initialCronJob?.spec.jobTemplate.spec.template.metadata.annotations?.[
          SIDECAR_INJECTION_LABEL
        ]
      : istioEnabled,
  );
  useEffect(() => {
    setCustomValid(isCronJobValid(cronJob));
  }, [cronJob, setCustomValid]);

  useEffect(() => {
    // toggles istio-injection label when 'Disable sidecar injection' is clicked
    if (isSidecar) {
      jp.value(
        cronJob,
        `$.spec.jobTemplate.spec.template.metadata.annotations["${SIDECAR_INJECTION_LABEL}"]`,
        SIDECAR_INJECTION_VALUE,
      );
      setCronJob({ ...cronJob });
    } else {
      const jobTemplateAnnotations =
        cronJob.spec.jobTemplate?.spec?.template?.metadata?.annotations || {};
      jp.value(
        cronJob,
        '$.spec.jobTemplate.spec.template.metadata.annotations',
        jobTemplateAnnotations,
      );
      setCronJob({ ...cronJob });
    }
    // eslint-disable-next-line
  }, [isSidecar]);

  useEffect(() => {
    // toggles 'Disable sidecar injection' when istio-injection label is deleted manually
    if (
      isSidecar &&
      jp.value(
        cronJob,
        `$.spec.jobTemplate.spec.template.metadata.annotations["${SIDECAR_INJECTION_LABEL}"]`,
      ) !== SIDECAR_INJECTION_VALUE
    ) {
      setSidecar(false);
    }
  }, [isSidecar, setSidecar, cronJob]);
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
      <K8sNameField
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
      <ResourceForm.FormField
        label={t('jobs.create-modal.disable-sidecar')}
        input={() => (
          <Switch
            compact
            onChange={e => {
              setSidecar(!isSidecar);
            }}
            checked={isSidecar}
          />
        )}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
        lockedKeys={[SIDECAR_INJECTION_LABEL]}
        lockedValues={[SIDECAR_INJECTION_LABEL]}
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
