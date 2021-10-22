import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { MessageStrip } from 'fundamental-react';

import { useGetList } from 'react-shared';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import {
  K8sNameField,
  KeyValueField,
  FormField,
} from 'shared/ResourceForm/components/FormComponents';
import {
  functionAvailableLanguages,
  getDefaultDependencies,
} from 'components/Lambdas/helpers/runtime';
import { CONFIG } from 'components/Lambdas/config';

import { createFunctionTemplate } from './helpers';

export function FunctionsCreate({
  namespace,
  formElementRef,
  onChange,
  resourceUrl,
}) {
  const { t } = useTranslation();
  const [func, setFunc] = useState(createFunctionTemplate(namespace));
  const {
    data: repositories,
  } = useGetList()(
    `/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespace}/gitrepositories`,
    { pollingInterval: 10000 },
  );

  const name = jp.value(func, '$.metadata.name');
  const type = jp.value(func, '$.spec.type');
  const runtime = jp.value(func, '$.spec.runtime');

  const runtimeOptions = Object.entries(functionAvailableLanguages).map(
    ([runtime, lang]) => ({
      key: runtime,
      text: lang,
    }),
  );

  const sourceTypeOptions = [
    {
      key: '',
      text: t('functions.create-view.labels.inline-editor'),
    },
    {
      key: 'git',
      text: t('functions.create-view.labels.git-repository'),
    },
  ];

  const repositoryOptions = repositories?.map(repository => ({
    key: repository.metadata.name,
    text: `${repository.metadata.name} (${repository.spec.url})`,
  }));

  useEffect(() => {
    if (!type) {
      jp.value(
        func,
        '$.spec.source',
        CONFIG.defaultLambdaCodeAndDeps[runtime].code,
      );
      jp.value(func, '$.spec.deps', getDefaultDependencies(name, runtime));
      jp.value(func, '$.spec.reference', undefined);
      jp.value(func, '$.spec.baseDir', undefined);
    } else if (type === 'git') {
      jp.value(
        func,
        '$.spec.source',
        repositoryOptions.length ? repositoryOptions[0].key : undefined,
      );
      jp.value(func, '$.spec.deps', undefined);
      jp.value(func, '$.spec.reference', 'main');
      jp.value(func, '$.spec.baseDir', '/');
    }
    setFunc({ ...func });
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!type) {
      jp.value(
        func,
        '$.spec.source',
        CONFIG.defaultLambdaCodeAndDeps[runtime].code,
      );
      jp.value(func, '$.spec.deps', getDefaultDependencies(name, runtime));
    }
  }, [runtime]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ResourceForm
      className="create-function-form"
      pluralKind="functions"
      singularName={t('functions.name_singular')}
      resource={func}
      setResource={setFunc}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('functions.name_singular')}
        setValue={name => {
          jp.value(func, '$.metadata.name', name);
          jp.value(func, "$.metadata.labels['app.kubernetes.io/name']", name);
          setFunc({ ...func });
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
        zrquired
        propertyPath="$.spec.runtime"
        label={t('functions.headers.runtime')}
        input={Inputs.Dropdown}
        options={runtimeOptions}
      />
      <FormField
        advanced
        required
        propertyPath="$.spec.type"
        label={t('functions.headers.source-type')}
        input={Inputs.Dropdown}
        options={sourceTypeOptions}
      />
      {func?.spec?.type === 'git' && !repositories.length && (
        <MessageStrip
          advanced
          className="fd-margin-top--sm"
          dismissible={false}
          type="warning"
        >
          {t('functions.create-view.errors.no-repository-found')}
        </MessageStrip>
      )}
      {func?.spec?.type === 'git' && repositories.length && (
        <>
          <FormField
            advanced
            required
            propertyPath="$.spec.source"
            label={t('functions.create-view.labels.repository')}
            input={Inputs.Dropdown}
            options={repositoryOptions}
          />
          <FormField
            advanced
            required
            propertyPath="$.spec.reference"
            label={t('functions.create-view.labels.reference')}
            tooltipContent={t('functions.create-view.inline-help.reference')}
            placeholder={t('functions.placeholders.reference')}
            input={Inputs.Text}
          />
          <FormField
            advanced
            required
            propertyPath="$.spec.baseDir"
            label={t('functions.create-view.labels.base-directory')}
            tooltipContent={t(
              'functions.create-view.inline-help.base-directory',
            )}
            placeholder={t('functions.placeholders.base-directory')}
            input={Inputs.Text}
          />
        </>
      )}
    </ResourceForm>
  );
}
