import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';

import { createRepositoryTemplate } from './helpers';

function isGitUrl(str) {
  var regex = /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\/?|#[-\d\w._]+?)$/;
  return regex.test(str);
}

export function GitRepositoryCreate({
  namespace,
  formElementRef,
  onChange,
  resourceUrl,
  setCustomValid,
  resource: initialRepository,
  ...props
}) {
  const { t } = useTranslation();
  const [repository, setRepository] = useState(
    initialRepository
      ? cloneDeep(initialRepository)
      : createRepositoryTemplate(namespace),
  );

  const authType = jp.value(repository, '$.spec.auth.type');
  const url = jp.value(repository, '$.spec.url');

  useEffect(() => {
    const isNameValid = !!jp.value(repository, '$.metadata.name');
    const isUrlValid = isGitUrl(url);

    setCustomValid(isNameValid && isUrlValid);
  });

  useEffect(() => {
    if (!authType) {
      jp.value(repository, '$.spec.auth', undefined);
      setRepository({ ...repository });
    }
  }, [authType]); //eslint-disable-line react-hooks/exhaustive-deps

  const authTypeOptions = [
    {
      key: '',
      text: t('git-repositories.auth.public'),
    },
    {
      key: 'basic',
      text: t('git-repositories.auth.basic'),
    },
    {
      key: 'key',
      text: t('git-repositories.auth.ssh-key'),
    },
  ];

  const getUrlValidationState = () => {
    return url && !isGitUrl(url)
      ? {
          state: 'error',
          text: t('git-repositories.errors.invalid-url'),
        }
      : {};
  };

  return (
    <ResourceForm
      className="create-function-form"
      pluralKind="gitrepositories"
      singularName={t('git-repositories.name_singular')}
      resource={repository}
      setResource={setRepository}
      initialResource={initialRepository}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      {...props}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        readOnly={!!initialRepository}
        kind={t('git-repositories.name_singular')}
        setValue={name => {
          jp.value(repository, '$.metadata.name', name);
          jp.value(
            repository,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setRepository({ ...repository });
        }}
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
      <ResourceForm.FormField
        required
        propertyPath="$.spec.url"
        label={t('git-repositories.labels.url')}
        tooltipContent={t('git-repositories.tooltips.url')}
        placeholder={t('git-repositories.placeholders.url')}
        input={Inputs.Text}
        validationState={getUrlValidationState()}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.spec.auth.type"
        label={t('git-repositories.labels.auth')}
        tooltipContent={t('git-repositories.tooltips.auth')}
        defaultValue=""
        input={Inputs.Dropdown}
        options={authTypeOptions}
      />
      {!!authType && (
        <ResourceForm.FormField
          required
          propertyPath="$.spec.auth.secretName"
          label={t('git-repositories.labels.secret')}
          tooltipContent={t('git-repositories.tooltips.secret')}
          input={({ value, setValue }) => (
            <K8sResourceSelectWithUseGetList
              compact
              required
              value={value}
              resourceType={t('git-repositories.labels.secret')}
              onSelect={setValue}
              url={`/api/v1/namespaces/${namespace}/secrets`}
            />
          )}
        />
      )}
    </ResourceForm>
  );
}
GitRepositoryCreate.allowEdit = true;
