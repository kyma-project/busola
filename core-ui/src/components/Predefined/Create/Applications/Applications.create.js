import React, { useState } from 'react';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';
import { useTranslation } from 'react-i18next';
import { createApplicationTemplate } from './templates';

function ApplicationsCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialApplication,
  resourceUrl,
}) {
  const { t } = useTranslation();

  const [application, setApplication] = useState(
    initialApplication
      ? cloneDeep(initialApplication)
      : createApplicationTemplate(),
  );

  const handleNameChange = name => {
    jp.value(application, '$.metadata.name', name);
    jp.value(application, '$.spec.accessLabel', name);

    setApplication({ ...application });
  };

  return (
    <ResourceForm
      pluralKind="applications"
      singularName={t('applications.name_singular')}
      resource={application}
      setResource={setApplication}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      initialResource={initialApplication}
      setCustomValid={setCustomValid}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('applications.name_singular')}
        readOnly={!!initialApplication}
        setValue={handleNameChange}
        validate={value => !!value}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.description"
        label={t('applications.labels.description')}
        placeholder={t('applications.placeholders.description')}
        input={Inputs.Text}
        aria-label="description"
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
    </ResourceForm>
  );
}

ApplicationsCreate.allowEdit = true;
export { ApplicationsCreate };
