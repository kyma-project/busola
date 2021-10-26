import React, { useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import { createJobTemplate } from './helpers';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

export function JobsCreate({ onChange, formElementRef, namespace }) {
  const { t } = useTranslation();

  const [job, setJob] = useState(createJobTemplate(namespace));

  return (
    <ResourceForm
      pluralKind="jobs"
      singularName={t('jobs.title')}
      resource={job}
      setResource={setJob}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/apis/batch/v1/namespaces/${namespace}/jobs/`}
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
    </ResourceForm>
  );
}
