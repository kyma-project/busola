import { useEffect, useState } from 'react';
import jp from 'jsonpath';
import { useFeature } from 'hooks/useFeature';

export const useSidecar = ({
  initialRes,
  res,
  setRes,
  path,
  label,
  enabled,
  disabled,
}) => {
  const isIstioFeatureOn = useFeature('ISTIO')?.isEnabled;

  const isInitSidecarInjectionTurnedOn =
    jp.value(initialRes || {}, `${path}["${[label]}"]`) === enabled;

  const [isSidecarEnabled, setSidecarEnabled] = useState(
    isInitSidecarInjectionTurnedOn,
  );

  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    // toggles istio-injection when 'Enable sidecar injection' is clicked
    if (isChanged) {
      const toggleLabelInYaml = () => {
        const newValue = isSidecarEnabled ? enabled : disabled;
        jp.value(res, `${path}["${[label]}"]`, newValue);
        setRes({ ...res });
      };
      toggleLabelInYaml();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSidecarEnabled, setSidecarEnabled, setRes, path, label, enabled]);

  useEffect(() => {
    // toggles 'Enable sidecar injection' off when istio-injection is deleted in yaml
    const isSidecarDisabledInYaml =
      jp.value(res, `${path}["${label}"]`) !== enabled;

    if (isChanged) {
      if (isSidecarEnabled && isSidecarDisabledInYaml) {
        setSidecarEnabled(false);
      }
    }
  }, [
    isSidecarEnabled,
    setSidecarEnabled,
    setRes,
    path,
    label,
    enabled,
    res,
    isChanged,
  ]);

  return {
    isIstioFeatureOn,
    isSidecarEnabled,
    setSidecarEnabled,
    setIsChanged,
  };
};
