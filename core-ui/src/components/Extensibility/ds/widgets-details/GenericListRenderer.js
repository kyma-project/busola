import React from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';

export function GenericListRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
}) {
  const { t, i18n } = useTranslation();

  return (
    <GenericList
      title={'Title'}
      showSearchField={''}
      textSearchProperties={''}
      showSearchSuggestion={false}
      entries={''}
      headerRenderer={''}
      rowRenderer={''}
      noSearchResultMessage={''}
      i18n={i18n}
    />
  );
}
{
  /* <GenericList
  textSearchProperties={textSearchProperties}
  showSearchSuggestion={false}
  entries={entries}
  headerRenderer={headerRenderer}
  rowRenderer={rowRenderer}
  actions={actions}
  extraHeaderContent={extraHeaderContent}
  noSearchResultMessage={t('clusters.list.no-clusters-found')}
  i18n={i18n}
  allowSlashShortcut
/>; */
}
