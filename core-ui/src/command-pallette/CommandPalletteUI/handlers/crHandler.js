import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { prettifyKind } from 'shared/utils/helpers';

// get all possible aliases for a cr
function getCRAliases(crds) {
  return crds.map(crd => {
    const names = crd.spec.names;
    // there's no "fn" shortname for function, why?
    const additionalAliasForFunctions =
      names.singular === 'function' ? ['fn'] : [];

    return {
      crd,
      aliases: [
        crd.metadata.name,
        names.plural,
        names.singular,
        ...(names.shortNames || []),
        ...additionalAliasForFunctions,
      ],
    };
  });
}

function findMatchingNode(crd, context) {
  const { namespaceNodes, clusterNodes } = context;
  const resourceType = crd.spec.names.plural;
  const isNamespaced = crd.spec.scope === 'Namespaced';

  // nodes to search within
  const nodes = isNamespaced ? namespaceNodes : clusterNodes;
  return nodes.find(n => n.resourceType === resourceType);
}

function navigateTo({ matchingNode, namespace, crd, crName = '' }) {
  const linkManager = LuigiClient.linkManager().fromContext('cluster');
  const isNamespaced = crd.spec.scope === 'Namespaced';

  const path = matchingNode
    ? `${matchingNode.pathSegment}/${crName ? `details/${crName}` : ''}` // custom nav node
    : `customresources/${crd.metadata.name}/${crName}`; // generic route

  if (isNamespaced) {
    linkManager.navigate(`namespaces/${namespace}/${path}`);
  } else {
    linkManager.navigate(path);
  }
}

function getAutocompleteEntries({ tokens, resourceCache }) {
  //   const tokenToAutocomplete = tokens[tokens.length - 1];
  //   switch (tokens.length) {
  //     case 1: // type
  //       if ('customresources'.startsWith(tokenToAutocomplete)) {
  //         return 'customresources ';
  //       }
  //       break;
  //     case 2: // name
  //       const crdNames = (resourceCache['customresources'] || []).map(
  //         n => n.metadata.name,
  //       );
  //       return crdNames
  //         .filter(name => name.startsWith(tokenToAutocomplete))
  //         .map(name => `${tokens[0]} ${name} `);
  //     default:
  //       return [];
  //   }
}

function getSuggestions({ tokens, resourceCache }) {
  //   return getSuggestionsForSingleResource({
  //     tokens,
  //     resources: resourceCache['customresources'] || [],
  //     resourceTypeNames: ['customresources'],
  //   });
  return [];
}

async function fetchResources(context) {
  const {
    fetch,
    updateResourceCache,
    resourceCache,
    tokens,
    namespace,
  } = context;
  if (!resourceCache['customresourcedefinitions']) {
    try {
      const response = await fetch(
        '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
      );
      const { items: crds } = await response.json();
      updateResourceCache('customresourcedefinitions', crds);
    } catch (e) {
      console.warn(e);
    }
  } else {
    const crd = getCRAliases(
      resourceCache['customresourcedefinitions'],
    ).find(c => c.aliases.find(alias => alias === tokens[0]))?.crd;
    if (!crd) return;

    const resourceType = crd.spec.names.plural;
    const isNamespaced = crd.spec.scope === 'Namespaced';
    const resourceKey = isNamespaced
      ? `${namespace}/${resourceType}`
      : resourceType;

    if (!resourceCache[resourceKey]) {
      const groupVersion = `/apis/${crd.spec.group}/${
        crd.spec.versions.find(v => v.served).name
      }`;
      const namespacePart = isNamespaced ? `namespaces/${namespace}/` : '';

      try {
        const response = await fetch(
          `${groupVersion}/${namespacePart}${resourceType}`,
        );
        const { items } = await response.json();
        updateResourceCache(resourceKey, items);
      } catch (e) {
        console.warn(e);
      }
    }
  }
}

function concernsCRDs({ resourceCache }) {
  return !!resourceCache['customresourcedefinitions'];
}

function makeListItem({ crd, item, category, context }) {
  const name = item.metadata.name;
  const { namespace } = context;
  const matchingNode = findMatchingNode(crd, context);

  return {
    label: name,
    query: `${crd.spec.names.plural} ${name}`,
    category,
    onActivate: () =>
      navigateTo({ matchingNode, namespace, crd, crName: name }),
  };
}

function createResults(context) {
  if (!concernsCRDs(context)) {
    return;
  }

  const { resourceCache, tokens, namespace, t } = context;

  const crd = getCRAliases(resourceCache['customresourcedefinitions']).find(c =>
    c.aliases.find(alias => alias === tokens[0]),
  )?.crd;
  if (!crd) return;

  const listLabel = t('command-palette.results.list-of', {
    resourceType: pluralize(prettifyKind(crd.spec.names.kind)),
  });

  const resourceType = crd.spec.names.plural;
  const isNamespaced = crd.spec.scope === 'Namespaced';

  const matchingNode = findMatchingNode(crd, context);

  const category =
    t('configuration.title') +
    ' > ' +
    (matchingNode?.category ||
      (isNamespaced
        ? t('command-palette.crs.namespaced')
        : t('command-palette.crs.cluster')));

  const linkToList = {
    label: listLabel,
    category,
    query: tokens[0],
    onActivate: () => navigateTo({ matchingNode, namespace, crd }),
  };

  const resourceKey = isNamespaced
    ? `${namespace}/${resourceType}`
    : resourceType;
  return [
    linkToList,
    ...(resourceCache[resourceKey] || []).map(item =>
      makeListItem({ crd, item, category, context }),
    ),
  ];
}

export const crHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources,
  createResults,
  getNavigationHelp: () => [], //todo
};
