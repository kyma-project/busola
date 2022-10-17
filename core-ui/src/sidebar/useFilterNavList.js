import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useFetchPermissions } from './useFetchPermissions';
import { completeResourceListSelector } from 'state/resourceList/completeResourceListSelector';
import { openapiPathIdListSelector } from 'state/openapi/openapiPathIdSelector';
import { configFeaturesState } from 'state/configFeaturesAtom';
import { filterExistingAndAllowedNodes } from 'sidebar/filterExistingAndAllowedNodes';
import { isEmpty } from 'lodash';

export const useFilterNavList = () => {
  const completeResourceList = useRecoilValue(completeResourceListSelector);
  const activeNamespaceId = useRecoilValue(activeNamespaceIdState);
  const openapiPathIdList = useRecoilValue(openapiPathIdListSelector);
  const configFeatures = useRecoilValue(configFeaturesState);

  const [filteredNavList, setFilteredNavList] = useState(null);

  const fetchPermissions = useFetchPermissions();

  //called each time namespace changes
  useEffect(() => {
    if (isEmpty(completeResourceList) || isEmpty(openapiPathIdList)) {
      return;
    }

    async function effectFn() {
      const namespaceName = activeNamespaceId ? activeNamespaceId : '*';
      const permissionSet = await fetchPermissions({
        namespace: namespaceName,
      });

      const scope = activeNamespaceId ? 'namespace' : 'cluster';
      const currentScopeNodes = filterByScope(completeResourceList, scope);
      const allowedNodes = currentScopeNodes.filter(node =>
        filterExistingAndAllowedNodes(
          node,
          permissionSet,
          openapiPathIdList,
          configFeatures,
        ),
      );

      const sortedToCategories = sortByCategories(allowedNodes);

      setFilteredNavList(sortedToCategories);
    }

    void effectFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completeResourceList, activeNamespaceId, openapiPathIdList]);

  return { filteredNavList };
};
//
//
//
const filterByScope = (navList, scope) => {
  if (!(scope === 'cluster' || scope === 'namespace')) {
    console.error('Navigation scope is not defined.');
    return;
  }
  const isNamespace = scope === 'namespace';
  const isCluster = scope === 'cluster';

  const filteredList = navList.filter(resource => {
    if (isNamespace) {
      return resource.namespaced;
    }
    if (isCluster) {
      return !resource.namespaced;
    }
    return false;
  });
  return filteredList;
};

const sortByCategories = navList => {
  const sortedToCategories = {};

  navList.forEach(resource => {
    const categoryKey = resource.category;

    if (!sortedToCategories[categoryKey]) {
      sortedToCategories[categoryKey] = [];
    }
    sortedToCategories[categoryKey].push(resource);
  });

  return sortedToCategories;
};
