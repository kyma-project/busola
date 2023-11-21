import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';
import { Icon } from '@ui5/webcomponents-react';

function VerbStatus({ rule, verb }) {
  const hasVerb = rule.verbs?.includes(verb) || rule.verbs?.includes('*');

  return hasVerb ? (
    <Icon name="accept" aria-hidden aria-label={verb} data-testid={verb} />
  ) : (
    <span data-testid={verb}>{EMPTY_TEXT_PLACEHOLDER}</span>
  );
}

export const Rules = resource => {
  const isNamespaced = resource.metadata.namespace;
  const { t } = useTranslation();

  const headerRenderer = () => {
    const commonFields = [
      'Get',
      'List',
      'Watch',
      'Create',
      'Update',
      'Patch',
      'Delete',
      'DeleteCollection',
      t('roles.headers.custom'),
      t('roles.headers.api-groups'),
      t('roles.headers.resources'),
      t('roles.headers.resource-names'),
    ];

    if (isNamespaced) {
      return commonFields;
    } else {
      return [...commonFields, t('roles.headers.non-resource-urls')];
    }
  };

  const standardVerbs = [
    'get',
    'list',
    'watch',
    'create',
    'update',
    'patch',
    'delete',
    'deletecollection',
  ];

  const displayArrayValue = v => v?.join(', ') || EMPTY_TEXT_PLACEHOLDER;
  const rowRenderer = rule => {
    const commonFields = [
      ...standardVerbs.map(verb => ({
        content: <VerbStatus rule={rule} verb={verb} />,
        style: { textAlign: 'center' },
      })),
      rule.verbs?.filter(v => !standardVerbs.includes(v)).join(', ') ||
        EMPTY_TEXT_PLACEHOLDER,
      displayArrayValue(
        (rule.apiGroups || []).map(apiGroup =>
          apiGroup ? apiGroup : '(core)',
        ),
      ),
      displayArrayValue(rule.resources),
      displayArrayValue(rule.resourceNames),
    ];

    if (isNamespaced) {
      return commonFields;
    } else {
      return [...commonFields, displayArrayValue(rule.nonResourceURLs)];
    }
  };

  const textSearchProperties = [
    'verbs',
    'apiGroups',
    'resources',
    'resourceNames',
    'nonResourceURLs',
  ];

  return (
    <GenericList
      key="rules"
      title={t('roles.headers.rules')}
      entries={resource.rules || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      searchSettings={{
        textSearchProperties,
      }}
    />
  );
};
