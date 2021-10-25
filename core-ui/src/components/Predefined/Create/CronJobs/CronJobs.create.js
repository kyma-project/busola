import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox } from 'fundamental-react';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

import {
  createContainerTemplate,
  createCronJobTemplate,
  createPresets,
} from './templates';
// import { Containers } from './Containers';

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
    const hasAnyContainers = !!(
      jp.value(cronJob, '$.spec.jobTemplate.spec.template.spec.containers') ||
      []
    ).length;
    setCustomValid(hasAnyContainers);
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
        required
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
        placeholder={t('cron-jobs.placeholders.starting-deadline')}
        tooltipContent={t('cron-jobs.tooltips.starting-deadline')}
        min={0}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.suspend"
        label={t('cron-jobs.suspend')}
        input={Inputs.Switch}
        tooltipContent={t('cron-jobs.tooltips.suspend')}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.successfulJobsHistoryLimit"
        label={t('cron-jobs.successful-jobs-history-limit')}
        input={Inputs.Number}
        min={0}
        placeholder={t('cron-jobs.placeholders.successful-jobs-history-limit')}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.failedJobsHistoryLimit"
        label={t('cron-jobs.failed-jobs-history-limit')}
        input={Inputs.Number}
        min={0}
        placeholder={t('cron-jobs.placeholders.failed-jobs-history-limit')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      {/* 
      <ResourceForm.CollapsibleSection
        advanced
        title="Containers"
        defaultOpen
        resource={cronJob}
        setResource={setCronJob}
        actions={setOpen => (
          <Button
            glyph="add"
            compact
            onClick={() => {
              const path = '$.spec.template.spec.containers';
              const nextContainers = [
                ...(jp.value(cronJob, path) || []),
                createContainerTemplate(),
              ];
              jp.value(cronJob, path, nextContainers);

              setCronJob({ ...cronJob });
              onChange(new Event('input', { bubbles: true }));
              setOpen(true);
            }}
          >
            Add Container
          </Button>
        )}
      >
        <Containers propertyPath="$.spec.template.spec.containers" />
      </ResourceForm.CollapsibleSection> */}
    </ResourceForm>
  );
}
