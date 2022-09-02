import { useEffect, useState } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import * as jp from 'jsonpath';

export const useSidecar = ({
  initialRes,
  res,
  setRes,
  path,
  label,
  enabled,
}) => {
  const { features } = useMicrofrontendContext();
  const isIstioFeatureOn = features?.ISTIO?.isEnabled;

  const isInitSidecarInjectionTurnedOn =
    jp.value(initialRes || {}, `${path}["${[label]}"]`) === enabled;

  const [isSidecarEnabled, setSidecarEnabled] = useState(
    isInitSidecarInjectionTurnedOn,
  );

  useEffect(() => {
    // toggles istio-injection when 'Enable sidecar injection' is clicked
    const addSidecarToYaml = () => {
      jp.value(res, `${path}["${[label]}"]`, enabled);
      setRes({ ...res });
    };

    const removeSidecarFromYaml = () => {
      const istioParentObject = jp.value(res, path);
      if (istioParentObject) {
        delete istioParentObject[label];
        jp.value(res, path, istioParentObject);
        setRes(res);
      }
    };

    if (isSidecarEnabled) {
      addSidecarToYaml();
    } else {
      removeSidecarFromYaml();
    }
  }, [isSidecarEnabled, setSidecarEnabled, setRes, path, label, enabled]);

  useEffect(() => {
    // toggles 'Enable sidecar injection' when istio-injection is deleted in yaml

    const isSidecarDisabledInYaml =
      jp.value(res, `${path}["${label}"]`) !== enabled;

    if (isSidecarEnabled && isSidecarDisabledInYaml) {
      setSidecarEnabled(false);
    }
  }, [isSidecarEnabled, setSidecarEnabled, setRes, path, label, enabled, res]);

  return { isIstioFeatureOn, isSidecarEnabled, setSidecarEnabled };
};
