import { useRecoilValue } from 'recoil';
import { configurationState } from 'state/configurationSelector';

type HiddenNamespacesConfig =
  | {
      isEnabled: boolean;
      config: {
        namespaces: string[];
      };
    }
  | undefined;

export const useGetHiddenNamespaces = (): string[] => {
  const configuration = useRecoilValue(configurationState);
  const features = configuration?.features;

  const hiddenNamespacesConfig: Partial<HiddenNamespacesConfig> =
    features?.HIDDEN_NAMESPACES;

  const isValidAndEnabled =
    hiddenNamespacesConfig?.isEnabled &&
    Array.isArray(hiddenNamespacesConfig?.config?.namespaces);

  return isValidAndEnabled && hiddenNamespacesConfig
    ? hiddenNamespacesConfig.config!.namespaces
    : [];
};
