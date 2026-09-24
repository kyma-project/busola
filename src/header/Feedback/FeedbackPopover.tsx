import type { ShellBarDomRef } from '@ui5/webcomponents-react';
import { FlexBox, Popover, Text, Title } from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import { type RefObject, useEffect, useState } from 'react';
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
import {
  CLOUD_SERVICE_SURVEY_VIEWED_KEY,
  isSurveyViewed,
  KYMA_SURVEY_VIEWED_KEY,
  markSurveyViewed,
} from './surveyHelpers';

/**
 * We need to discover if feedback feedbackOpener is in three dot menu or not.
 * If the feedbackOpener is in three dot menu, the Shellbar will hide it after clicking on the feedbackOpener and will clean elements below the feedbackOpener
 * If the feedbackOpener is in three dot menu we need to pin Popover to something visible after collapse of three dot menu.
 * If it is in three dot menu, we need to pin the Popover to something which won't close after opening, for example three dot menu button.   */
const resolveOpener = (
  shellbarRef: RefObject<ShellBarDomRef | null>,
): HTMLElement | undefined => {
  const feedbackAction = document.getElementById('feedbackOpener');
  if (feedbackAction && !feedbackAction.hasAttribute('in-overflow')) {
    return feedbackAction;
  }
  const overflowButton = shellbarRef?.current?.shadowRoot?.getElementById(
    'ui5-shellbar-overflow-button',
  );
  return overflowButton ?? feedbackAction ?? undefined;
};

export default function FeedbackPopover({
  shellbarRef,
}: {
  shellbarRef: RefObject<ShellBarDomRef | null>;
}) {
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
  const [opener, setOpener] = useState<HTMLElement | undefined>();
  const [cloudSurveyNew, setCloudSurveyNew] = useState(false);
  const [kymaSurveyNew, setKymaSurveyNew] = useState(false);
  const showFeedback = getShowFeedbackStorageKey();

  useEffect(() => {
    const shouldShow =
      showFeedback === null ||
      showFeedback === FEEDBACK_SHOW_TYPE.SHOW ||
      showFeedback === FEEDBACK_SHOW_TYPE.DISMISSED_ONCE;

    const timeoutId = setTimeout(() => {
      setCloudSurveyNew(
        shouldShow && !isSurveyViewed(CLOUD_SERVICE_SURVEY_VIEWED_KEY),
      );
      setKymaSurveyNew(shouldShow && !isSurveyViewed(KYMA_SURVEY_VIEWED_KEY));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [showFeedback]);

  const handleCloudSurveyViewed = () => {
    markSurveyViewed(CLOUD_SERVICE_SURVEY_VIEWED_KEY);
    setCloudSurveyNew(false);
    if (!kymaSurveyNew) setNoFeedbackShowNextTime();
  };

  const handleKymaSurveyViewed = () => {
    markSurveyViewed(KYMA_SURVEY_VIEWED_KEY);
    setKymaSurveyNew(false);
    if (!cloudSurveyNew) setNoFeedbackShowNextTime();
  };

  const cloudSurveyActive =
    isCloudServiceSurveyEnabled && !!cloudServiceSurveySignUpLink;
  const newCount =
    window.location.pathname !== '/clusters'
      ? (cloudSurveyActive && cloudSurveyNew ? 1 : 0) +
        (isKymaSurveyEnabled && kymaSurveyNew ? 1 : 0)
      : 0;

  if (!isFeedbackEnabled) {
    return null;
  }

  return (
    <>
      <ShellBarAction
        id="feedbackOpener"
        onClick={() => {
          const resolvedOpener = resolveOpener(shellbarRef);
          setOpener(resolvedOpener);
          setFeedbackOpen(true);
        }}
        icon="feedback"
        text={t('feedback.give-feedback')}
        title={t('feedback.give-feedback')}
        count={newCount > 0 ? String(newCount) : undefined}
      />
      {createPortal(
        <Popover
          opener={opener}
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
          {cloudSurveyActive && (
            <CloudServiceSurveyCard
              signUpLink={cloudServiceSurveySignUpLink}
              showNewIndicators={cloudSurveyNew}
              onSignUp={handleCloudSurveyViewed}
            />
          )}
          <KymaSurveyCard
            signUpLink={kymaSurveySignUpLink}
            showNewIndicators={kymaSurveyNew}
            emphasized={!cloudSurveyActive}
            onSignUp={handleKymaSurveyViewed}
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
