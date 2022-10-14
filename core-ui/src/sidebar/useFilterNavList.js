import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { configFeaturesState } from 'state/configFeaturesAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useFetchPermissions } from './useFetchPermissions';

//called each time namespace changes
export const useFilterNavList = completeNavList => {
  const configFeatures = useRecoilValue(configFeaturesState);
  const activeNamespaceId = useRecoilValue(activeNamespaceIdState);

  const [filteredNavList, setFilteredNavList] = useState({});

  const fetchPermissions = useFetchPermissions();

  useEffect(() => {
    if (completeNavList.length === 0) return;

    async function effectFn() {
      //filterCompleteListByFeatures from configFeature

      const permissionSet = await fetchPermissions({ namespace: '*' });
      //filterCompleteListByPermissions

      //filterCompleteListByResourceScope cluster/namespace
      const scope = activeNamespaceId ? 'namespace' : 'cluster';
      const filteredByScope = filterByScope(completeNavList, scope);

      const sortedToCategories = sortByCategories(filteredByScope);

      console.log(sortedToCategories);
      setFilteredNavList(sortedToCategories);
    }

    void effectFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completeNavList, activeNamespaceId]);

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
