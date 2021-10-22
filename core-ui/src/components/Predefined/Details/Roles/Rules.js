import React from 'react';
import { GenericList, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Icon } from 'fundamental-react';

function VerbStatus({ rule, verb }) {
  const hasVerb = rule.verbs?.includes(verb) || rule.verbs?.includes('*');

  return hasVerb ? <Icon glyph="accept" ariaHidden /> : EMPTY_TEXT_PLACEHOLDER;
}

export const Rules = resource => {
  const isNamespaced = resource.metadata.namespace;
  const { t, i18n } = useTranslation();

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
        rule.apiGroups.map(apiGroup => (apiGroup ? apiGroup : '""')),
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
      className="rules-list"
      title={t('roles.headers.rules')}
      textSearchProperties={textSearchProperties}
      entries={resource.rules || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      i18n={i18n}
    />
  );
};
