import { RecoilValueReadOnly, selector } from 'recoil';
import { configurationAtom } from '../configuration/configurationAtom';
import { ConfigFeature, configFeaturesNames, NavNode } from '../types';
import { getFetchFn } from '../utils/getFetchFn';

const createExternalNode = (
  url: string,
  label: string,
  category: string,
  icon?: string,
  scope?: string,
): NavNode => ({
  resourceType: '',
  category: category,
  icon: icon,
  namespaced: scope === 'namespace',
  label: label,
  pathSegment: '',
  requiredFeatures: [],
  apiVersion: '',
  apiGroup: '',
  externalUrl: url.startsWith('http') ? url : `https://${url}`,
});

const getExternalNodes = (
  externalNodesFeature: ConfigFeature | undefined,
): NavNode[] => {
  const links = externalNodesFeature!.nodes || [];

  type NodeChild = { label: string; link: string };

  return links.flatMap(
    ({
      category,
      icon,
      children,
      scope,
    }: {
      category: string;
      icon: string;
      children: NodeChild[];
      scope?: string;
    }) =>
      children.map(({ label, link }) =>
        createExternalNode(link, label, category, icon, scope),
      ),
  );
};

export const externalNodesSelector: RecoilValueReadOnly<
  NavNode[] | null
> = selector<NavNode[] | null>({
  key: 'externalNodesSelector',
  get: async ({ get }) => {
    const configuration = get(configurationAtom);
    const features = configuration?.features;
    const fetchFn = getFetchFn(get);
    if (!fetchFn || !features) {
      return null;
    }

    if (!features[configFeaturesNames.EXTERNAL_NODES]?.isEnabled) {
      return [];
    }

    const externalNodes = getExternalNodes(
      features[configFeaturesNames.EXTERNAL_NODES],
    );

    return [...externalNodes.filter(n => n)];
  },
});
