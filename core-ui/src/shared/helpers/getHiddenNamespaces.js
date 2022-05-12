import LuigiClient from '@luigi-project/client';

export const getHiddenNamespaces = () => {
  const namespaceConfig = LuigiClient.getContext().features?.HIDDEN_NAMESPACES;
  console.log(namespaceConfig);
  const isValidAndEnabled =
    namespaceConfig?.isEnabled && Array.isArray(namespaceConfig?.selectors);

  return isValidAndEnabled ? namespaceConfig.selectors : [];
};
