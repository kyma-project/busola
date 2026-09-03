import {
  Button,
  Icon,
  ObjectStatus,
  Popover,
  Text,
} from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { configFeaturesNames } from 'state/types';
import jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

type ProtectedResourceWarningProps = {
  entry: any;
  withText?: boolean;
};

type MatchRules = Record<string, unknown>;

interface ProtectedResourceRule {
  match?: MatchRules;
  regex?: boolean;
  message?: string;
  messageSrc?: string;
}

export const ProtectedResourceWarning = ({
  entry,
  withText,
}: ProtectedResourceWarningProps) => {
  const { t } = useTranslation();
  const ID = useId();
  const [protectedWarningOpen, setProtectedWarningOpen] = useState(false);
  const protectedResourcesFeature = useFeature(
    configFeaturesNames.PROTECTED_RESOURCES,
  );
  const [popoverMessage, setPopoverMessage] = useState('');
  const protectedResourceRules = protectedResourcesFeature?.isEnabled
    ? protectedResourcesFeature?.config?.resources || []
    : [];

  const getEntryProtection = (entry: any) => {
    if (!entry) return [];

    return protectedResourceRules.filter(
      (rule: ProtectedResourceRule): boolean =>
        Object.entries(rule.match ?? {}).every(
          ([pattern, value]: [string, unknown]) => {
            const entryValue = jp.value(entry, pattern);

            if (rule.regex) {
              return (
                typeof entryValue === 'string' &&
                typeof value === 'string' &&
                new RegExp(value).test(entryValue)
              );
            }

            return entryValue === value;
          },
        ),
    );
  };
  const matchedRules = getEntryProtection(entry);

  if (!matchedRules.length) {
    return <span />;
  }

  const message = matchedRules
    .map((rule: ProtectedResourceRule) => {
      if (rule.message) {
        return rule.message;
      } else if (rule.messageSrc) {
        const messageFromSrc = jp.value(entry, rule.messageSrc);
        if (messageFromSrc) {
          return messageFromSrc;
        }
      }
      return t('common.protected-resource-description');
    })
    .join('\n');

  return (
    <>
      <Button
        className="protected-resource-button"
        id={`protectedOpener-${entry?.metadata?.uid}-${ID}`}
        onClick={() => {
          setProtectedWarningOpen(true);
          setPopoverMessage(message);
        }}
        design="Transparent"
        icon={withText ? undefined : 'locked'}
        accessibleName={t('common.protected-resource')}
        style={
          !withText
            ? ({
                '--sapButton_Lite_TextColor': 'var(--sapCriticalColor)',
                '--sapButton_Lite_Hover_TextColor': 'var(--sapCriticalColor)',
              } as never)
            : undefined
        }
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
        ) : null}
      </Button>
      {createPortal(
        <Popover
          placement="End"
          opener={`protectedOpener-${entry?.metadata?.uid}-${ID}`}
          open={protectedWarningOpen}
          onClose={() => setProtectedWarningOpen(false)}
        >
          <Text className="popover-description">{popoverMessage}</Text>
        </Popover>,
        document.body,
      )}
    </>
  );
};
