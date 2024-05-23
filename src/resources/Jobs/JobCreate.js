import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import { createJobTemplate, createJobPresets } from './templates';
import { JobSpecSection } from './SpecSection';
import { ContainersSection } from './ContainersSection';
import { MessageStrip } from '@ui5/webcomponents-react';

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

  const defaultSidecarAnnotations = initialJob
    ? initialJob?.spec?.template?.metadata?.annotations
    : {};
  const [initialUnchangedResource] = useState(initialJob);
  const [initialResource] = useState(
    initialJob || createJobTemplate(namespace, defaultSidecarAnnotations),
  );

  const [job, setJob] = useState(
    initialJob
      ? cloneDeep(initialJob)
      : createJobTemplate(namespace, defaultSidecarAnnotations),
  );

  useEffect(() => {
    setCustomValid(isJobValid(job));
  }, [job, setCustomValid]);

  return (
    <ResourceForm
      {...props}
      pluralKind="jobs"
      singularName={t(`jobs.name_singular`)}
      resource={job}
      setResource={setJob}
      initialResource={initialResource}
      initialUnchangedResource={initialUnchangedResource}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={
        !initialUnchangedResource &&
        createJobPresets(namespace, t, defaultSidecarAnnotations)
      }
      createUrl={resourceUrl}
    >
      <JobSpecSection
        propertyPath="$.spec"
        readOnly={!!initialUnchangedResource}
      />
      <ContainersSection
        propertyPath="$.spec.template.spec.containers"
        readOnly={!!initialUnchangedResource}
      />
      <MessageStrip design="Information" hideCloseButton>
        {t('jobs.create-modal.containers-readonly-in-edit')}
      </MessageStrip>
    </ResourceForm>
  );
}
