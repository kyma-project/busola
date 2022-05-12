import LuigiClient from '@luigi-project/client';

export const getHiddenNamespaces = () => {
  const namespaceConfig = LuigiClient.getContext().features?.HIDDEN_NAMESPACES;

  const isValidAndEnabled =
    namespaceConfig?.isEnabled && Array.isArray(namespaceConfig?.config);

  return isValidAndEnabled ? namespaceConfig.config : [];
};
