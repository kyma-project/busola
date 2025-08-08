import { useContext, useEffect, useMemo, useState } from 'react';
import jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import { createJobPresets, createJobTemplate } from './templates';
import { JobSpecSection } from './SpecSection';
import { ContainersSection } from './ContainersSection';
import { MessageStrip } from '@ui5/webcomponents-react';
import { getDescription, SchemaContext } from 'shared/helpers/schema';
import { useAtomValue } from 'jotai';
import { columnLayoutState } from 'state/columnLayoutAtom';

function isJobValid(job = {}) {
  const isNameValid = jp.value(job, '$.metadata.name');

  const containers = jp.value(job, '$.spec.template.spec.containers') || [];

  const areContainersValid = !!containers.length;

  return isNameValid && areContainersValid;
}

export default function JobCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialJob,
  resourceUrl,
  prefix,
  ...props
}) {
  const { t } = useTranslation();

  const defaultSidecarAnnotations = useMemo(() => {
    return initialJob?.spec?.template?.metadata?.annotations || {};
  }, [initialJob]);

  const [job, setJob] = useState(
    initialJob
      ? cloneDeep(initialJob)
      : createJobTemplate(namespace, defaultSidecarAnnotations),
  );

  const [initialResource, setInitialResource] = useState(
    initialJob || createJobTemplate(namespace, defaultSidecarAnnotations),
  );
  const layoutState = useAtomValue(columnLayoutState);

  useEffect(() => {
    if (layoutState?.showEdit?.resource) return;

    setJob(
      initialJob
        ? cloneDeep(initialJob)
        : createJobTemplate(namespace, defaultSidecarAnnotations),
    );
    setInitialResource(
      initialJob || createJobTemplate(namespace, defaultSidecarAnnotations),
    );
  }, [
    initialJob,
    namespace,
    defaultSidecarAnnotations,
    layoutState?.showEdit?.resource,
  ]);

  const isEdit = useMemo(
    () =>
      !!initialResource?.metadata?.name && !!!layoutState?.showCreate?.resource,
    [initialResource, layoutState?.showCreate?.resource],
  );

  useEffect(() => {
    setCustomValid(isJobValid(job));
  }, [job, setCustomValid]);

  const schema = useContext(SchemaContext);
  const containersDesc = getDescription(
    schema,
    'spec.template.spec.containers',
  );

  return (
    <ResourceForm
      {...props}
      pluralKind="jobs"
      singularName={t(`jobs.name_singular`)}
      resource={job}
      setResource={setJob}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={
        !isEdit && createJobPresets(namespace, t, defaultSidecarAnnotations)
      }
      createUrl={resourceUrl}
    >
      <JobSpecSection propertyPath="$.spec" readOnly={isEdit} />
      <ContainersSection
        propertyPath="$.spec.template.spec.containers"
        tooltipContent={t(containersDesc)}
        readOnly={isEdit}
      />
      <MessageStrip design="Information" hideCloseButton>
        {t('jobs.create-modal.containers-readonly-in-edit')}
      </MessageStrip>
    </ResourceForm>
  );
}
