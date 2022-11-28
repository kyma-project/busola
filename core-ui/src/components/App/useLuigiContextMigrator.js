import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useSetRecoilState } from 'recoil';
import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';

import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { extResourcesState } from 'state/extResourcesAtom';
import { ssoDataState } from 'state/ssoDataAtom';
import { lazyConfigFeaturesState } from 'state/configFeatures/lazyConfigFeaturesAtom';

import { lazyConfigFeaturesNames } from 'state/types';

export const useLuigiContextMigrator = () => {
  const {
    features,
    namespaceId,
    customResources,
    ssoData,
  } = useMicrofrontendContext();

  useUpdateRecoilIfValueChanged(namespaceId, activeNamespaceIdState);
  useUpdateRecoilIfValueChanged(customResources, extResourcesState);
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

  useUpdateRecoilIfValueChanged(lazyConfigFeatures, lazyConfigFeaturesState);
};
