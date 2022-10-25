import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { last, mapValues } from 'lodash';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { DataSourcesContext } from '../contexts/DataSources';

function getDataSourceFetchers(
  resource,
  { dataSources, store, requestRelatedResource },
) {
  return mapValues(dataSources, (_, id) => {
    return () => requestRelatedResource(resource, id);
  });
}

export function useJsonata(
  // query,
  { resource, scope, arrayItems },
) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
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

  return (query, extras = {}, defaultValue = null) => {
    if (!query) {
      return [defaultValue, null, Promise.resolve([defaultValue, null])];
    }

    const promise = new Promise(resolve =>
      jsonataWrapper(query).evaluate(
        extras.scope || scope || resource,
        {
          ...dataSourceFetchers,
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

    promise.then(([val, err]) => {
      setValue(val);
      setError(err);
    });
    return [value, error, promise];
  };
}
