import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { clusterState } from 'state/clusterAtom';
import pluralize from 'pluralize';
import { extensionsState } from 'state/navigation/extensionsAtom';
import { columnLayoutState } from 'state/columnLayoutAtom';

export const useGetCRbyPath = (resourceName, namespace) => {
  const { namespaceId } = useParams();
  const extensions = useRecoilValue(extensionsState);
  const { name: clusterName } = useRecoilValue(clusterState) || {};
  const layoutState = useRecoilValue(columnLayoutState);

  const resource = extensions.find(el => {
    const { scope, urlPath, resource } = el.general || {};
    const extensionPath = urlPath || pluralize(resource?.kind?.toLowerCase());

    const hasCorrectScope =
      (scope?.toLowerCase() === 'namespace') === !!namespaceId ||
      (scope?.toLowerCase() === 'namespace') === !!namespace;
    if (!hasCorrectScope) return false;

    const crPath = window.location.pathname
      .replace(`/cluster/${clusterName}/`, '')
      .replace(/namespaces\/([A-Za-z0-9.][-A-Za-z0-9_.]*)?[A-Za-z0-9]\//, '')
      .replace('namespaces/-all-/', '')
      .replace('core-ui/', '')
      .replace('kymamodules/', '')
      .replace(`/${resourceName}`, '');

    return layoutState?.midColumn?.resourceType
      ? layoutState?.midColumn?.resourceType === extensionPath
      : crPath.split('/')[0] === extensionPath;
  });

  return resource;
};
