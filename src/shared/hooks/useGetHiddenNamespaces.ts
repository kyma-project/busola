import { useFeature } from 'hooks/useFeature';
import { ConfigFeature } from 'state/types';
import { useMemo } from 'react';

interface HiddenNamespacesFeature extends ConfigFeature {
  config?: {
    namespaces?: string[];
  };
}

export const useGetHiddenNamespaces = (): string[] => {
  const hiddenNamespacesConfig = useFeature<HiddenNamespacesFeature>(
    'HIDDEN_NAMESPACES',
  );

  const hiddenNamespaces = useMemo(() => {
    const isValidAndEnabled =
      hiddenNamespacesConfig?.isEnabled &&
      Array.isArray(hiddenNamespacesConfig?.config?.namespaces);

    return isValidAndEnabled ? hiddenNamespacesConfig!.config!.namespaces! : [];
  }, [hiddenNamespacesConfig]);

  return hiddenNamespaces;
};
