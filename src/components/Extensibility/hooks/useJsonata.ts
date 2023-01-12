import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { last, mapValues } from 'lodash';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import {
  Resource,
  DataSourcesContextType,
  DataSourcesContext,
} from '../contexts/DataSources';

type JsonataValue = [string, Error | null];

type JsonataFunction = {
  (
    query: string,
    extras: { [key: string]: any },
    defaultValue: any,
  ): JsonataValue;
  async: (
    query: string,
    extras: { [key: string]: any },
    defaultValue: any,
  ) => Promise<JsonataValue>;
};

function getDataSourceFetchers(
  resource: Resource,
  { dataSources, store, requestRelatedResource }: DataSourcesContextType,
) {
  return mapValues(dataSources, (_, id) => ({
    fetcher: () => requestRelatedResource(resource, id),
    value: () => {
      requestRelatedResource(resource, id);
      return store?.[id]?.data;
    },
  }));
}

export function useJsonata({
  resource,
  scope,
  arrayItems,
}: {
  resource: Resource;
  scope: any;
  arrayItems: any[];
}): JsonataFunction {
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

  const jsonata: JsonataFunction = (
    query,
    extras = {},
    defaultValue = null,
  ) => {
    if (!query) {
      return [defaultValue, null];
    }
    try {
      const value = jsonataWrapper(query).evaluate(
        extras.scope || scope || extras.resource || resource,
        {
          ...mapValues(dataSourceFetchers, dsf => dsf.value),
          root: extras.resource || resource,
          items: extras?.arrayItems || arrayItems,
          item:
            last(extras?.arrayItems) ||
            last(arrayItems) ||
            extras.resource ||
            resource,
          ...extras,
        },
      );
      return [value, null];
    } catch (e) {
      return [
        t('extensibility.configuration-error', { error: (e as Error).message }),
        e as Error,
      ];
    }
  };

  jsonata.async = (query, extras = {}, defaultValue = null) => {
    if (!query) {
      return Promise.resolve([defaultValue, null]);
    }

    return new Promise(resolve =>
      jsonataWrapper(query).evaluate(
        extras.scope || scope || extras.resource || resource,
        {
          ...mapValues(dataSourceFetchers, dsf => dsf.fetcher),
          root: extras.resource || resource,
          items: extras?.arrayItems || arrayItems,
          item:
            last(extras?.arrayItems) ||
            last(arrayItems) ||
            extras.resource ||
            resource,
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
