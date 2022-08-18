import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import jsonata from 'jsonata';

import { useDataSourcesContext } from './contexts/DataSources';

export function useJsonata(query, root, extras = {}) {
  const [value, setValue] = useState('');
  const { t } = useTranslation();
  const {
    store: dataSourceStore,
    requestRelatedResource,
  } = useDataSourcesContext();

  useEffect(() => {
    const dataSourceFetchers = Object.fromEntries(
      Object.entries(dataSourceStore).map(([id, def]) => () => {
        requestRelatedResource(root, id);
        return def.data;
      }),
    );

    if (!query) return '';
    try {
      jsonata(query).evaluate(
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
  }, [root, dataSourceStore]); // eslint-disable-line react-hooks/exhaustive-deps
  return value;
}
