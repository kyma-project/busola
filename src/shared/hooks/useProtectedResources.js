import {
  Button,
  Icon,
  ObjectStatus,
  Popover,
  Text,
} from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import jp from 'jsonpath';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { disableResourceProtectionState } from 'state/preferences/disableResourceProtectionAtom';

export function useProtectedResources() {
  const { t } = useTranslation();
  const popoverRef = useRef(null);
  const [popoverMessage, setPopoverMessage] = useState('');

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
      <Button
        design="Transparent"
        onClick={e => {
          setPopoverMessage(message);
          popoverRef?.current?.showAt(e?.target);
        }}
      >
        {withText ? (
          <ObjectStatus
            icon={<Icon name="locked" />}
            showDefaultIcon
            state="Warning"
            style={{ textOverflow: 'ellipsis' }}
          >
            {t('common.protected-resource')}
          </ObjectStatus>
        ) : (
          <Icon
            design="Critical"
            name="locked"
            style={{ marginTop: '0.125rem' }}
          />
        )}
      </Button>
    );
  };

  const protectedResourcePopover = () => {
    if (disableResourceProtection) {
      return <></>;
    }
    return createPortal(
      <Popover placementType="Right" ref={popoverRef}>
        <Text className="description">{popoverMessage}</Text>
      </Popover>,
      document.body,
    );
  };

  return {
    protectedResourceRules,
    getEntryProtection,
    isProtected,
    protectedResourceWarning,
    protectedResourcePopover,
  };
}
