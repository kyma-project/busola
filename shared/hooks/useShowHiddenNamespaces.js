import LuigiClient from '@luigi-project/client';

export function useShowHiddenNamespaces() {
  return (LuigiClient.getActiveFeatureToggles() || []).includes(
    'showHiddenNamespaces',
  );
}
