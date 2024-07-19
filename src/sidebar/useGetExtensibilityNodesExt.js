import { useJsonata } from 'components/Extensibility/hooks/useJsonata';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  extensionsState,
  externalNodesExtState,
} from 'state/navigation/extensionsAtom';

const createExternalNode = (
  url,
  label,
  category,
  icon,
  scope,
  dataSources,
  resource,
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

const createResource = (name, kind, group, version, namespace) => ({
  name: name,
  kind: kind,
  group: group,
  verion: version,
  namespace: namespace,
});

export const useGetExtensibilityNodesExt = () => {
  const setExternalNodeExt = useSetRecoilState(externalNodesExtState);
  const extensions = useRecoilValue(extensionsState) || [];

  const jsonata = useJsonata({});

  console.log(extensions);

  const externalNodes = extensions
    ?.filter(conf => {
      return conf.general?.externalNodes;
    })
    ?.map(conf => {
      return conf.general?.externalNodes.map(ext => {
        console.log(conf);
        const resource = createResource(
          conf.general.name,
          conf.general.resource.kind,
          conf.general.resource.group,
          conf.general.resource.version,
        );
        console.log(resource);
        ext = {
          ...ext,
          dataSources: conf.dataSources ?? null,
          resource: resource,
        };
        return ext;
      });
    })
    ?.flat();

  console.log(externalNodes);

  let nodes;
  if (externalNodes) {
    nodes = externalNodes.flatMap(
      ({ category, icon, children, scope, dataSources, resource }) =>
        children.map(({ label, link: url }) => {
          console.log(url);
          const [link] = jsonata(url);
          console.log(link);
          return createExternalNode(
            url,
            label,
            category,
            icon,
            scope,
            dataSources,
            resource,
          );
        }),
    );
  }
  console.log(nodes);
  setExternalNodeExt(nodes || []);
  return nodes || [];
};
