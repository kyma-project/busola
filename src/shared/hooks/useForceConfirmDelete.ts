import pluralize from 'pluralize';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames, ForceConfirmDeleteFeature } from 'state/types';

const normalize = (value: string) => pluralize(value.toLowerCase());

export function useForceConfirmDelete(resourceType?: string): boolean {
  const feature = useFeature<ForceConfirmDeleteFeature>(
    configFeaturesNames.FORCE_CONFIRM_DELETE,
  );
  if (!feature?.isEnabled || !resourceType) return false;
  const target = normalize(resourceType);
  return (feature?.config?.resources ?? []).some(
    (r) => normalize(r.kind) === target,
  );
}
