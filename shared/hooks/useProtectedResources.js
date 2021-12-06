import React from 'react';
import * as jp from 'jsonpath';
import { Icon } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from '../contexts/MicrofrontendContext';
import { Tooltip } from '../components/Tooltip/Tooltip';
import { useFeatureToggle } from './useFeatureToggle';

export function useProtectedResources(i18n) {
  const { t } = useTranslation(['translation'], { i18n });
  const microfrontendContext = useMicrofrontendContext();
  const [disableResourceProtection] = useFeatureToggle(
    'disableResourceProtection',
  );

  const protectedResourceRules = microfrontendContext.features
    ?.PROTECTED_RESOURCES?.isEnabled
    ? microfrontendContext.features?.PROTECTED_RESOURCES?.config.resources
    : [];

  const getEntryProtection = entry => {
    return protectedResourceRules.filter(rule =>
      Object.entries(rule.match).every(([pattern, value]) =>
        !!rule.regex
          ? jp.value(entry, pattern) &&
            new RegExp(value).test(jp.value(entry, pattern))
          : jp.value(entry, pattern) === value,
      ),
    );
  };

  const isProtected = entry =>
    !disableResourceProtection && !!getEntryProtection(entry).length;

  const protectedResourceWarning = entry => {
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
          return t('common.protected-resource');
        }
      })
      .join('\n');

    return (
      <Tooltip
        className="protected-resource-warning"
        content={message}
        delay={0}
      >
        <Icon className="fd-object-status--critical" glyph="message-warning" />
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
