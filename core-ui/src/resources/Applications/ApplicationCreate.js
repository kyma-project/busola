import React, { useState } from 'react';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

import { createApplicationTemplate } from './templates';

export function ApplicationCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialApplication,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();

  const [application, setApplication] = useState(
    initialApplication
      ? cloneDeep(initialApplication)
      : createApplicationTemplate(),
  );

  const handleNameChange = name => {
    jp.value(application, '$.metadata.name', name);
    jp.value(application, "$.metadata.labels['app.kubernetes.io/name']", name);
    jp.value(application, '$.spec.accessLabel', name);

    setApplication({ ...application });
  };

  return (
    <ResourceForm
      {...props}
      pluralKind="applications"
      singularName={t('applications.name_singular')}
      resource={application}
      setResource={setApplication}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      initialResource={initialApplication}
      setCustomValid={setCustomValid}
      handleNameChange={handleNameChange}
    >
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.description"
        label={t('applications.labels.description')}
        placeholder={t('applications.placeholders.description')}
        input={Inputs.Text}
        aria-label="description"
      />
    </ResourceForm>
  );
}

ApplicationCreate.allowEdit = true;
