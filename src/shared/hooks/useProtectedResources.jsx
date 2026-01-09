import { useFeature } from 'hooks/useFeature';
import { useAtomValue } from 'jotai';
import jp from 'jsonpath';

import { disableResourceProtectionAtom } from 'state/settings/disableResourceProtectionAtom';
import { configFeaturesNames } from 'state/types';

export function useProtectedResources() {
  const protectedResourcesFeature = useFeature(
    configFeaturesNames.PROTECTED_RESOURCES,
  );
  const disableResourceProtection = useAtomValue(disableResourceProtectionAtom);

  const protectedResourceRules = protectedResourcesFeature?.isEnabled
    ? protectedResourcesFeature?.config?.resources || []
    : [];

  const getEntryProtection = (entry) => {
    if (!entry) return [];

    return protectedResourceRules.filter((rule) => {
      if (rule?.match === null) return;
      else
        return Object.entries(rule?.match || {}).every(([pattern, value]) =>
          rule?.regex
            ? jp.value(entry, pattern) &&
              new RegExp(value).test(jp.value(entry, pattern))
            : jp.value(entry, pattern) === value,
        );
    });
  };

  // Returns true if the resource matches protection rules (for showing icon)
  const isProtectedResource = (entry) => !!getEntryProtection(entry).length;

  // Returns true if modification should be blocked (considers user setting)
  const isProtected = (entry) =>
    !disableResourceProtection && isProtectedResource(entry);

  return {
    protectedResourceRules,
    getEntryProtection,
    isProtected,
    isProtectedResource,
  };
}
