import { RecoilValueReadOnly, selector } from 'recoil';
import { ExtNodeResource, ExtResource, NavNode } from '../types';
import { getFetchFn } from '../utils/getFetchFn';
import { DataSources } from 'components/Extensibility/contexts/DataSources';
import { extensionsState } from 'state/navigation/extensionsAtom';
import { ExtensibilityNodesExt } from 'state/types';

const createExternalNode = (
  url: string,
  label: string,
  category: string,
  icon: string,
  scope: string,
  resource: ExtNodeResource,
  dataSources?: DataSources,
) => ({
  resourceType: '',
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
  resource: resource,
});

const createResource = (
  name: string,
  kind: string,
  group: string,
  version: string,
) => ({
  name: name,
  kind: kind,
  group: group,
  version: version,
});

const getExtensibilityNodesExt = (extensions: ExtResource[]) => {
  const externalNodes = extensions
    ?.filter(conf => {
      return conf.general?.externalNodes;
    })
    ?.map(conf => {
      return conf.general?.externalNodes?.map(ext => {
        const resource = createResource(
          conf.general.name,
          conf.general.resource.kind,
          conf.general.resource.group,
          conf.general.resource.version,
        );

        ext = {
          ...ext,
          dataSources: conf.dataSources ?? null,
          resource: resource,
        };
        return ext;
      });
    })
    ?.flat();

  let nodes;
  if (externalNodes) {
    nodes = (externalNodes as ExtensibilityNodesExt[]).flatMap(
      ({ category, icon, children, scope, dataSources, resource }) =>
        children.map(({ label, link }: { label: string; link: string }) => {
          return createExternalNode(
            link,
            label,
            category,
            icon,
            scope,
            resource,
            dataSources,
          );
        }),
    );
  }

  return nodes || [];
};

export const extensibilityNodesExtSelector: RecoilValueReadOnly<
  NavNode[] | null
> = selector<NavNode[] | null>({
  key: 'extensibilityNodesExtSelector',
  get: async ({ get }) => {
    const extensions = get(extensionsState) || [];
    const fetchFn = getFetchFn(get);
    if (!fetchFn) {
      return null;
    }

    const extensibilityNodes = getExtensibilityNodesExt(extensions);

    return [...extensibilityNodes.filter(n => n)];
  },
});
