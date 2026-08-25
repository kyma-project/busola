import { FlexBox, Popover, Text, Title } from '@ui5/webcomponents-react';
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
import { CloudServiceSurveyCard } from './CloudServiceSurveyCard';
import { JouleFeedbackCard } from './JouleFeedbackCard';
import { KymaFeedbackCard } from './KymaFeedbackCard';
import { KymaSurveyCard } from './KymaSurveyCard';

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
          {!isCloudServiceSurveyEnabled && !cloudServiceSurveySignUpLink && (
            <CloudServiceSurveyCard
              signUpLink={cloudServiceSurveySignUpLink}
              showNewIndicators={showNewIndicators}
              onSignUp={handleNewFeedbackViewed}
            />
          )}
          <KymaSurveyCard
            signUpLink={kymaSurveySignUpLink}
            showNewIndicators={showNewIndicators}
            emphasized={
              !isCloudServiceSurveyEnabled || !cloudServiceSurveySignUpLink
            }
            onSignUp={handleNewFeedbackViewed}
          />
          {isKymaCompanionEnabled &&
            companionFeedbackLink &&
            window.location.pathname !== '/clusters' && (
              <JouleFeedbackCard feedbackLink={companionFeedbackLink} />
            )}
          <KymaFeedbackCard feedbackLink={kymaFeedbackConfig.link} />
        </Popover>,
        document.body,
      )}
    </>
  );
}
