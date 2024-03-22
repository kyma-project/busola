import { useTranslation } from 'react-i18next';
import { BusyIndicator, Button, MessageStrip } from '@ui5/webcomponents-react';
import * as jp from 'jsonpath';
import { ResourceForm } from 'shared/ResourceForm';
import { ComboboxArrayInput, TextArrayInput } from 'shared/ResourceForm/fields';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { InvalidRoleError } from './InvalidRoleError';
import { useResourcesForApiGroups } from './useResourcesForApiGroups';
import {
  EMPTY_API_GROUP_KEY,
  getApiGroupInputOptions,
  unique,
} from './helpers';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { groupVersionState } from 'state/discoverability/groupVersionsSelector';
import { spacing } from '@ui5/webcomponents-react-base';

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

export function RuleInput({ rule, rules, setRules }) {
  const groupVersions = useRecoilValue(groupVersionState);
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const { t } = useTranslation();

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
  const getAvailableResources = resourcesCache =>
    unique([
      ...(rule.apiGroups
        .flatMap(apiGroup => resourcesCache[apiGroup] || [])
        .map(r => r.name) || []),
      '*',
    ]);
  const availableResources = getAvailableResources(resourcesCache);

  const addAllApiGroups = () => {
    jp.value(rule, '$.apiGroups', [
      '',
      ...apiGroupsInputOptions
        .map(g => g.key)
        .filter(k => k !== EMPTY_API_GROUP_KEY),
    ]);
    setRules([...rules]);
  };

  const addAllResources = () => {
    fetchResources()?.then(resourcesCache => {
      const availableResources = getAvailableResources(resourcesCache);
      jp.value(
        rule,
        '$.resources',
        availableResources.filter(r => r !== '*'),
      );
      setRules([...rules]);
    });
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
      resource={rule}
      setResource={() => setRules([...rules])}
    >
      <ComboboxArrayInput
        noEdit
        filterOptions
        title={t('roles.headers.api-groups')}
        propertyPath="$.apiGroups"
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
        options={availableResources.map(i => ({ key: i, text: i }))}
        defaultOpen
        nestingLevel={2}
        newItemActionWidth={2}
        newItemAction={
          loading ? (
            <BusyIndicator size="Small" active={true} delay="0" />
          ) : (
            <Tooltip content={t('roles.tooltips.load')}>
              <Button
                design="Transparent"
                onClick={fetchResources}
                disabled={!loadable}
                aria-label={t('roles.buttons.load')}
              >
                {t('roles.buttons.load-resources')}
              </Button>
            </Tooltip>
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
          style={{
            marginBottom: spacing.sapUiSmallMarginBottom.marginBottom,
          }}
        >
          {t('roles.messages.load-resources')}
        </MessageStrip>
      )}
      <ComboboxArrayInput
        filterOptions
        title={t('roles.headers.verbs')}
        propertyPath="$.verbs"
        options={verbs.map(i => ({ key: i, text: i }))}
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
        nestingLevel={2}
      />
      {!namespaceId && (
        <ComboboxArrayInput
          title={t('roles.headers.non-resource-urls')}
          propertyPath="$.nonResourceURLs"
          nestingLevel={2}
          options={nonResourceUrls.map(i => ({ key: i, text: i }))}
        />
      )}
      <InvalidRoleError rule={rule} />
    </ResourceForm.Wrapper>
  );
}
