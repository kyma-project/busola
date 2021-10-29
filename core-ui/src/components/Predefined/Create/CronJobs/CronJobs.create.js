import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

import {
  createContainerTemplate,
  createCronJobTemplate,
  createPresets,
} from './templates';
import { SingleContainerForm, SingleContainerInput } from './Containers';
import { MessageStrip } from 'fundamental-react';
import { isCronExpressionValid, ScheduleSection } from './ScheduleSection';
import { CronJobsSpecSection } from './CronJobsSpecSection';

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
      presets={createPresets(namespace, t)}
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

      <CronJobsSpecSection
        advanced
        resource={cronJob.spec}
        setResource={spec => setCronJob({ ...cronJob, spec })}
      />

      <ScheduleSection propertyPath="$.spec.schedule" />

      {jp.value(
        cronJob,
        '$.spec.jobTemplate.spec.template.spec.containers.length',
      ) ? (
        <SingleContainerInput
          simple
          propertyPath="$.spec.jobTemplate.spec.template.spec.containers"
        />
      ) : (
        <MessageStrip simple type="warning" className="fd-margin-top--sm">
          {t('cron-jobs.create-modal.at-least-one-container-required')}
        </MessageStrip>
      )}
      <ResourceForm.ItemArray
        advanced
        propertyPath="$.spec.jobTemplate.spec.template.spec.containers"
        listTitle={t('cron-jobs.create-modal.containers')}
        nameSingular={t('cron-jobs.create-modal.container')}
        entryTitle={container => container?.name}
        atLeastOneRequiredMessage={t(
          'cron-jobs.create-modal.at-least-one-container-required',
        )}
        itemRenderer={(current, allValues, setAllValues) => (
          <SingleContainerForm
            container={current}
            containers={allValues}
            setContainers={setAllValues}
            advanced
          />
        )}
        newResourceTemplateFn={createContainerTemplate}
      />
    </ResourceForm>
  );
}
