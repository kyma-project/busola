import { useContext } from 'react';
import { mapValues } from 'lodash';

import { DataSourcesContext } from '../contexts/DataSources';

export function useDataSources(resource) {
  const {
    dataSources,
    store: dataSourceStore,
    requestRelatedResource,
  } = useContext(DataSourcesContext);

  const dataSourceFetchers = mapValues(dataSources, (_, id) => {
    return () => {
      requestRelatedResource(resource, id);
      return dataSourceStore?.[id]?.data;
    };
  });
  return { dataSourceFetchers };
}
