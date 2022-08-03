import pluralize from 'pluralize';
import { createContext, useContext, useEffect, useRef } from 'react';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { useObjectState } from 'shared/useObjectState';
import jsonata from 'jsonata';
import * as jp from 'jsonpath';

const RelationsContext = createContext();

function formatJsonataResult(result, { isListCall }) {
  // if no entries matched, JSONata returns undefined, make it empty list
  if (isListCall && !result) {
    result = [];
  }
  // JSONata adds "sequence=true" field
  delete result.sequence;
  // if 1 entry matched, JSONata returns it, wrap it in list
  if (isListCall && !Array.isArray(result)) {
    result = [result];
  }
  return result;
}

export function RelationsContextProvider({ children, relations }) {
  const fetch = useFetch();
  // store
  const [store, setStore] = useObjectState();
  // safer than useState for concurrency - we don't want to duplicate the requests
  const relationsDict = useRef({});
  // refetch intervals
  const intervals = useRef([]);

  // clear timeouts on component unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => intervals.current.forEach(clearInterval), []);

  const buildUrl = (relation, resource) => {
    let {
      group,
      kind,
      version,
      resourceName,
      namespace,
      ownerLabelSelectorPath,
    } = relation;
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

    let url = `/${group}/${version}${namespacePart}/${resourceType}`;
    if (labelSelector) {
      url += labelSelector;
    } else if (resourceName) {
      url += '/' + resourceName;
    }
    return url;
  };

  const fetchResource = async (relation, relationName, resource) => {
    try {
      const { selector, resourceName } = relation;

      const relativeUrl = buildUrl(relation, resource);
      const isListCall = !resourceName;
      const response = await fetch({ relativeUrl });
      let data = await response.json();
      data = isListCall ? data.items : data;
      if (selector) {
        data = jsonata(selector).evaluate({
          data,
          resource,
        });
        data = formatJsonataResult(data, { isListCall });
      }
      setStore(relationName, {
        loading: false,
        error: null,
        data,
      });
    } catch (e) {
      setStore(relationName, { loading: false, error: e, data: null });
    }
  };

  const getRelatedResourceInPath = path => {
    return Object.keys(relations).find(relationName =>
      path.startsWith('$' + relationName),
    );
  };

  const contextValue = {
    store,
    relations,
    getRelatedResourceInPath,
    requestRelatedResource: (resource, path) => {
      const relationName = getRelatedResourceInPath(path);
      const relation = relations[relationName];

      if (!relationsDict.current[relationName]) {
        // mark relations as fetched
        relationsDict.current[relationName] = true;

        setStore(relationName, { loading: true });

        fetchResource(relation, relationName, resource);
        const REFETCH_INTERVAL = 6000;
        intervals.current.push(
          setInterval(
            () => fetchResource(relation, relationName, resource),
            REFETCH_INTERVAL,
          ),
        );
      }
    },
  };

  return (
    <RelationsContext.Provider value={contextValue}>
      {children}
    </RelationsContext.Provider>
  );
}

export function useRelationsContext() {
  return useContext(RelationsContext);
}
