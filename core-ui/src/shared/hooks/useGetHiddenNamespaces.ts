import { useRecoilValue } from 'recoil';
import { configFeaturesState } from 'state/configFeaturesSelector';

type HiddenNamespacesConfig =
  | {
      isEnabled: boolean;
      config: {
        namespaces: string[];
      };
    }
  | undefined;

export const useGetHiddenNamespaces = (): string[] => {
  const configFeatures = useRecoilValue(configFeaturesState);

  const hiddenNamespacesConfig: Partial<HiddenNamespacesConfig> =
    configFeatures?.HIDDEN_NAMESPACES;

  const isValidAndEnabled =
    hiddenNamespacesConfig?.isEnabled &&
    Array.isArray(hiddenNamespacesConfig?.config?.namespaces);

  return isValidAndEnabled && hiddenNamespacesConfig
    ? hiddenNamespacesConfig.config!.namespaces
    : [];
};
