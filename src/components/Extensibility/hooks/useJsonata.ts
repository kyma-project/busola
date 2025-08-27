import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { last, mapValues } from 'lodash';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import {
  DataSourcesContext,
  DataSourcesContextType,
  Resource,
} from '../contexts/DataSources';

export type JsonataValue = [string | null, Error | null];

export type JsonataFunction = {
  (query: string, extras?: { [key: string]: any }, defaultValue?: any): Promise<
    JsonataValue
  >;
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
  parent,
  embedResource,
  scope,
  arrayItems,
}: {
  resource: Resource;
  parent?: Resource;
  embedResource?: Resource;
  scope?: any;
  arrayItems?: any[];
}): JsonataFunction {
  const { t } = useTranslation();
  const dataSourcesContext = useContext(DataSourcesContext);

  const dataSourceFetchers = useMemo(() => {
    return getDataSourceFetchers(resource, dataSourcesContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourcesContext.store]);

  const jsonata: JsonataFunction = async (
    query,
    extras = {},
    defaultValue = null,
  ) => {
    if (!query) {
      return [defaultValue, null];
    }

    try {
      const value = await jsonataWrapper(query).evaluate(
        extras.scope || scope || extras.resource || resource,
        {
          ...mapValues(dataSourceFetchers, dsf => dsf.value),
          root: extras.resource || resource,
          parent: parent,
          embedResource: embedResource,
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

  jsonata.async = async (query, extras = {}, defaultValue = null) => {
    if (!query) {
      return Promise.resolve([defaultValue, null]);
    }

    try {
      const value = await jsonataWrapper(query).evaluate(
        extras.scope || scope || extras.resource || resource,
        {
          ...mapValues(dataSourceFetchers, dsf => dsf.fetcher),
          root: extras.resource || resource,
          parent: parent,
          embedResource: embedResource,
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
    } catch (err) {
      return [
        t('extensibility.configuration-error', {
          error: err instanceof Error && err?.message ? err?.message : '',
        }),
        err as Error,
      ];
    }
  };

  return jsonata;
}

export function useGetAsyncJsonata(jsonata: JsonataFunction) {
  const [jsonataValue, setJsonataValue] = useState<{
    [key: string]: JsonataValue;
  }>({});

  const getValue = useCallback(
    function(
      query: string,
      extras?: { [key: string]: any },
      defaultValue?: any,
    ) {
      const params = [query, extras, defaultValue];
      const value = jsonataValue?.[JSON.stringify(params)];

      if (!value) {
        jsonata(query, extras, defaultValue).then(value => {
          setJsonataValue(prev => ({
            ...prev,
            [JSON.stringify(params)]: value,
          }));
        });
        return [null, null];
      }
      return value;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jsonataValue, JSON.stringify(jsonata)],
  );

  return getValue;
}
