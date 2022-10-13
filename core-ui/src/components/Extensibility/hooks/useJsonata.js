import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { DataSourcesContext } from '../contexts/DataSources';
import { mapValues } from 'lodash';

export function useJsonata(query, root, extras = {}) {
  const [value, setValue] = useState('');
  const { t } = useTranslation();
  const {
    dataSources,
    store: dataSourceStore,
    requestRelatedResource,
  } = useContext(DataSourcesContext);

  useEffect(() => {
    const dataSourceFetchers = mapValues(dataSources, (_, id) => {
      return () => {
        requestRelatedResource(root, id);
        return dataSourceStore?.[id]?.data;
      };
    });

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
  }, [root, dataSourceStore, JSON.stringify(extras)]); // eslint-disable-line react-hooks/exhaustive-deps
  return value;
}
