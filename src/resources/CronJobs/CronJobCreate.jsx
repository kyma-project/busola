import { useContext, useEffect, useMemo, useState } from 'react';
import jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { CronJobSpecSection } from 'resources/Jobs/SpecSection';
import {
  isCronExpressionValid,
  ScheduleSection,
} from 'resources/Jobs/ScheduleSection';
import { ContainersSection } from 'resources/Jobs/ContainersSection';
import {
  createCronJobPresets,
  createCronJobTemplate,
} from 'resources/Jobs/templates';
import { getDescription, SchemaContext } from 'shared/helpers/schema';
import { useAtomValue } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

function isCronJobValid(cronJob) {
  const containers =
    jp.value(cronJob, '$.spec.jobTemplate.spec.template.spec.containers') || [];

  const areContainersValid = !!containers.length;

  return areContainersValid && isCronExpressionValid(cronJob?.spec?.schedule);
}

export default function CronJobCreate({
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
  const [initialResource, setInitialResource] = useState(
    initialCronJob || createCronJobTemplate(namespace),
  );
  const layoutState = useAtomValue(columnLayoutAtom);

  useEffect(() => {
    if (layoutState?.showEdit?.resource) return;

    const timeoutId = setTimeout(() => {
      setCronJob(cloneDeep(initialCronJob) || createCronJobTemplate(namespace));
      setInitialResource(initialCronJob || createCronJobTemplate(namespace));
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialCronJob, namespace, layoutState?.showEdit?.resource]);

  useEffect(() => {
    setCustomValid(isCronJobValid(cronJob));
  }, [cronJob, setCustomValid]);

  const isEdit = useMemo(
    () =>
      !!initialResource?.metadata?.uid && !layoutState?.showCreate?.resource,
    [initialResource, layoutState?.showCreate?.resource],
  );

  const schema = useContext(SchemaContext);
  const scheduleDesc = getDescription(schema, 'spec.schedule');
  const containersDesc = getDescription(
    schema,
    'spec.jobTemplate.spec.template.spec.containers',
  );

  return (
    <ResourceForm
      {...props}
      pluralKind="cronjobs"
      singularName={t(`cron-jobs.name_singular`)}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      resource={cronJob}
      setResource={setCronJob}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={!isEdit && createCronJobPresets(namespace)}
      createUrl={resourceUrl}
    >
      <CronJobSpecSection propertyPath="$.spec" />
      <ScheduleSection
        propertyPath="$.spec.schedule"
        tooltipContent={t(scheduleDesc, { defaultValue: scheduleDesc })}
      />
      <ContainersSection
        defaultOpen
        tooltipContent={containersDesc}
        propertyPath="$.spec.jobTemplate.spec.template.spec.containers"
      />
    </ResourceForm>
  );
}
