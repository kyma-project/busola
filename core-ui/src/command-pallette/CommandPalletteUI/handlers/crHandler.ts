import pluralize from 'pluralize';
import { NavigateFunction } from 'react-router-dom';
import { prettifyKind } from 'shared/utils/helpers';
import { NavNode } from 'state/types';
import { K8sResource } from 'types';
import {
  CommandPaletteContext,
  Handler,
  LOADING_INDICATOR,
  Result,
} from '../types';
import {
  autocompleteForResources,
  findNavigationNode,
  makeSuggestion,
} from './helpers';

interface CustomResourceDefinition extends K8sResource {
  spec: {
    group: string;
    scope: 'Cluster' | 'Namespaced';
    names: {
      kind: string;
      plural: string;
      shortNames?: string[];
      singular: string;
    };
    versions: [
      {
        name: string;
        served: boolean;
      },
    ];
  };
}

// get all possible aliases for a cr
function getCRAliases(
  crds: CustomResourceDefinition[],
): { crd: CustomResourceDefinition; aliases: string[] }[] {
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

function getResourceKey(
  crd: CustomResourceDefinition,
  namespace: string | null,
) {
  const { names, scope } = crd.spec;
  const isNamespaced = scope === 'Namespaced';

  return isNamespaced ? `${namespace}/${names.plural}` : names.plural;
}

function findMatchingNode(
  crd: CustomResourceDefinition,
  context: CommandPaletteContext,
) {
  const { namespaceNodes, clusterNodes } = context;
  const resourceType = crd.spec.names.plural;

  return findNavigationNode(resourceType, [...namespaceNodes, ...clusterNodes]);
}

function navigateTo({
  matchingNode,
  namespace,
  navigate,
  activeClusterName,
  crd,
  crName = '',
}: {
  matchingNode: NavNode;
  namespace: string | null;
  navigate: NavigateFunction;
  activeClusterName: string;
  crd: CustomResourceDefinition;
  crName?: string;
}) {
  const isNamespaced = crd.spec.scope === 'Namespaced';

  const clusterPath = `/cluster/${activeClusterName}`;
  const path = matchingNode
    ? `${matchingNode.pathSegment}/${crName ? `details/${crName}` : ''}` // custom nav node
    : `customresources/${crd.metadata.name}/${crName}`; // generic route

  if (isNamespaced) {
    navigate(`${clusterPath}/namespaces/${namespace}/${path}`);
  } else {
    navigate(clusterPath + '/' + path);
  }
}

function getAutocompleteEntries({
  tokens,
  resourceCache,
  namespace,
}: CommandPaletteContext) {
  const crds: CustomResourceDefinition[] =
    (resourceCache[
      'customresourcedefinitions'
    ] as CustomResourceDefinition[]) || [];

  const crdAliases = getCRAliases(crds);
  const suggestedALias = makeSuggestion(
    tokens[0],
    crdAliases.flatMap(a => a.aliases),
  );

  const crdAlias = crdAliases.find(c => c.aliases.includes(suggestedALias));

  const resources =
    (crdAlias && resourceCache[getResourceKey(crdAlias.crd, namespace)]) || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes: crdAliases.map(({ crd, aliases }) => ({
      resourceType: crd.spec.names.plural,
      aliases,
    })),
  });
}

function getSuggestion({
  tokens,
  resourceCache,
  namespace,
}: CommandPaletteContext): string | undefined {
  const crds =
    (resourceCache[
      'customresourcedefinitions'
    ] as CustomResourceDefinition[]) || [];

  const [type, name] = tokens;

  const crdAliases = getCRAliases(crds);
  const suggestedALias = makeSuggestion(
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
    const suggestedName = makeSuggestion(name, resourceNames);
    return `${suggestedType || type} ${suggestedName || name}`;
  } else {
    return suggestedType;
  }
}

async function fetchResources(context: CommandPaletteContext) {
  const {
    fetch,
    updateResourceCache,
    resourceCache,
    tokens,
    namespace,
  } = context;

  let crds: CustomResourceDefinition[] = resourceCache[
    'customresourcedefinitions'
  ] as CustomResourceDefinition[];
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
      crd.spec.versions.find(v => v.served)!.name // "served" version will always be here
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

function concernsCRDs({ resourceCache }: CommandPaletteContext) {
  return !!resourceCache['customresourcedefinitions'];
}

function makeListItem({
  crd,
  item,
  category,
  context,
}: {
  crd: CustomResourceDefinition;
  item: K8sResource;
  category: string;
  context: CommandPaletteContext;
}) {
  const name = item.metadata.name;
  const { namespace, activeClusterName, navigate } = context;
  const matchingNode = findMatchingNode(crd, context)!;

  return {
    label: name,
    query: `${crd.spec.names.plural} ${name}`,
    category,
    onActivate: () =>
      navigateTo({
        matchingNode,
        namespace,
        navigate,
        activeClusterName: activeClusterName!,
        crd,
        crName: name,
      }),
  };
}

function createResults(context: CommandPaletteContext): Result[] | null {
  if (!concernsCRDs(context)) {
    return null;
  }

  const {
    resourceCache,
    tokens,
    namespace,
    t,
    navigate,
    activeClusterName,
  } = context;

  const crd = getCRAliases(
    resourceCache['customresourcedefinitions'] as CustomResourceDefinition[],
  ).find(c => c.aliases.find(alias => alias === tokens[0]))?.crd;
  if (!crd) return null;

  const listLabel = t('command-palette.results.list-of', {
    resourceType: pluralize(prettifyKind(crd.spec.names.kind)),
  });

  const isNamespaced = crd.spec.scope === 'Namespaced';

  const matchingNode = findMatchingNode(crd, context);

  if (!matchingNode) return null;

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
    onActivate: () =>
      navigateTo({
        matchingNode,
        namespace,
        navigate,
        activeClusterName: activeClusterName!,
        crd,
      }),
  };

  const notFound: Result = {
    type: LOADING_INDICATOR,
    label: '',
    query: '',
    onActivate: () => {},
  };

  const resources = resourceCache[getResourceKey(crd, namespace)];
  const listItems = resources
    ? resources.map(item => makeListItem({ crd, item, category, context }))
    : [notFound];

  return [linkToList, ...listItems];
}

function getCRsHelp({ resourceCache }: CommandPaletteContext) {
  return (
    (resourceCache[
      'customresourcedefinitions'
    ] as CustomResourceDefinition[]) || []
  ).map(t => ({
    name: t.metadata.name,
    shortNames: t.spec.names.shortNames || [t.spec.names.singular],
  }));
}

export const crHandler: Handler = {
  getAutocompleteEntries,
  getSuggestion,
  fetchResources,
  createResults,
  getCRsHelp,
};
