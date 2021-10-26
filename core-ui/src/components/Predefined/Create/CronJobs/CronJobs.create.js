import React from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

import {
  createContainerTemplate,
  createCronJobTemplate,
  createPresets,
} from './templates';
import { SingleContainerForm, SingleContainerInput } from './Containers';
import { MessageStrip } from 'fundamental-react';
import { isCronExpressionValid, ScheduleSection } from './ScheduleEditor';

export function CronJobsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();

  const [cronJob, setCronJob] = React.useState(
    createCronJobTemplate(namespace),
  );

  React.useEffect(() => {
    const containers =
      jp.value(cronJob, '$.spec.jobTemplate.spec.template.spec.containers') ||
      [];

    const areContainersValid =
      !!containers.length &&
      containers.every(c => c.command?.length > 0 || c.args?.length > 0);

    setCustomValid(
      areContainersValid && isCronExpressionValid(cronJob?.spec?.schedule),
    );
  }, [cronJob, setCustomValid]);

  const concurrencyPolicyOptions = [
    {
      key: 'Allow',
      text: `Allow (${t('cron-jobs.concurrency-policy.descriptions.allow')})`,
    },
    {
      key: 'Forbid',
      text: `Forbid (${t('cron-jobs.concurrency-policy.descriptions.forbid')})`,
    },
    {
      key: 'Replace',
      text: `Replace (${t(
        'cron-jobs.concurrency-policy.descriptions.replace',
      )})`,
    },
  ];

  // const concurrencyPolicyOptions = ['Allow', 'Forbid', 'Replace'].map(p => ({
  //   key: p,
  //   text: p,
  // }));

  const restartPolicyOptions = ['Never', 'OnFailure'].map(p => ({
    key: p,
    text: p,
  }));

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
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.concurrencyPolicy"
        label={t('cron-jobs.concurrency-policy.label')}
        input={Inputs.Dropdown}
        options={concurrencyPolicyOptions}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.startingDeadlineSeconds"
        label={t('cron-jobs.starting-deadline')}
        input={Inputs.Number}
        placeholder={t('cron-jobs.create-modal.placeholders.starting-deadline')}
        tooltipContent={t('cron-jobs.create-modal.tooltips.starting-deadline')}
        min={0}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.suspend"
        label={t('cron-jobs.suspend')}
        input={Inputs.Switch}
        tooltipContent={t('cron-jobs.create-modal.tooltips.suspend')}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.successfulJobsHistoryLimit"
        label={t('cron-jobs.successful-jobs-history-limit')}
        input={Inputs.Number}
        min={0}
        placeholder={t(
          'cron-jobs.create-modal.placeholders.successful-jobs-history-limit',
        )}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.failedJobsHistoryLimit"
        label={t('cron-jobs.failed-jobs-history-limit')}
        input={Inputs.Number}
        min={0}
        placeholder={t(
          'cron-jobs.create-modal.placeholders.failed-jobs-history-limit',
        )}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.jobTemplate.spec.template.spec.restartPolicy"
        label={t('cron-jobs.restart-policy')}
        input={Inputs.Dropdown}
        options={restartPolicyOptions}
      />
      <ScheduleSection propertyPath="$.spec.schedule" />
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
