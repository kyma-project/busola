import pluralize from 'pluralize';
import { createContext, useContext, useEffect, useRef } from 'react';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { useObjectState } from 'shared/useObjectState';
import * as jp from 'jsonpath';
import { jsonataWrapper } from '../jsonataWrapper';

const DataSourcesContext = createContext();

export function DataSourcesContextProvider({ children, dataSources }) {
  const fetch = useFetch();
  // store
  const [store, setStore] = useObjectState();
  // safer than useState for concurrency - we don't want to duplicate the requests
  const dataSourcesDict = useRef({});
  // refetch intervals
  const intervals = useRef([]);

  // clear timeouts on component unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => intervals.current.forEach(clearInterval), []);

  const buildUrl = (dataSource, resource = { resource: {} }) => {
    let {
      resource: { group, kind, version, name, namespace },
      ownerLabelSelectorPath,
    } = dataSource;
    if (typeof namespace === 'undefined') {
      namespace = resource.metadata.namespace;
    }

    const namespacePart = namespace ? `/namespaces/${namespace}` : '';
    const resourceType = pluralize(kind).toLowerCase();

    let labelSelector = '';
    if (ownerLabelSelectorPath) {
      const ownerLabels = jp.value(resource, ownerLabelSelectorPath);
      labelSelector =
        '?labelSelector=' +
        Object.entries(ownerLabels || {})
          ?.map(([key, value]) => `${key}=${value}`)
          .join(',');
    }

    const apiGroup = group ? `apis/${group}` : 'api';
    let url = `/${apiGroup}/${version}${namespacePart}/${resourceType}`;
    if (labelSelector) {
      url += labelSelector;
    } else if (name) {
      url += '/' + name;
    }
    return url;
  };

  const fetchResource = async (dataSource, dataSourceName, resource) => {
    try {
      const { filter } = dataSource;

      const relativeUrl = buildUrl(dataSource, resource);
      const response = await fetch({ relativeUrl });
      let data = await response.json();
      const expression = jsonataWrapper(filter);
      expression.assign('root', resource);
      if (filter && data.items) {
        data = data.items.filter(item => {
          expression.assign('item', item);
          return expression.evaluate();
        });
      } else if (filter) {
        expression.assign('item', data);
        if (!expression.evaluate()) {
          data = null;
        }
      }
      if (!data.namespace) {
        data.namespace = dataSource.resource.namespace;
      }
      setStore(dataSourceName, {
        loading: false,
        error: null,
        data,
      });
    } catch (e) {
      setStore(dataSourceName, {
        loading: false,
        error: e,
        data: { error: e },
      });
    }
  };

  const getRelatedResourceInPath = path => {
    return Object.keys(dataSources).find(dataSourceName =>
      path.startsWith('$' + dataSourceName),
    );
  };

  const contextValue = {
    store,
    dataSources,
    getRelatedResourceInPath,
    requestRelatedResource: (resource, dataSourceName) => {
      const dataSource = dataSources[dataSourceName];

      if (!dataSourcesDict.current[dataSourceName]) {
        // mark dataSource as fetched
        dataSourcesDict.current[dataSourceName] = true;

        setStore(dataSourceName, { loading: true, data: { loading: true } });

        fetchResource(dataSource, dataSourceName, resource);
        const REFETCH_INTERVAL = 6000;
        intervals.current.push(
          setInterval(
            () => fetchResource(dataSource, dataSourceName, resource),
            REFETCH_INTERVAL,
          ),
        );
      }
    },
  };

  return (
    <DataSourcesContext.Provider value={contextValue}>
      {children}
    </DataSourcesContext.Provider>
  );
}

export function useDataSourcesContext() {
  return useContext(DataSourcesContext);
}
