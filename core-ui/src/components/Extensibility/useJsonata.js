import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { jsonataWrapper } from './jsonataWrapper';

import { useDataSourcesContext } from './contexts/DataSources';

export function useJsonata(query, root, extras = {}) {
  const [value, setValue] = useState('');
  const { t } = useTranslation();
  const {
    dataSources,
    store: dataSourceStore,
    requestRelatedResource,
  } = useDataSourcesContext();

  useEffect(() => {
    const dataSourceFetchers = Object.fromEntries(
      Object.entries(dataSources).map(([id, def]) => [
        id,
        () => {
          requestRelatedResource(root, id);
          return dataSourceStore?.[id]?.data;
        },
      ]),
    );

    if (!query) return '';
    try {
      jsonataWrapper(query).evaluate(
        root,
        {
          ...dataSourceFetchers,
          ...extras,
        },
        (error, result) => {
          setValue(result);
        },
      );
    } catch (e) {
      setValue(t('extensibility.configuration-error', { error: e.message }));
    }
  }, [root, dataSourceStore, extras]); // eslint-disable-line react-hooks/exhaustive-deps
  return value;
}
