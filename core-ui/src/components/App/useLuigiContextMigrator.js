import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useSetRecoilState } from 'recoil';
import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';
import { configFeaturesState } from 'state/configFeaturesAtom';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { authDataState } from 'state/authDataAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export const useLuigiContextMigrator = () => {
  const {
    features,
    activeClusterName,
    authData,
    namespaceId,
  } = useMicrofrontendContext();

  useUpdateRecoilIfValueChanged(features, configFeaturesState);
  useUpdateRecoilIfValueChanged(activeClusterName, activeClusterNameState);
  useUpdateRecoilIfValueChanged(authData, authDataState);
  useUpdateRecoilIfValueChanged(namespaceId, activeNamespaceIdState);
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
