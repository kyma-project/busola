import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useSetRecoilState } from 'recoil';
import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';

import { configFeaturesState } from 'state/configFeatures/configFeaturesAtom';
import { groupsState } from 'state/groupsAtom';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { authDataState } from 'state/authDataAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { extResourcesState } from 'state/extResourcesAtom';
import { openapiState } from 'state/openapi/openapiAtom';
import { clusterState } from 'state/clusterAtom';
import { clusterConfigState } from 'state/clusterConfigAtom';
import { ssoDataState } from 'state/ssoDataAtom';
import { lazyConfigFeaturesState } from 'state/configFeatures/lazyConfigFeaturesAtom';

import { lazyConfigFeaturesNames } from 'state/types';

export const useLuigiContextMigrator = () => {
  const {
    features,
    activeClusterName,
    authData,
    namespaceId,
    customResources,
    openApi,
    cluster,
    config,
    ssoData,
    groups,
  } = useMicrofrontendContext();

  const isReactNavigationEnabled = features?.REACT_NAVIGATION?.isEnabled;

  useUpdateRecoilIfValueChanged(groups, groupsState);
  useUpdateRecoilIfValueChanged(
    activeClusterName,
    activeClusterNameState,
    !isReactNavigationEnabled,
  );
  useUpdateRecoilIfValueChanged(authData, authDataState);
  useUpdateRecoilIfValueChanged(namespaceId, activeNamespaceIdState);
  useUpdateRecoilIfValueChanged(customResources, extResourcesState);
  useUpdateRecoilIfValueChanged(openApi, openapiState);
  useUpdateRecoilIfValueChanged(config, clusterConfigState);
  useUpdateRecoilIfValueChanged(cluster, clusterState);
  useUpdateRecoilIfValueChanged(ssoData, ssoDataState);

  useUpdateConfigFeatures(features);
};

export const useUpdateRecoilIfValueChanged = (val, recoilAtom, skip) => {
  const setRecoilState = useSetRecoilState(recoilAtom);

  const prev = useRef(null);

  useEffect(() => {
    if (skip) return;
    if (!isEqual(prev.current, val)) {
      setRecoilState(val);
      prev.current = val;
    }
  }, [val, setRecoilState, recoilAtom, skip]);
};

const useUpdateConfigFeatures = features => {
  const configFeatures = { ...features };
  const lazyConfigFeatures = {};
  lazyConfigFeatures[lazyConfigFeaturesNames?.PROMETHEUS] =
    features?.PROMETHEUS;
  delete configFeatures[lazyConfigFeaturesNames?.PROMETHEUS];

  useUpdateRecoilIfValueChanged(configFeatures, configFeaturesState);
  useUpdateRecoilIfValueChanged(lazyConfigFeatures, lazyConfigFeaturesState);
};
