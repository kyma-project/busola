import didYouMean from 'didyoumean';

export function parseQuery({ search }) {
  if (window.location.pathname === '/clusters') {
    return null;
  }
  if (search.split(/\s+/).length !== 1) {
    return null;
  }

  const options = [
    {
      resourceType: 'functions',
      names: ['functions', 'function', 'fn'],
      k8sPath: '/apis/serverless.kyma-project.io/v1alpha1',
      isNamespaced: true,
    },
    {
      resourceType: 'pods',
      names: ['pods', 'pod', 'po'],
      k8sPath: '/api/v1',
      isNamespaced: true,
    },
    {
      resourceType: 'namespaces',
      names: ['namespaces', 'namespace', 'ns'],
      k8sPath: '/api/v1',
      isNamespaced: false,
    },
  ];

  for (const option of options) {
    if (option.names.includes(search)) {
      return {
        query: { type: 'resource-link', ...option },
        suggestedSearch: null,
      };
    }
  }

  const suggestedSearch = didYouMean(
    search,
    options.flatMap(o => o.names),
  );
  if (suggestedSearch) {
    return {
      query: null,
      suggestedSearch,
    };
  } else {
    return null;
  }
}

export async function createResults({ query, fetch, namespace }) {
  if (window.location.pathname === '/clusters') return null;

  if (query.type === 'resource-link') {
    try {
      const r = await fetch(query.k8sPath + '/' + query.resourceType);
      let { items } = await r.json();
      if (namespace) {
        items = items.filter(
          res =>
            !res.metadata.namespace || res.metadata.namespace === namespace,
        );
      }
      if (query.isNamespaced) {
        return items.map(res => ({
          type: 'navigation',
          title: `${query.resourceType} ${res.metadata.name} (${res.metadata.namespace})`,
          url: `/namespaces/${res.metadata.namespace}/${query.name}/details/${res.metadata.name}`,
        }));
      } else {
        return [
          { type: 'navigation', title: `${query.resourceType} list` },
          ...items.map(res => ({
            type: 'navigation',
            title: `${query.resourceType} ${res.metadata.name}`,
            url: `/${query.resourceType}/${res.metadata.name}/details`,
          })),
        ];
      }
    } catch (e) {
      console.log(e);
      return [];
    }
  } else {
    return null;
  }
}
