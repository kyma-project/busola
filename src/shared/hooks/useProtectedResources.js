import { Icon, ObjectStatus } from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { disableResourceProtectionState } from 'state/preferences/disableResourceProtectionAtom';

export function useProtectedResources() {
  const { t } = useTranslation();
  const protectedResourcesFeature = useFeature('PROTECTED_RESOURCES');
  const disableResourceProtection = useRecoilValue(
    disableResourceProtectionState,
  );

  const protectedResourceRules = protectedResourcesFeature?.isEnabled
    ? protectedResourcesFeature?.config?.resources || []
    : [];

  const getEntryProtection = entry => {
    return protectedResourceRules.filter(rule =>
      Object.entries(rule?.match || {}).every(([pattern, value]) =>
        !!rule?.regex
          ? jp.value(entry, pattern) &&
            new RegExp(value).test(jp.value(entry, pattern))
          : jp.value(entry, pattern) === value,
      ),
    );
  };

  const isProtected = entry =>
    !disableResourceProtection && !!getEntryProtection(entry).length;

  const protectedResourceWarning = (entry, withText) => {
    const matchedRules = getEntryProtection(entry);

    if (disableResourceProtection || !matchedRules.length) {
      return <span />;
    }

    const message = matchedRules
      .map(rule => {
        if (rule.message) {
          return rule.message;
        } else if (rule.messageSrc) {
          return jp.value(entry, rule.messageSrc);
        } else {
          return t('common.protected-resource-description');
        }
      })
      .join('\n');

    return (
      <Tooltip
        className="protected-resource-warning"
        content={message}
        delay={0}
      >
        {!withText && <Icon design="Critical" name="locked" />}
        {withText && (
          <ObjectStatus
            icon={<Icon name="locked" />}
            showDefaultIcon
            state="Warning"
          >
            {t('common.protected-resource')}
          </ObjectStatus>
        )}
      </Tooltip>
    );
  };

  return {
    protectedResourceRules,
    getEntryProtection,
    isProtected,
    protectedResourceWarning,
  };
}
