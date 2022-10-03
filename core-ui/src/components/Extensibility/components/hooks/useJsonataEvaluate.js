import { useContext } from 'react';

import { jsonataWrapper } from '../../helpers/jsonataWrapper';
import { DataSourcesContext } from '../../contexts/DataSources';
import { mapValues } from 'lodash';
export function useJsonataEvaluate(root) {
  const {
    dataSources,
    store: dataSourceStore,
    requestRelatedResource,
  } = useContext(DataSourcesContext);

  const dataSourceFetchers = mapValues(dataSources, (_, id) => {
    return () => {
      requestRelatedResource(root, id);
      return dataSourceStore?.[id]?.data;
    };
  });

  return (query, extras) =>
    jsonataWrapper(query).evaluate(root, {
      root,
      ...dataSourceFetchers,
      ...extras,
    });
}
