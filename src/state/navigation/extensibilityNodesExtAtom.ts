import { atom } from 'jotai';
import { ExtResource, NavNode } from '../types';
import { getFetchFn } from '../utils/getFetchFn';
import { DataSources } from 'components/Extensibility/contexts/DataSources';
import { extensionsAtom, staticsAtom } from 'state/navigation/extensionsAtom';
import { ExtensibilityNodesExt } from 'state/types';

const createExternalNode = (
  url: string,
  label: string,
  category: string,
  icon: string,
  scope: string,
  dataSources?: DataSources,
) => ({
  resourceType: '',
  resourceTypeCased: '',
  category: category,
  icon: icon,
  namespaced: scope === 'namespace',
  label: label,
  pathSegment: '',
  requiredFeatures: [],
  apiVersion: '',
  apiGroup: '',
  externalUrl: url,
  dataSources: dataSources,
});

const getExtensibilityNodesExt = (extensions: ExtResource[]) => {
  const externalNodes = extensions
    ?.filter(conf => {
      return conf.general?.externalNodes;
    })
    ?.map(conf => {
      return conf.general?.externalNodes?.map(ext => {
        ext = {
          ...ext,
          dataSources: conf.dataSources ?? null,
        };
        return ext;
      });
    })
    ?.flat();

  let nodes;
  if (externalNodes) {
    nodes = (externalNodes as ExtensibilityNodesExt[]).flatMap(
      ({ category, icon, children, scope, dataSources }) =>
        children.map(({ label, link }: { label: string; link: string }) => {
          return createExternalNode(
            link,
            label,
            category,
            icon,
            scope,
            dataSources,
          );
        }),
    );
  }

  return nodes || [];
};

export const extensibilityNodesExtAtom = atom<NavNode[] | null>(get => {
  const extensions = get(extensionsAtom) || [];
  const statics = get(staticsAtom) || [];

  const fetchFn = getFetchFn(get);
  if (!fetchFn) {
    return null;
  }

  const extensibilityNodes = getExtensibilityNodesExt(extensions);
  const staticsNodes = getExtensibilityNodesExt(statics);

  const filteredExtNodes = [...extensibilityNodes.filter(n => n)];
  const filteresStaticsNodes = [...staticsNodes.filter(n => n)];

  return [...filteredExtNodes.concat(filteresStaticsNodes)];
});
extensibilityNodesExtAtom.debugLabel = 'extensibilityNodesExtAtom';
