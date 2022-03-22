import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, BusyIndicator } from 'fundamental-react';
import * as jp from 'jsonpath';
import { useMicrofrontendContext } from 'react-shared';
import { ResourceForm } from 'shared/ResourceForm';
import { ComboboxArrayInput, TextArrayInput } from 'shared/ResourceForm/fields';
import { InvalidRoleError } from './InvalidRoleError';
import { useResourcesForApiGroups } from './useResourcesForApiGroups';
import {
  EMPTY_API_GROUP_KEY,
  getApiGroupInputOptions,
  unique,
} from './helpers';

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

export function RuleInput({ rule, rules, setRules, isAdvanced }) {
  const { namespaceId, groupVersions } = useMicrofrontendContext();
  const { t } = useTranslation();

  // dictionary of pairs (apiGroup: resources in that apiGroup)

  const apiRules = rule?.apiGroups?.flat();
  const {
    cache: resourcesCache,
    fetchResources,
    loading,
  } = useResourcesForApiGroups(apiRules ? [...new Set(apiRules)] : []);
  const apiRulesString = apiRules?.toString();
  useEffect(() => {
    fetchResources();
  }, [apiRulesString]); // eslint-disable-line react-hooks/exhaustive-deps
  // introduce special option for '' apiGroup - Combobox doesn't accept empty string key
  const apiGroupsInputOptions = getApiGroupInputOptions(groupVersions);

  // there's no endpoint for "all resources" - add just a '*' and specific resources
  // for already choosen apiGroups
  const availableResources = unique([
    ...(rule.apiGroups
      ?.flatMap(apiGroup => resourcesCache[apiGroup] || [])
      .map(r => r.name) || []),
    '*',
  ]);

  const addAllApiGroups = () => {
    jp.value(
      rule,
      '$.apiGroups',
      apiGroupsInputOptions.map(g => g.key),
    );
    setRules([...rules]);
  };

  const addAllResources = () => {
    jp.value(
      rule,
      '$.resources',
      availableResources.filter(r => r !== '*'),
    );
    setRules([...rules]);
  };

  const addAllVerbs = () => {
    jp.value(
      rule,
      '$.verbs',
      verbs.filter(r => r !== '*'),
    );
    setRules([...rules]);
  };

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
        emptyStringKey={EMPTY_API_GROUP_KEY}
        defaultOpen
        actions={
          <Button compact onClick={addAllApiGroups}>
            {t('roles.add-all')}
          </Button>
        }
      />
      <ComboboxArrayInput
        title={t('roles.headers.resources')}
        propertyPath="$.resources"
        options={availableResources.map(i => ({ key: i, text: i }))}
        defaultOpen
        actions={[
          <BusyIndicator size="s" show={loading} />,
          <Button compact onClick={addAllResources} disabled={loading}>
            {t('roles.add-all')}
          </Button>,
        ]}
      />
      <ComboboxArrayInput
        title={t('roles.headers.verbs')}
        propertyPath="$.verbs"
        options={verbs.map(i => ({ key: i, text: i }))}
        defaultOpen
        actions={[
          <BusyIndicator size="s" show={loading} />,
          <Button compact onClick={addAllVerbs} disabled={loading}>
            {t('roles.add-all')}
          </Button>,
        ]}
      />
      {isAdvanced && (
        <TextArrayInput
          title={t('roles.headers.resource-names')}
          propertyPath="$.resourceNames"
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
