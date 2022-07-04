import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { prettifyKind } from 'shared/utils/helpers';
import { LOADING_INDICATOR } from '../useSearchResults';
import {
  autocompleteForResources,
  findNavigationNode,
  getSuggestion,
} from './helpers';

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
        names.plural,
        names.singular,
        ...(names.shortNames || []),
        ...additionalAliasForFunctions,
      ],
    };
  });
}

function getResourceKey(crd, namespace) {
  const { names, scope } = crd.spec;
  const isNamespaced = scope === 'Namespaced';

  return isNamespaced ? `${namespace}/${names.plural}` : names.plural;
}

function findMatchingNode(crd, context) {
  const { namespaceNodes, clusterNodes } = context;
  const resourceType = crd.spec.names.plural;

  return findNavigationNode(resourceType, [...namespaceNodes, ...clusterNodes]);
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

function getAutocompleteEntries({ tokens, resourceCache, namespace }) {
  const crds = resourceCache['customresourcedefinitions'] || [];

  const crdAliases = getCRAliases(crds);
  const suggestedALias = getSuggestion(
    tokens[0],
    crdAliases.flatMap(a => a.aliases),
  );

  const crdAlias = crdAliases.find(c => c.aliases.includes(suggestedALias));

  const resources =
    (crdAlias && resourceCache[getResourceKey(crdAlias.crd, namespace)]) || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes: crdAliases,
  });
}

function getSuggestions({ tokens, resourceCache, namespace }) {
  const crds = resourceCache['customresourcedefinitions'] || [];

  const [type, name] = tokens;

  const crdAliases = getCRAliases(crds);
  const suggestedALias = getSuggestion(
    type,
    crdAliases.flatMap(a => a.aliases),
  );

  const crdAlias = crdAliases.find(c => c.aliases.includes(suggestedALias));
  if (!crdAlias) return;

  const suggestedType = crdAlias.crd.spec.names.plural;

  if (name) {
    const resourceKey = getResourceKey(crdAlias.crd, namespace);
    const resourceNames = (resourceCache[resourceKey] || []).map(
      n => n.metadata.name,
    );
    const suggestedName = getSuggestion(name, resourceNames);
    return `${suggestedType || type} ${suggestedName || name}`;
  } else {
    return suggestedType;
  }
}

async function fetchResources(context) {
  const {
    fetch,
    updateResourceCache,
    resourceCache,
    tokens,
    namespace,
  } = context;

  let crds = resourceCache['customresourcedefinitions'];
  if (!crds) {
    try {
      const response = await fetch(
        '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
      );
      crds = (await response.json()).items;
      updateResourceCache('customresourcedefinitions', crds);
    } catch (e) {
      console.warn(e);
    }
  }

  const crd = getCRAliases(crds).find(c =>
    c.aliases.find(alias => alias === tokens[0]),
  )?.crd;
  if (!crd) return;

  const resourceKey = getResourceKey(crd, namespace);

  if (!resourceCache[resourceKey]) {
    const groupVersion = `/apis/${crd.spec.group}/${
      crd.spec.versions.find(v => v.served).name
    }`;
    const isNamespaced = crd.spec.scope === 'Namespaced';
    const namespacePart = isNamespaced ? `namespaces/${namespace}/` : '';
    const resourceType = crd.spec.names.plural;

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

  const isNamespaced = crd.spec.scope === 'Namespaced';

  const matchingNode = findMatchingNode(crd, context);

  const defaultCategory = isNamespaced
    ? t('command-palette.crs.namespaced')
    : t('command-palette.crs.cluster');
  const category =
    (matchingNode?.category || defaultCategory) +
    ' > ' +
    pluralize(prettifyKind(crd.spec.names.kind));

  const linkToList = {
    label: listLabel,
    category,
    query: tokens[0],
    onActivate: () => navigateTo({ matchingNode, namespace, crd }),
  };

  const resources = resourceCache[getResourceKey(crd, namespace)];
  const listItems = resources
    ? resources.map(item => makeListItem({ crd, item, category, context }))
    : [{ type: LOADING_INDICATOR }];

  return [linkToList, ...listItems];
}

function getCRsHelp({ resourceCache }) {
  return (resourceCache['customresourcedefinitions'] || []).map(t => ({
    name: t.metadata.name,
    shortNames: t.spec.names.shortNames || [t.spec.names.singular],
  }));
}

export const crHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources,
  createResults,
  getCRsHelp,
};
