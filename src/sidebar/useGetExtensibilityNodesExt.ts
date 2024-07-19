import { DataSources } from 'components/Extensibility/contexts/DataSources';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  extensionsState,
  externalNodesExtState,
} from 'state/navigation/extensionsAtom';
import { externalNodesExt } from 'state/types';

const createExternalNode = (
  url: string,
  label: string,
  category: string,
  icon: string,
  scope: string,
  resource: any, //////////////ANY
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
  namespace?: string,
) => ({
  name: name,
  kind: kind,
  group: group,
  verion: version,
  namespace: namespace,
});

export const useGetExtensibilityNodesExt = () => {
  const setExternalNodeExt = useSetRecoilState(externalNodesExtState);
  const extensions = useRecoilValue(extensionsState) || [];

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
    nodes = (externalNodes as externalNodesExt[]).flatMap(
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

  setExternalNodeExt(nodes || []);
  return nodes || [];
};

/*
: {
        category: string;
        icon: string;
        scope: string;
        dataSources: DataSources;
        resource: any; //////////////ANY
        children:  {
          label: string;
          link: string;
        }[];
      }
*/
