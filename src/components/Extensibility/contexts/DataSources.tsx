import pluralize from 'pluralize';
import { createContext, useEffect, useRef, FC } from 'react';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { useObjectState } from 'shared/useObjectState';
import * as jp from 'jsonpath';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

export interface Resource {
  metadata: {
    name: string;
    namespace: string;
    labels: { [key: string]: string };
    annotations: { [key: string]: string };
    [key: string]: any;
  };
  spec: {
    [key: string]: any;
  };
}

export interface StoreItem {
  loading: boolean;
  error: Error | null;
  data: any;
}

export interface Store {
  [key: string]: StoreItem;
}

export interface DataSource {
  resource: {
    kind: string;
    group: string;
    version: string;
    namespace: string;
    name: string;
  };
  ownerLabelSelectorPath: string;
  filter: string;
}

export interface DataSources {
  [key: string]: DataSource;
}

export interface DataSourcesDict {
  [key: string]: any;
}

export interface DataSourcesContextType {
  store: Store;
  dataSources: DataSources;
  getRelatedResourceInPath: (path: string) => string | undefined;
  requestRelatedResource: (
    resource: Resource,
    dataSourceName: string,
  ) => Promise<any>;
}

export const DataSourcesContext = createContext<DataSourcesContextType>(
  {} as DataSourcesContextType,
);

interface Props {
  dataSources: DataSources;
  children: JSX.Element;
}

export const DataSourcesContextProvider: FC<Props> = ({
  children,
  dataSources,
}) => {
  const fetch = useFetch();
  // store
  const [store, setStore] = useObjectState<Store>();
  // safer than useState for concurrency - we don't want to duplicate the requests
  const dataSourcesDict = useRef<DataSourcesDict>({});
  // refetch intervals
  const intervals = useRef<ReturnType<typeof setTimeout>[]>([]);

  // clear timeouts on component unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => intervals.current.forEach(clearInterval), []);

  const buildUrl = (
    dataSource: DataSource,
    resource: Resource = {} as Resource,
  ) => {
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

  const fetchResource = async (
    dataSource: DataSource,
    dataSourceName: string,
    resource: Resource,
  ) => {
    try {
      const { filter } = dataSource;

      const relativeUrl = buildUrl(dataSource, resource);
      const response = await fetch({ relativeUrl });
      let data = await response?.json();

      if (filter) {
        const expression = jsonataWrapper(filter);
        expression.assign('root', resource);
        if (data.items) {
          data.items = data.items.filter((item: any) => {
            expression.assign('item', item);
            return expression.evaluate({});
          });
        } else {
          expression.assign('item', data);
          if (!expression.evaluate({})) {
            data = null;
          }
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
      return data;
    } catch (e) {
      setStore(dataSourceName, {
        loading: false,
        error: e,
        data: { error: e },
      });
    }
  };

  const getRelatedResourceInPath = (path: string) => {
    return Object.keys(dataSources).find(dataSourceName =>
      path.startsWith('$' + dataSourceName),
    );
  };

  const requestRelatedResource = (resource: any, dataSourceName: string) => {
    const dataSource = dataSources[dataSourceName];

    if (!dataSourcesDict.current[dataSourceName]) {
      // mark dataSource as fetched
      dataSourcesDict.current[dataSourceName] = true;

      setStore(dataSourceName, { loading: true, data: { loading: true } });

      const firstFetch = fetchResource(dataSource, dataSourceName, resource);
      const REFETCH_INTERVAL = 6000;
      intervals.current.push(
        setInterval(
          () => fetchResource(dataSource, dataSourceName, resource),
          REFETCH_INTERVAL,
        ),
      );

      return firstFetch;
    } else {
      return Promise.resolve(dataSourcesDict.current[dataSourceName]);
    }
  };

  const contextValue: DataSourcesContextType = {
    store,
    dataSources,
    getRelatedResourceInPath,
    requestRelatedResource,
  };

  return (
    <DataSourcesContext.Provider value={contextValue}>
      {children}
    </DataSourcesContext.Provider>
  );
};
