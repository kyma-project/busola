import {
  Bar,
  Button,
  Dialog,
  IllustratedMessage,
  Text,
} from '@ui5/webcomponents-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';

import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';

import './JouleFeedbackDialog.scss';
import {
  dismissFeedbackRequestFirstTime,
  FEEDBACK_SHOW_TYPE,
  getShowFeedbackStorageKey,
  setNoFeedbackShowNextTime,
} from './helpers/feedbackViewHelpers';

interface JouleFeedbackDialogProps {
  isDialogOpen: boolean;
  onSetDialogClosed: () => void;
}

export default function JouleFeedbackDialog({
  isDialogOpen,
  onSetDialogClosed: handleSetDialogClosed,
}: JouleFeedbackDialogProps) {
  const { isEnabled: isFeedbackEnabled } = useFeature(
    configFeaturesNames.FEEDBACK,
  );
  const { config: { feedbackLink: companionFeedbackLink } = {} } = useFeature(
    configFeaturesNames.KYMA_COMPANION,
  );

  const { t } = useTranslation();
  const setShowCompanion = useSetAtom(showKymaCompanionAtom);
  const [shouldShowJouleFeedback, setShouldShowJouleFeedback] = useState(() =>
    getShowFeedbackStorageKey(),
  );

  const handleFeedbackViewed = () => {
    setNoFeedbackShowNextTime();
    setShouldShowJouleFeedback(FEEDBACK_SHOW_TYPE.NO_SHOW);
    handleSetDialogClosed();
    setShowCompanion({ show: false, fullScreen: false });
  };

  const handleDissmissFeedback = () => {
    if (shouldShowJouleFeedback === FEEDBACK_SHOW_TYPE.DISMISSED_ONCE) {
      setShouldShowJouleFeedback(FEEDBACK_SHOW_TYPE.NO_SHOW);
      setNoFeedbackShowNextTime();
    } else if (shouldShowJouleFeedback !== FEEDBACK_SHOW_TYPE.NO_SHOW) {
      setShouldShowJouleFeedback(FEEDBACK_SHOW_TYPE.DISMISSED_ONCE);
      dismissFeedbackRequestFirstTime();
    }
    handleSetDialogClosed();
    setShowCompanion({ show: false, fullScreen: false });
  };

  const actions = (
    <>
      <Button
        accessibleRole="Link"
        accessibleName={t('feedback.give-feedback')}
        accessibleDescription="Open in new tab link"
        design="Emphasized"
        endIcon="inspect"
        onClick={() => {
          handleFeedbackViewed();
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
      <Button onClick={handleDissmissFeedback}>
        {t('common.buttons.close')}
      </Button>
    </>
  );

  if (!isFeedbackEnabled || !companionFeedbackLink) {
    return null;
  }

  return (
    <Dialog
      open={isDialogOpen}
      onClose={handleSetDialogClosed}
      headerText={t('joule-feedback.title')}
      footer={<Bar design="Footer" endContent={<>{actions}</>} />}
      className="joule-feedback-dialog"
    >
      <IllustratedMessage
        name="NewMail"
        design="Dialog"
        key="joule-feedback"
        titleText={t('joule-feedback.subtitle')}
        subtitle={
          <Text className="info-text">{t('joule-feedback.description')}</Text>
        }
        className="no-padding"
      ></IllustratedMessage>
    </Dialog>
  );
}
