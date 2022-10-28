import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { last, mapValues } from 'lodash';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { DataSourcesContext } from '../contexts/DataSources';

function getDataSourceFetchers(
  resource,
  { dataSources, store, requestRelatedResource },
) {
  return mapValues(dataSources, (_, id) => ({
    fetcher: () => requestRelatedResource(resource, id),
    value: () => {
      requestRelatedResource(resource, id);
      return store?.[id]?.data;
    },
  }));
}

export function useJsonata({ resource, scope, arrayItems }) {
  const { t } = useTranslation();
  const dataSourcesContext = useContext(DataSourcesContext);

  const [dataSourceFetchers, setDataSourceFetchers] = useState(
    getDataSourceFetchers(resource, dataSourcesContext),
  );

  useEffect(() => {
    const dataSourceFetchers = getDataSourceFetchers(
      resource,
      dataSourcesContext,
    );
    setDataSourceFetchers(dataSourceFetchers);
  }, [dataSourcesContext.store]); // eslint-disable-line react-hooks/exhaustive-deps

  const jsonata = (query, extras = {}, defaultValue = null) => {
    if (!query) {
      return [defaultValue, null];
    }
    try {
      const value = jsonataWrapper(query).evaluate(
        extras.scope || scope || resource,
        {
          ...mapValues(dataSourceFetchers, dsf => dsf.value),
          root: resource,
          items: arrayItems,
          item: last(extras?.arrayItems) || last(arrayItems) || resource,
          ...extras,
        },
      );
      return [value, null];
    } catch (e) {
      return [t('extensibility.configuration-error', { error: e.message }), e];
    }
  };

  jsonata.async = (query, extras = {}, defaultValue = null) => {
    if (!query) {
      return Promise.resolve([defaultValue, null]);
    }

    return new Promise(resolve =>
      jsonataWrapper(query).evaluate(
        extras.scope || scope || resource,
        {
          ...mapValues(dataSourceFetchers, dsf => dsf.fetcher),
          root: resource,
          items: arrayItems,
          item: last(extras?.arrayItems) || last(arrayItems) || resource,
          ...extras,
        },
        (err, val) => {
          if (err) {
            resolve([
              t('extensibility.configuration-error', { error: err.message }),
              err,
            ]);
          } else {
            resolve([val, null]);
          }
        },
      ),
    );
  };

  return jsonata;
}
