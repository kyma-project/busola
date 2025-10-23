import { useTranslation } from 'react-i18next';
import { BusyIndicator, Button, MessageStrip } from '@ui5/webcomponents-react';
import jp from 'jsonpath';
import { ResourceForm } from 'shared/ResourceForm';
import { ComboboxArrayInput, TextArrayInput } from 'shared/ResourceForm/fields';
import { InvalidRoleError } from './InvalidRoleError';
import { useResourcesForApiGroups } from './useResourcesForApiGroups';
import {
  EMPTY_API_GROUP_KEY,
  getApiGroupInputOptions,
  unique,
} from './helpers';
import { useAtomValue } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { groupVersionsAtom } from 'state/discoverability/groupVersionsAtom';
import { getDescription } from 'shared/helpers/schema';

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

export function RuleInput({ rule, rules, setRules, schema }) {
  const groupVersions = useAtomValue(groupVersionsAtom);
  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const { t } = useTranslation();

  const apiGroupDesc = getDescription(schema, 'rules.apiGroups');
  const resourcesDesc = getDescription(schema, 'rules.resources');
  const verbsDesc = getDescription(schema, 'rules.verbs');
  const resourceNamesDesc = getDescription(schema, 'rules.resourceNames');
  const nonResourceURLsDesc = getDescription(schema, 'rules.nonResourceURLs');

  if (!Array.isArray(rule?.apiGroups)) {
    rule.apiGroups = [];
  }

  // dictionary of pairs (apiGroup: resources in that apiGroup)
  const apiRules = rule.apiGroups.flat();
  const {
    cache: resourcesCache,
    fetchResources,
    loadable,
    loading,
  } = useResourcesForApiGroups([...new Set(apiRules)]);
  // introduce special option for '' apiGroup - Combobox doesn't accept empty string key
  const apiGroupsInputOptions = getApiGroupInputOptions(groupVersions);

  // there's no endpoint for "all resources" - add just a '*' and specific resources
  // for already choosen apiGroups
  const getAvailableResources = (resourcesCache) =>
    unique([
      ...(rule.apiGroups
        .flatMap((apiGroup) => resourcesCache[apiGroup] || [])
        .map((r) => r.name) || []),
      '*',
    ]);
  const availableResources = getAvailableResources(resourcesCache);

  const addAllApiGroups = () => {
    jp.value(rule, '$.apiGroups', [
      '',
      ...apiGroupsInputOptions
        .map((g) => g.key)
        .filter((k) => k !== EMPTY_API_GROUP_KEY),
    ]);
    setRules([...rules]);
  };

  const addAllResources = () => {
    fetchResources()?.then((resourcesCache) => {
      const availableResources = getAvailableResources(resourcesCache);
      jp.value(
        rule,
        '$.resources',
        availableResources.filter((r) => r !== '*'),
      );
      setRules([...rules]);
    });
  };

  const addAllVerbs = () => {
    jp.value(
      rule,
      '$.verbs',
      verbs.filter((r) => r !== '*'),
    );
    setRules([...rules]);
  };

  return (
    <ResourceForm.Wrapper
      resource={rule}
      setResource={() => setRules([...rules])}
    >
      <ComboboxArrayInput
        noEdit
        filterOptions
        title={t('roles.headers.api-groups')}
        propertyPath="$.apiGroups"
        sectionTooltipContent={t(apiGroupDesc, { defaultValue: apiGroupDesc })}
        options={apiGroupsInputOptions}
        emptyStringKey={EMPTY_API_GROUP_KEY}
        defaultOpen
        nestingLevel={2}
        actions={
          <Button icon="add" onClick={addAllApiGroups} design="Transparent">
            {t('common.buttons.add-all')}
          </Button>
        }
      />
      <ComboboxArrayInput
        noEdit
        filterOptions
        title={t('roles.headers.resources')}
        propertyPath="$.resources"
        sectionTooltipContent={t(resourcesDesc, {
          defaultValue: resourcesDesc,
        })}
        options={availableResources.map((i) => ({ key: i, text: i }))}
        defaultOpen
        nestingLevel={2}
        newItemActionWidth={2}
        newItemAction={
          loading ? (
            <BusyIndicator size="S" active={true} delay="0" />
          ) : (
            <Button
              design="Transparent"
              onClick={fetchResources}
              disabled={!loadable}
              accessibleName={t('roles.buttons.load-resources')}
              tooltip={t('roles.tooltips.load')}
            >
              {t('roles.buttons.load-resources')}
            </Button>
          )
        }
        actions={[
          <Button
            icon="add"
            design="Transparent"
            onClick={addAllResources}
            disabled={loading || !apiRules?.length}
          >
            {t('common.buttons.add-all')}
          </Button>,
        ]}
      />
      {loadable && (
        <MessageStrip
          design="Information"
          hideCloseButton
          className="sap-margin-bottom-small"
        >
          {t('roles.messages.load-resources')}
        </MessageStrip>
      )}
      <ComboboxArrayInput
        filterOptions
        title={t('roles.headers.verbs')}
        propertyPath="$.verbs"
        sectionTooltipContent={t(verbsDesc, { defaultValue: verbsDesc })}
        options={verbs.map((i) => ({ key: i, text: i }))}
        defaultOpen
        nestingLevel={2}
        actions={[
          <Button icon="add" onClick={addAllVerbs} design="Transparent">
            {t('common.buttons.add-all')}
          </Button>,
        ]}
      />
      <TextArrayInput
        title={t('roles.headers.resource-names')}
        propertyPath="$.resourceNames"
        sectionTooltipContent={t(resourceNamesDesc, {
          defaultValue: resourceNamesDesc,
        })}
        nestingLevel={2}
      />
      {!namespaceId && (
        <ComboboxArrayInput
          title={t('roles.headers.non-resource-urls')}
          propertyPath="$.nonResourceURLs"
          sectionTooltipContent={t(nonResourceURLsDesc, {
            defaultValue: nonResourceURLsDesc,
          })}
          nestingLevel={2}
          options={nonResourceUrls.map((i) => ({ key: i, text: i }))}
        />
      )}
      <InvalidRoleError rule={rule} />
    </ResourceForm.Wrapper>
  );
}
