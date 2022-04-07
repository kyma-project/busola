import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { MessageStrip } from 'fundamental-react';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  K8sNameField,
  KeyValueField,
  RuntimeResources,
} from 'shared/ResourceForm/fields';
import {
  functionAvailableLanguages,
  getDefaultDependencies,
} from 'components/Lambdas/helpers/runtime';
import { CONFIG } from 'components/Lambdas/config';
import { useConfigData } from 'components/Lambdas/helpers/misc/useConfigData';

import { createFunctionTemplate } from './helpers';

function usePrevious(value) {
  const ref = useRef('');
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export function FunctionsCreate({
  namespace,
  formElementRef,
  onChange,
  setCustomValid,
}) {
  useConfigData();
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
  const minReplicas = jp.value(func, '$.spec.minReplicas');
  const maxReplicas = jp.value(func, '$.spec.maxReplicas');

  const [runtime, setRuntime] = useState(jp.value(func, '$.spec.runtime'));
  const previousRuntime = usePrevious(runtime);

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
      if (previousRuntime?.substring(0, 4) !== runtime?.substring(0, 4)) {
        jp.value(
          func,
          '$.spec.source',
          CONFIG.defaultLambdaCodeAndDeps[runtime].code,
        );

        jp.value(func, '$.spec.deps', getDefaultDependencies(name, runtime));
      }
    }
  }, [runtime]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!type) {
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
    if (maxReplicas && maxReplicas < minReplicas) {
      jp.value(func, '$.spec.maxReplicas', minReplicas);
      setFunc({ ...func });
    }
  }, [minReplicas]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (maxReplicas && maxReplicas < minReplicas) {
      jp.value(func, '$.spec.minReplicas', maxReplicas);
      setFunc({ ...func });
    }
  }, [maxReplicas]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ResourceForm
      className="create-function-form"
      pluralKind="functions"
      singularName={t('functions.name_singular')}
      resource={func}
      setResource={setFunc}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespace}/functions`}
      setCustomValid={setCustomValid}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('functions.name_singular')}
        setValue={name => {
          jp.value(func, '$.metadata.name', name);
          jp.value(func, "$.metadata.labels['app.kubernetes.io/name']", name);
          jp.value(func, '$.spec.deps', getDefaultDependencies(name, runtime));
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
      <ResourceForm.FormField
        required
        propertyPath="$.spec.runtime"
        setValue={value => {
          setRuntime(value);
          jp.value(func, '$.spec.runtime', value);
        }}
        label={t('functions.headers.runtime')}
        input={Inputs.Dropdown}
        options={runtimeOptions}
      />
      <ResourceForm.FormField
        advanced
        required
        propertyPath="$.spec.type"
        label={t('functions.headers.source-type')}
        defaultValue=""
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
      <ResourceForm.FormField
        advanced
        required
        propertyPath="$.spec.minReplicas"
        label={t('functions.details.title.minimum-replicas')}
        input={Inputs.Number}
        min={1}
      />
      <ResourceForm.FormField
        advanced
        required
        propertyPath="$.spec.maxReplicas"
        label={t('functions.details.title.maximum-replicas')}
        input={Inputs.Number}
        min={0}
      />
      <RuntimeResources
        advanced
        title={t('functions.details.title.runtime-profile')}
        propertyPath="$.spec.resources"
        presets={CONFIG['functionResourcesPresets']}
      />
      <RuntimeResources
        advanced
        title={t('functions.details.title.build-job')}
        propertyPath="$.spec.buildResources"
        presets={CONFIG['buildJobResourcesPresets']}
      />
      {func?.spec?.type === 'git' && repositories.length && (
        <>
          <ResourceForm.FormField
            advanced
            required
            propertyPath="$.spec.source"
            label={t('functions.create-view.labels.repository')}
            input={Inputs.Dropdown}
            options={repositoryOptions}
          />
          <ResourceForm.FormField
            advanced
            required
            propertyPath="$.spec.reference"
            label={t('functions.create-view.labels.reference')}
            tooltipContent={t('functions.create-view.inline-help.reference')}
            placeholder={t('functions.placeholders.reference')}
            input={Inputs.Text}
          />
          <ResourceForm.FormField
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
FunctionsCreate.resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
  relations: [
    {
      kind: 'Service',
    },
  ],
});
