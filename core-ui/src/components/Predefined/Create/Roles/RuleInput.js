import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMicrofrontendContext } from 'react-shared';
import { ResourceForm } from 'shared/ResourceForm';
import { ComboboxArrayInput, TextArrayInput } from 'shared/ResourceForm/fields';
import { InvalidRoleError } from './InvalidRoleError';

function unique(arr) {
  return [...new Set(arr)];
}

const nonResourceUrls = [
  '/healthz/ready',
  '/api',
  '/api/*',
  '/apis',
  '/apis/*',
  '/healthz',
  '/livez',
  '/openapi',
  '/openapi/*',
  '/readyz',
  '/version',
  '/version/',
];

const verbs = [
  'get',
  'list',
  'watch',
  'create',
  'update',
  'patch',
  'delete',
  'deletecollection',
  '*',
];

const extractApiGroup = groupVersion => {
  // handle core ('') group
  if (groupVersion === 'v1') return '';
  const [apiGroup] = groupVersion.split('/');
  return apiGroup;
};

export function RuleInput({
  rule,
  rules,
  setRules,
  isAdvanced,
  resourcesCache,
}) {
  const { namespaceId, groupVersions } = useMicrofrontendContext();
  const { t } = useTranslation();

  const EMPTY_STRING_KEY = 'core-api-group';
  // introduce special option for '' apiGroup - Combobox doesn't accept empty string key
  const apiGroupsInputOptions = unique(
    groupVersions.map(extractApiGroup),
  ).map(g =>
    g === '' ? { key: EMPTY_STRING_KEY, text: '(core)' } : { key: g, text: g },
  );

  // there's no endpoint for "all resources" - add just a '*' and specific resources
  // for already choosen apiGroups
  const availableResources = unique([
    ...(rule.apiGroups
      ?.flatMap(apiGroup => resourcesCache[apiGroup] || [])
      .map(r => r.name) || []),
    '*',
  ]);

  return (
    <ResourceForm.Wrapper
      isAdvanced={isAdvanced}
      resource={rule}
      setResource={() => setRules([...rules])}
    >
      <ComboboxArrayInput
        title={t('roles.headers.api-groups')}
        propertyPath="$.apiGroups"
        options={apiGroupsInputOptions}
        emptyStringKey={EMPTY_STRING_KEY}
        defaultOpen
      />
      <ComboboxArrayInput
        title={t('roles.headers.resources')}
        propertyPath="$.resources"
        options={availableResources.map(i => ({ key: i, text: i }))}
        defaultOpen
      />
      <ComboboxArrayInput
        title={t('roles.headers.verbs')}
        propertyPath="$.verbs"
        options={verbs.map(i => ({ key: i, text: i }))}
        defaultOpen
      />
      {isAdvanced && (
        <TextArrayInput
          title={t('roles.headers.resource-names')}
          propertyPath="$.resourceNames"
          inputProps={{
            placeholder: t('roles.headers.resource-names'),
          }}
        />
      )}
      {isAdvanced && !namespaceId && (
        <ComboboxArrayInput
          title={t('roles.headers.non-resource-urls')}
          propertyPath="$.nonResourceURLs"
          options={nonResourceUrls.map(i => ({ key: i, text: i }))}
        />
      )}
      <InvalidRoleError rule={rule} />
    </ResourceForm.Wrapper>
  );
}
