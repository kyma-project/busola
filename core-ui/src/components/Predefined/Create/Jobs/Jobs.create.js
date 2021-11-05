import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

import { createJobTemplate, createJobPresets } from './templates';
import { JobSpecSection } from './SpecSection';
import { ContainerSection, ContainersSection } from './ContainersSection';

function isJobValid(job) {
  const containers = jp.value(job, '$.spec.template.spec.containers') || [];

  const areContainersValid =
    !!containers.length &&
    containers.every(c => c.command?.length > 0 || c.args?.length > 0);

  return areContainersValid;
}

export function JobsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();

  const [job, setJob] = useState(createJobTemplate(namespace));

  useEffect(() => {
    setCustomValid(isJobValid(job));
  }, [job, setCustomValid]);

  return (
    <ResourceForm
      pluralKind="jobs"
      singularName={t(`jobs.name-singular`)}
      resource={job}
      setResource={setJob}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={createJobPresets(namespace, t)}
      createUrl={`/apis/batch/v1/namespaces/${namespace}/jobs`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('jobs.name-singular')}
        setValue={name => {
          jp.value(job, '$.metadata.name', name);
          jp.value(job, "$.metadata.labels['app.kubernetes.io/name']", name);
          setJob({ ...job });
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

      <JobSpecSection advanced propertyPath="$.spec" />

      <ContainerSection simple propertyPath="$.spec.template.spec.containers" />

      <ContainersSection
        advanced
        propertyPath="$.spec.template.spec.containers"
      />
    </ResourceForm>
  );
}
