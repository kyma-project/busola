import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { useParams } from 'react-router';
import { clusterAtom } from 'state/clusterAtom';
import pluralize from 'pluralize';
import { allExtensionsAtom } from 'state/navigation/extensionsAtom';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

export const useGetCRbyPath = resourceType => {
  const { namespaceId } = useParams();
  const extensions = useAtomValue(allExtensionsAtom);
  const { name: clusterName } = useAtomValue(clusterAtom) || {};
  const layoutState = useAtomValue(columnLayoutAtom);
  const resource = useMemo(() => {
    return extensions.find(el => {
      const { scope, urlPath, resource } = el.general || {};
      const extensionPath = urlPath || pluralize(resource?.kind?.toLowerCase());

      const hasCorrectScope =
        (scope?.toLowerCase() === 'namespace') ===
          !!layoutState?.midColumn?.namespaceId ||
        (scope?.toLowerCase() === 'namespace') === !!namespaceId;

      if (!hasCorrectScope) return false;

      const crPath = window.location.pathname
        .replace(`/cluster/${clusterName}/`, '')
        .replace(/namespaces\/([A-Za-z0-9.][-A-Za-z0-9_.]*)?[A-Za-z0-9]\//, '')
        .replace('namespaces/-all-/', '')
        .replace('core-ui/', '')
        .replace('kymamodules/', '');

      return resourceType
        ? resourceType === extensionPath
        : crPath.split('/')[0] === extensionPath;
    });
  }, [extensions, layoutState, clusterName, namespaceId, resourceType]);

  return resource;
};
