import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { last, mapValues } from 'lodash';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { DataSourcesContext } from '../contexts/DataSources';

export function useJsonata(
  // query,
  { resource, scope, arrayItems },
) {
  const [dataSourceFetchers, setDataSourceFetchers] = useState({});
  const { t } = useTranslation();
  const {
    dataSources,
    store: dataSourceStore,
    requestRelatedResource,
  } = useContext(DataSourcesContext);

  useEffect(() => {
    const dataSourceFetchers = mapValues(dataSources, (_, id) => {
      return () => {
        requestRelatedResource(resource, id);
        return dataSourceStore?.[id]?.data;
      };
    });
    setDataSourceFetchers(dataSourceFetchers);
  }, [dataSourceStore]); // eslint-disable-line react-hooks/exhaustive-deps

  return (query, extras = {}, defaultValue = null) => {
    if (!query) {
      return [defaultValue, null];
    }
    try {
      const value = jsonataWrapper(query).evaluate(scope || resource, {
        ...dataSourceFetchers,
        ...extras,
        root: resource,
        items: arrayItems,
        item: last(arrayItems) || resource,
      });
      return [value, null];
    } catch (e) {
      return [t('extensibility.configuration-error', { error: e.message }), e];
    }
  };
}
