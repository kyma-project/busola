import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { clusterState } from 'state/clusterAtom';
import pluralize from 'pluralize';
import { extensionsState } from 'state/navigation/extensionsAtom';

export const useGetCRbyPath = () => {
  const { namespaceId } = useParams();
  const extensions = useRecoilValue(extensionsState);
  const { name: clusterName } = useRecoilValue(clusterState) || {};

  const resource = extensions.find(el => {
    const { scope, urlPath, resource } = el.general || {};
    const extensionPath = urlPath || pluralize(resource?.kind?.toLowerCase());
    const hasCorrectScope =
      (scope?.toLowerCase() === 'namespace') === !!namespaceId;
    if (!hasCorrectScope) return false;

    const crPath = window.location.pathname
      .replace(`/cluster/${clusterName}/`, '')
      .replace(`namespaces/${namespaceId}/`, '')
      .replace('core-ui/', '');

    return crPath.split('/')[0] === extensionPath;
  });

  return resource;
};
