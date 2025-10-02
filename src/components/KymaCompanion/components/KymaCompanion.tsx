import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Button, Card, Title } from '@ui5/webcomponents-react';
import {
  ShowKymaCompanion,
  showKymaCompanionAtom,
} from 'state/companion/showKymaCompanionAtom';
import { Chat } from './Chat/Chat';
import { chatHelpers } from './Chat/chatHelper';
import { AIError, Author, ChatGroup } from './Chat/types';
import Disclaimer from './Disclaimer/Disclaimer';

import './KymaCompanion.scss';
import {
  FEEDBACK_SHOW_TYPE,
  getShowFeedbackStorageKey,
} from './JouleFeedbackDialog/helpers/feedbackViewHelpers';
import JouleFeedbackDialog from './JouleFeedbackDialog/JouleFeedbackDialog';

export default function KymaCompanion() {
  const { t } = useTranslation();

  const [showCompanion, setShowCompanion] = useAtom<ShowKymaCompanion>(
    showKymaCompanionAtom,
  );
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialScreen, setIsInitialScreen] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isReset, setIsReset] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatGroup[]>(
    chatHelpers.createInitialState(t('kyma-companion.introduction')),
  );
  const [error, setError] = useState<AIError>({
    message: null,
    displayRetry: false,
  });
  const [time, setTime] = useState<Date>(new Date());
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] =
    useState<boolean>(false);

  function handleRefresh() {
    setChatHistory(
      chatHelpers.createInitialState(t('kyma-companion.introduction')),
    );
    setError({
      message: null,
      displayRetry: false,
    });
    setTime(new Date());
    setIsReset(true);
    setIsInitialScreen(false);
  }

  const handleCloseChat = () => {
    if (getShowFeedbackStorageKey() === FEEDBACK_SHOW_TYPE.NO_SHOW) {
      setShowCompanion({ show: false, fullScreen: false });
      return;
    }
    const promptsNumber = chatHistory[0].messages.filter(
      (message) => message.author === Author.USER,
    ).length;
    if (promptsNumber > 4) setIsFeedbackDialogOpen(true);
    else setShowCompanion({ show: false, fullScreen: false });
  };

  useEffect(() => {
    if (chatHistory[0].messages.length > 1) {
      setIsInitialScreen(false);
      return;
    } else {
      setIsInitialScreen(true);
    }
  }, [chatHistory]);

  return (
    <div id="companion_wrapper">
      <Card
        className="kyma-companion"
        accessibleName={t('kyma-companion.name')}
        header={
          <div
            className={`kyma-companion__${
              showDisclaimer || isInitialScreen ? 'fullscreen-' : ''
            }header`}
          >
            <Title level="H5" size="H5" className="companion-title">
              {t('kyma-companion.name')}
            </Title>
            <div className="actions-container">
              {!showDisclaimer && !isInitialScreen && (
                <Button
                  design="Transparent"
                  icon="restart"
                  disabled={loading}
                  tooltip={t('common.buttons.reset')}
                  className="action"
                  onClick={() => handleRefresh()}
                />
              )}
              {!initialLoading && (
                <Button
                  design="Transparent"
                  icon={
                    showCompanion.fullScreen
                      ? 'exit-full-screen'
                      : 'full-screen'
                  }
                  className="action"
                  onClick={() =>
                    setShowCompanion({
                      show: true,
                      fullScreen: !showCompanion.fullScreen,
                    })
                  }
                />
              )}
              {!showDisclaimer && !initialLoading && (
                <Button
                  design="Transparent"
                  icon="hint"
                  tooltip={t('kyma-companion.disclaimer.tooltip')}
                  className="action"
                  onClick={() => setShowDisclaimer(true)}
                />
              )}
              <Button
                design="Transparent"
                icon="decline"
                tooltip={t('common.buttons.close')}
                className="action"
                onClick={() => handleCloseChat()}
              />
            </div>
          </div>
        }
      >
        <Chat
          loading={loading}
          setLoading={setLoading}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          isReset={isReset}
          setIsReset={setIsReset}
          error={error}
          setError={setError}
          hide={showDisclaimer}
          time={time}
          isInitialScreen={isInitialScreen}
          onInitialLoadingChange={setInitialLoading}
        />
        {showDisclaimer && (
          <Disclaimer hideDisclaimer={() => setShowDisclaimer(false)} />
        )}
      </Card>
      <JouleFeedbackDialog
        isDialogOpen={isFeedbackDialogOpen}
        onSetDialogClosed={() => setIsFeedbackDialogOpen(false)}
      />
    </div>
  );
}
