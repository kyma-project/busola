import { useContext } from 'react';

import { jsonataWrapper } from '../../helpers/jsonataWrapper';
import { DataSourcesContext } from '../../contexts/DataSources';

export function useJsonataEvaluate(root) {
  const {
    dataSources,
    store: dataSourceStore,
    requestRelatedResource,
  } = useContext(DataSourcesContext);

  const dataSourceFetchers = Object.fromEntries(
    Object.entries(dataSources).map(([id, def]) => [
      id,
      () => {
        requestRelatedResource(root, id);
        return dataSourceStore?.[id]?.data;
      },
    ]),
  );

  return (query, extras) =>
    jsonataWrapper(query).evaluate(root, {
      root,
      ...dataSourceFetchers,
      ...extras,
    });
}
