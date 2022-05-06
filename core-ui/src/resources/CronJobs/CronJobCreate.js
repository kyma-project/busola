import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { Switch } from 'fundamental-react';
import { cloneDeep } from 'lodash';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';
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

const SIDECAR_INJECTION_LABEL = 'sidecar.istio.io/inject';
const SIDECAR_INJECTION_VALUE = 'false';

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
  const { features } = useMicrofrontendContext();
  const istioEnabled = features.ISTIO?.isEnabled;
  const defaultSidecarAnnotations = initialCronJob
    ? initialCronJob?.spec.jobTemplate.spec.template.metadata.annotations
    : istioEnabled
    ? { [SIDECAR_INJECTION_LABEL]: SIDECAR_INJECTION_VALUE }
    : {};

  const [cronJob, setCronJob] = useState(
    cloneDeep(initialCronJob) ||
      createCronJobTemplate(namespace, defaultSidecarAnnotations),
  );

  useEffect(() => {
    setCustomValid(isCronJobValid(cronJob));
  }, [cronJob, setCustomValid]);

  const onSwitchChange = () => {
    const isSidecar =
      jp.value(
        cronJob,
        `$.spec.jobTemplate.spec.template.metadata.annotations["${SIDECAR_INJECTION_LABEL}"]`,
      ) !== SIDECAR_INJECTION_VALUE;

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
      delete jobTemplateAnnotations[SIDECAR_INJECTION_LABEL];

      jp.value(
        cronJob,
        '$.spec.jobTemplate.spec.template.metadata.annotations',
        jobTemplateAnnotations,
      );
      setCronJob({ ...cronJob });
    }
  };

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
      presets={
        !initialCronJob &&
        createCronJobPresets(namespace, t, defaultSidecarAnnotations)
      }
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
            onChange={onSwitchChange}
            checked={jp.value(
              cronJob,
              `$.spec.jobTemplate.spec.template.metadata.annotations["${SIDECAR_INJECTION_LABEL}"]`,
            )}
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
CronJobCreate.allowEdit = true;
