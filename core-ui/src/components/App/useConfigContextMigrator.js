import { useSetRecoilState } from 'recoil';
import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';
import { useConfig } from 'shared/contexts/ConfigContext';
import { configState } from 'state/configAtom';

export const useConfigContextMigrator = () => {
  const config = useConfig();

  useUpdateRecoilIfValueChanged(config, configState);
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
