import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useSetRecoilState } from 'recoil';
import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';

import { extResourcesState } from 'state/extResourcesAtom';
import { ssoDataState } from 'state/ssoDataAtom';

export const useLuigiContextMigrator = () => {
  const { customResources, ssoData } = useMicrofrontendContext();

  useUpdateRecoilIfValueChanged(customResources, extResourcesState);
  useUpdateRecoilIfValueChanged(ssoData, ssoDataState);
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
