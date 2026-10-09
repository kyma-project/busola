import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames, ForceConfirmDeleteFeature } from 'state/types';

export function useForceConfirmDelete(resourceType?: string): boolean {
  const feature = useFeature<ForceConfirmDeleteFeature>(
    configFeaturesNames.FORCE_CONFIRM_DELETE,
  );
  if (!feature?.isEnabled || !resourceType) return false;
  return (feature?.config?.resources ?? []).some(
    (r) => r.kind === resourceType,
  );
}
