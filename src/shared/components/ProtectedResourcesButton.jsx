import {
  Button,
  Icon,
  ObjectStatus,
  Popover,
  Text,
} from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import { useAtomValue } from 'jotai';
import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { disableResourceProtectionAtom } from 'state/preferences/disableResourceProtectionAtom';
import { configFeaturesNames } from 'state/types';
import jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

export const ProtectedResourceWarning = ({ entry, withText }) => {
  const { t } = useTranslation();
  const ID = useId();
  const [protectedWarningOpen, setProtectedWarningOpen] = useState(false);
  const disableResourceProtection = useAtomValue(disableResourceProtectionAtom);
  const protectedResourcesFeature = useFeature(
    configFeaturesNames.PROTECTED_RESOURCES,
  );
  const [popoverMessage, setPopoverMessage] = useState('');
  const protectedResourceRules = protectedResourcesFeature?.isEnabled
    ? protectedResourcesFeature?.config?.resources || []
    : [];

  const getEntryProtection = (entry) => {
    if (!entry) return [];

    return protectedResourceRules.filter((rule) =>
      Object.entries(rule?.match || {}).every(([pattern, value]) =>
        rule?.regex
          ? jp.value(entry, pattern) &&
            new RegExp(value).test(jp.value(entry, pattern))
          : jp.value(entry, pattern) === value,
      ),
    );
  };
  const matchedRules = getEntryProtection(entry);

  if (disableResourceProtection || !matchedRules.length) {
    return <span />;
  }

  const message = matchedRules
    .map((rule) => {
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
    <>
      <Button
        id={`protectedOpener-${entry?.metadata?.uid}-${ID}`}
        onClick={() => {
          setProtectedWarningOpen(true);
          setPopoverMessage(message);
        }}
        design="Transparent"
      >
        {withText ? (
          <ObjectStatus
            icon={<Icon name="locked" />}
            showDefaultIcon
            state="Critical"
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
      {createPortal(
        <Popover
          placement="End"
          opener={`protectedOpener-${entry?.metadata?.uid}-${ID}`}
          open={protectedWarningOpen}
          onClose={() => setProtectedWarningOpen(false)}
        >
          <Text className="description">{popoverMessage}</Text>
        </Popover>,
        document.body,
      )}
    </>
  );
};
