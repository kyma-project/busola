import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';

import { createJobTemplate, createJobPresets } from './templates';
import { JobSpecSection } from './SpecSection';
import { ContainerSection, ContainersSection } from './ContainersSection';
import { MessageStrip } from 'fundamental-react';

function isJobValid(job) {
  const isNameValid = jp.value(job, '$.metadata.name');

  const containers = jp.value(job, '$.spec.template.spec.containers') || [];

  const areContainersValid =
    !!containers.length &&
    containers.every(c => c.command?.length > 0 || c.args?.length > 0);

  return isNameValid && areContainersValid;
}

function JobsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialJob,
  resourceUrl,
}) {
  const { t } = useTranslation();

  const [job, setJob] = useState(
    initialJob ? cloneDeep(initialJob) : createJobTemplate(namespace),
  );

  useEffect(() => {
    setCustomValid(isJobValid(job));
  }, [job, setCustomValid]);

  return (
    <ResourceForm
      pluralKind="jobs"
      singularName={t(`jobs.name-singular`)}
      resource={job}
      setResource={setJob}
      initialResource={initialJob}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={createJobPresets(namespace, t)}
      createUrl={resourceUrl}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('jobs.name-singular')}
        setValue={name => {
          jp.value(job, '$.metadata.name', name);
          jp.value(job, "$.metadata.labels['app.kubernetes.io/name']", name);
          setJob({ ...job });
        }}
        readOnly={!!initialJob}
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

      <JobSpecSection advanced propertyPath="$.spec" readOnly={!!initialJob} />

      <ContainerSection
        simple
        propertyPath="$.spec.template.spec.containers"
        readOnly={!!initialJob}
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
JobsCreate.allowEdit = true;
export { JobsCreate };
