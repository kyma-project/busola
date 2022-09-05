import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import { createJobTemplate, createJobPresets } from './templates';
import { JobSpecSection } from './SpecSection';
import { ContainerSection, ContainersSection } from './ContainersSection';
import { MessageStrip } from 'fundamental-react';

function isJobValid(job = {}) {
  const isNameValid = jp.value(job, '$.metadata.name');

  const containers = jp.value(job, '$.spec.template.spec.containers') || [];

  const areContainersValid = !!containers.length;

  return isNameValid && areContainersValid;
}

export function JobCreate({
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
      initialResource={initialJob}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={
        !initialJob && createJobPresets(namespace, t, defaultSidecarAnnotations)
      }
      createUrl={resourceUrl}
    >
      <JobSpecSection advanced propertyPath="$.spec" readOnly={!!initialJob} />

      <ContainerSection
        simple
        propertyPath="$.spec.template.spec.containers"
        readOnly={!!initialJob}
        prefix={prefix}
      />

      <ContainersSection
        advanced
        propertyPath="$.spec.template.spec.containers"
        readOnly={!!initialJob}
      />

      <MessageStrip type="information" className="fd-margin-top--sm">
        {t('jobs.create-modal.containers-readonly-in-edit')}
      </MessageStrip>
    </ResourceForm>
  );
}
JobCreate.allowEdit = true;
