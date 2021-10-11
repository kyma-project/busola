import React from 'react';
import { GenericList, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const Rules = resource => {
  const { t, i18n } = useTranslation();

  const headerRenderer = () => [
    t('roles.headers.api-groups'),
    t('roles.headers.resources'),
    t('roles.headers.resource-names'),
    t('roles.headers.non-resource-urls'),
    t('roles.headers.verbs'),
  ];

  const displayArrayValue = v => v?.join(', ') || EMPTY_TEXT_PLACEHOLDER;
  const rowRenderer = rule =>
    [
      rule.apiGroups,
      rule.resources,
      rule.resourceNames,
      rule.nonResourceURLs,
      rule.verbs,
    ].map(displayArrayValue);

  const textSearchProperties = [
    'verbs',
    'apiGroups',
    'resources',
    'resourceNames',
    'nonResourceURLs',
  ];

  return (
    <GenericList
      title={t('roles.headers.rules')}
      textSearchProperties={textSearchProperties}
      entries={resource.rules}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      i18n={i18n}
    />
  );
};
