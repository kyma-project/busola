import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { last, mapValues } from 'lodash';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { DataSourcesContext } from '../contexts/DataSources';

export function useJsonata(
  // query,
  { resource, scope, arrayItems },
) {
  // console.log('useJsonata', query);
  // const [value, setValue] = useState(defaultValue);
  // const [error, setError] = useState(null);
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

  /*
    console.log('jsonata?', query);
    // if (!query) return [defaultValue, null];
    if (!query) {
      setValue(defaultValue);
      setError(null);
      return;
    }
    try {
      console.log('jsonata', query);
      jsonataWrapper(query).evaluate(
        scope || resource,
        {
          ...dataSourceFetchers,
          ...extras,
          root: resource,
          items: arrayItems,
          item: last(arrayItems) || resource,
        },
        (error, result) => {
          setValue(result);
          setError(null);
        },
      );
    } catch (e) {
      setValue(
        defaultValue ??
          t('extensibility.configuration-error', { error: e.message }),
      );
      setError(e);
    }
  }, [query, resource, scope, dataSourceStore, JSON.stringify(extras)]); // eslint-disable-line react-hooks/exhaustive-deps
  return [value, error];
  */

  // TODO
  return (query, defaultValue, extras = {}) => {
    if (!query) {
      return [defaultValue, null];
    }
    try {
      console.log('jsonata', query);
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
