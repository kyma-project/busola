import {
  Button,
  FlexBox,
  ObjectStatus,
  Popover,
  ShellBarItem,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { configFeaturesNames } from 'state/types';
import './FeedbackPopover.scss';

const FEEDBACK_VIEWED_STORAGE_KEY = 'feedback-new-indicators-viewed';

export default function FeedbackPopover() {
  const { isEnabled: isFeedbackEnabled, link: kymaFeedbackLink } = useFeature(
    configFeaturesNames.FEEDBACK,
  );
  const {
    isEnabled: isKymaCompanionEnabled,
    config: { feedbackLink: companionFeedbackLink } = {},
  } = useFeature(configFeaturesNames.KYMA_COMPANION);

  const { t } = useTranslation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showNewIndicators, setShowNewIndicators] = useState(false);

  useEffect(() => {
    const hasViewed = localStorage.getItem(FEEDBACK_VIEWED_STORAGE_KEY);
    if (hasViewed !== 'true') {
      setShowNewIndicators(true);
    }
  }, []);

  const handleNewFeedbackViewed = () => {
    if (showNewIndicators) {
      localStorage.setItem(FEEDBACK_VIEWED_STORAGE_KEY, 'true');
      setShowNewIndicators(false);
    }
  };

  if (!isFeedbackEnabled) {
    return null;
  }

  return (
    <>
      <ShellBarItem
        id="feedbackOpener"
        onClick={() => setFeedbackOpen(true)}
        icon="feedback"
        text={t('feedback.feedback')}
        title={t('feedback.give-feedback')}
        count={
          isKymaCompanionEnabled &&
          companionFeedbackLink &&
          showNewIndicators &&
          window.location.pathname !== '/clusters'
            ? '1'
            : undefined
        }
      />
      {createPortal(
        <Popover
          opener="feedbackOpener"
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          horizontalAlign="End"
          placement="Bottom"
          verticalAlign="Center"
          className="feedbackPopover"
        >
          <FlexBox
            alignItems="Start"
            direction="Column"
            justifyContent="Start"
            gap={4}
            className="sap-margin-bottom-medium"
          >
            <Title level="H5" size="H5">
              {t('feedback.intro.title')}
            </Title>
            <Text className="info-text">{t('feedback.intro.info')}</Text>
          </FlexBox>
          {isKymaCompanionEnabled &&
            companionFeedbackLink &&
            window.location.pathname !== '/clusters' && (
              <FlexBox
                alignItems="Start"
                direction="Column"
                justifyContent="Start"
                gap={16}
                className="sap-margin-bottom-medium"
              >
                <FlexBox
                  direction="Row"
                  alignItems="Center"
                  justifyContent="Start"
                  gap={12}
                >
                  <Title level="H6" size="H6">
                    {t('feedback.joule.title')}
                  </Title>
                  {showNewIndicators && (
                    <ObjectStatus state="Information" inverted>
                      {t('feedback.new')}
                    </ObjectStatus>
                  )}
                </FlexBox>
                <Text className="info-text">{t('feedback.joule.info')}</Text>
                <Button
                  accessibleRole="Link"
                  accessibleName={t('feedback.give-feedback')}
                  accessibleDescription="Open in new tab link"
                  design="Emphasized"
                  endIcon="inspect"
                  onClick={() => {
                    handleNewFeedbackViewed();
                    const newWindow = window.open(
                      companionFeedbackLink,
                      '_blank',
                      'noopener, noreferrer',
                    );
                    if (newWindow) newWindow.opener = null;
                  }}
                >
                  {t('feedback.give-feedback')}
                </Button>
              </FlexBox>
            )}
          <FlexBox
            alignItems="Start"
            direction="Column"
            justifyContent="Start"
            gap={16}
          >
            <Title level="H6" size="H6">
              {t('feedback.kyma.title')}
            </Title>
            <Text className="info-text">{t('feedback.kyma.info')}</Text>
            <Button
              accessibleRole="Link"
              accessibleName={t('feedback.give-feedback')}
              accessibleDescription="Open in new tab link"
              endIcon="inspect"
              design={
                !isKymaCompanionEnabled || !companionFeedbackLink
                  ? 'Emphasized'
                  : 'Default'
              }
              onClick={() => {
                const newWindow = window.open(
                  kymaFeedbackLink,
                  '_blank',
                  'noopener, noreferrer',
                );
                if (newWindow) newWindow.opener = null;
              }}
            >
              {t('feedback.give-feedback')}
            </Button>
          </FlexBox>
        </Popover>,
        document.body,
      )}
    </>
  );
}
