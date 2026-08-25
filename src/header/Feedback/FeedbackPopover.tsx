import {
  Button,
  FlexBox,
  ObjectStatus,
  Popover,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { configFeaturesNames } from 'state/types';
import './FeedbackPopover.scss';
import {
  FEEDBACK_SHOW_TYPE,
  getShowFeedbackStorageKey,
  setNoFeedbackShowNextTime,
} from 'components/KymaCompanion/components/JouleFeedbackDialog/helpers/feedbackViewHelpers';
import { ShellBarAction } from '../ShellBarAction';

export default function FeedbackPopover() {
  const { isEnabled: isFeedbackEnabled, config: kymaFeedbackConfig } =
    useFeature(configFeaturesNames.FEEDBACK);
  const {
    isEnabled: isKymaCompanionEnabled,
    config: { feedbackLink: companionFeedbackLink } = {},
  } = useFeature(configFeaturesNames.KYMA_COMPANION);
  const {
    isEnabled: isCloudServiceSurveyEnabled,
    config: { signUpLink: cloudServiceSurveySignUpLink } = {},
  } = useFeature(configFeaturesNames.CLOUD_SERVICE_SURVEY);
  const {
    isEnabled: isKymaSurveyEnabled,
    config: { signUpLink: kymaSurveySignUpLink } = {},
  } = useFeature(configFeaturesNames.KYMA_SURVEY);

  const { t } = useTranslation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showNewIndicators, setShowNewIndicators] = useState(false);
  const showFeedback = getShowFeedbackStorageKey();

  useEffect(() => {
    if (
      showFeedback === null ||
      showFeedback === FEEDBACK_SHOW_TYPE.SHOW ||
      showFeedback === FEEDBACK_SHOW_TYPE.DISMISSED_ONCE
    ) {
      const timeoutId = setTimeout(() => {
        setShowNewIndicators(true);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      const timeoutId = setTimeout(() => {
        setShowNewIndicators(false);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [showFeedback]);

  const handleNewFeedbackViewed = () => {
    if (showNewIndicators) {
      setNoFeedbackShowNextTime();
      setShowNewIndicators(false);
    }
  };

  if (!isFeedbackEnabled) {
    return null;
  }

  return (
    <>
      <ShellBarAction
        id="feedbackOpener"
        onClick={() => setFeedbackOpen(true)}
        icon="feedback"
        text={t('feedback.feedback')}
        title={t('feedback.give-feedback')}
        count={
          showNewIndicators &&
          isKymaSurveyEnabled &&
          window.location.pathname !== '/clusters'
            ? isCloudServiceSurveyEnabled
              ? '2'
              : '1'
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
          {!isCloudServiceSurveyEnabled ||
            (!cloudServiceSurveySignUpLink && (
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
                    {t('feedback.cloud-services-survey.title')}
                  </Title>
                  {showNewIndicators && (
                    <ObjectStatus state="Information" inverted>
                      {t('feedback.new')}
                    </ObjectStatus>
                  )}
                </FlexBox>
                <Text className="info-text">
                  {t('feedback.cloud-services-survey.info')}
                </Text>
                <Button
                  accessibleRole="Link"
                  accessibleName={t('feedback.cloud-services-survey.sign-up')}
                  accessibleDescription="Open in new tab link"
                  endIcon="inspect"
                  design={'Emphasized'}
                  onClick={() => {
                    handleNewFeedbackViewed();
                    const newWindow = window.open(
                      cloudServiceSurveySignUpLink,
                      '_blank',
                      'noopener, noreferrer',
                    );
                    if (newWindow) newWindow.opener = null;
                  }}
                >
                  {t('feedback.sign-up')}
                </Button>
              </FlexBox>
            ))}
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
                {t('feedback.kyma-survey.title')}
              </Title>
              {showNewIndicators && (
                <ObjectStatus state="Information" inverted>
                  {t('feedback.new')}
                </ObjectStatus>
              )}
            </FlexBox>
            <Text className="info-text">{t('feedback.kyma-survey.info')}</Text>
            <Button
              accessibleRole="Link"
              accessibleName={t('feedback.kyma-survey.sign-up')}
              accessibleDescription="Open in new tab link"
              endIcon="inspect"
              design={
                !isCloudServiceSurveyEnabled || !cloudServiceSurveySignUpLink
                  ? 'Emphasized'
                  : 'Default'
              }
              onClick={() => {
                handleNewFeedbackViewed();
                const newWindow = window.open(
                  kymaSurveySignUpLink,
                  '_blank',
                  'noopener, noreferrer',
                );
                if (newWindow) newWindow.opener = null;
              }}
            >
              {t('feedback.sign-up')}
            </Button>
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
                <Title level="H6" size="H6">
                  {t('feedback.joule.title')}
                </Title>
                <Text className="info-text">{t('feedback.joule.info')}</Text>
                <Button
                  accessibleRole="Link"
                  accessibleName={t('feedback.give-feedback-joule')}
                  accessibleDescription="Open in new tab link"
                  design="Default"
                  endIcon="inspect"
                  onClick={() => {
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
              accessibleName={t('feedback.give-feedback-kyma')}
              accessibleDescription="Open in new tab link"
              endIcon="inspect"
              design={'Default'}
              onClick={() => {
                const newWindow = window.open(
                  kymaFeedbackConfig.link,
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
