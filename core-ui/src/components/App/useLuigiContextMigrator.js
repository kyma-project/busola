import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useSetRecoilState } from 'recoil';
import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';
import { configFeaturesState } from 'state/configFeaturesAtom';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { authDataState } from 'state/authDataAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { extResourcesState } from 'state/extResourcesAtom';
import { openapiState } from 'state/openapi/openapiAtom';

export const useLuigiContextMigrator = () => {
  const {
    features,
    activeClusterName,
    authData,
    namespaceId,
    customResources,
    openApi,
  } = useMicrofrontendContext();

  useUpdateRecoilIfValueChanged(features, configFeaturesState);
  useUpdateRecoilIfValueChanged(activeClusterName, activeClusterNameState);
  useUpdateRecoilIfValueChanged(authData, authDataState);
  useUpdateRecoilIfValueChanged(namespaceId, activeNamespaceIdState);
  useUpdateRecoilIfValueChanged(customResources, extResourcesState);
  useUpdateRecoilIfValueChanged(openApi, openapiState);
};

const useUpdateRecoilIfValueChanged = (val, recoilAtom) => {
  const setRecoilState = useSetRecoilState(recoilAtom);
  const prev = useRef(null);
  useEffect(() => {
    if (!isEqual(prev.current, val)) {
      setRecoilState(val);
      prev.current = val;
    }
  }, [val, setRecoilState]);
};
