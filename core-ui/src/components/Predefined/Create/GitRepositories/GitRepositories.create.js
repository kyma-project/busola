import React, { useEffect, useState } from 'react';
import { useNotification } from 'react-shared';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import LuigiClient from '@luigi-project/client';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import {
  K8sNameField,
  KeyValueField,
  FormField,
} from 'shared/ResourceForm/components/FormComponents';
import { isGitUrl } from 'components/Lambdas/helpers/repositories';

import { createRepositoryTemplate } from './helpers';

function GitRepositoriesCreate({
  namespace,
  formElementRef,
  onChange,
  resourceUrl,
}) {
  const { t } = useTranslation();
  const notification = useNotification();
  const [repository, setRepository] = useState(
    createRepositoryTemplate(namespace),
  );

  const authType = jp.value(repository, '$.spec.auth.type');
  const url = jp.value(repository, '$.spec.url');

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

  function validateRepositoryUrl() {
    if (!url) {
      return;
    }

    const isCorrectUrl = isGitUrl(url);
    if (!isCorrectUrl) {
      return t('functions.repository-list.errors.invalid-url');
    }
  }

  const getUrlValidationState = () => {
    const message = validateRepositoryUrl();
    if (message) {
      return {
        state: 'error',
        text: message,
      };
    } else {
      return null;
    }
  };

  return (
    <ResourceForm
      className="create-function-form"
      pluralKind="gitrepositories"
      singularName={t('git-repositories.name_singular')}
      resource={repository}
      setResource={setRepository}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      afterCreatedFn={() => {
        notification.notifySuccess({
          content: t('common.create-form.messages.create-success', {
            resourceType: t('git-repositories.name_singular'),
          }),
        });

        LuigiClient.linkManager()
          .fromContext('namespace')
          .navigate('/gitrepositories');
      }}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
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
      <FormField
        required
        propertyPath="$.spec.url"
        label={t('functions.repository-list.labels.url')}
        tooltipContent={t('functions.repository-list.inline-help.url')}
        placeholder={t('git-repositories.placeholders.url')}
        input={Inputs.Text}
        validationState={getUrlValidationState()}
      />
      <FormField
        required
        propertyPath="$.spec.auth.type"
        label={t('functions.repository-list.labels.auth')}
        tooltipContent={t('functions.repository-list.inline-help.auth')}
        input={Inputs.Dropdown}
        options={authTypeOptions}
        value={authType || ''}
      />
      {!!authType && (
        <FormField
          required
          propertyPath="$.spec.auth.secretName"
          label={t('functions.repository-list.labels.secret-name')}
          tooltipContent={'git-repositories.tooltips.secret-name'}
          input={({ value, setValue }) => (
            <K8sResourceSelectWithUseGetList
              compact
              required
              value={value}
              resourceType={t('functions.repository-list.labels.secret-name')}
              onSelect={setValue}
              url={`/api/v1/namespaces/${namespace}/secrets`}
            />
          )}
        />
      )}
    </ResourceForm>
  );
}
GitRepositoriesCreate.secrets = (t, context) => [
  {
    title: t('git-repositories.secret-basic'),
    data: ['username', 'password'],
  },
  {
    title: t('git-repositories.secret-ssh-key'),
    data: ['key'],
  },
];

export { GitRepositoriesCreate };
