import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Title } from '@ui5/webcomponents-react';
import { useRecoilState } from 'recoil';
import {
  ShowKymaCompanion,
  showKymaCompanionState,
} from 'state/companion/showKymaCompanionAtom';
import { Chat } from './Chat/Chat';
import { ChatGroup, chatGroupHelpers } from './Chat/types';
import Disclaimer from './Disclaimer/Disclaimer';
import './KymaCompanion.scss';

export interface AIError {
  message: string | null;
  displayRetry: boolean;
}

export default function KymaCompanion() {
  const { t } = useTranslation();

  const [showCompanion, setShowCompanion] = useRecoilState<ShowKymaCompanion>(
    showKymaCompanionState,
  );
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isReset, setIsReset] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatGroup[]>(
    chatGroupHelpers.createInitialState(t('kyma-companion.introduction')),
  );
  const [error, setError] = useState<AIError>({
    message: null,
    displayRetry: false,
  });
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
  }, []);

  function handleRefresh() {
    setChatHistory(
      chatGroupHelpers.createInitialState(t('kyma-companion.introduction')),
    );
    setError({
      message: null,
      displayRetry: false,
    });
    setTime(new Date());
    setIsReset(true);
  }

  return (
    <div id="companion_wrapper">
      <Card
        className="kyma-companion"
        header={
          <div
            className={`kyma-companion__${
              showDisclaimer ? 'disclaimer-' : ''
            }header`}
          >
            <Title level="H5" size="H5" className="companion-title">
              {t('kyma-companion.name')}
            </Title>
            <div className="actions-container">
              {!showDisclaimer && (
                <Button
                  design="Transparent"
                  icon="restart"
                  disabled={loading}
                  tooltip={t('common.buttons.reset')}
                  className="action"
                  onClick={() => handleRefresh()}
                />
              )}
              <Button
                design="Transparent"
                icon={
                  showCompanion.fullScreen ? 'exit-full-screen' : 'full-screen'
                }
                className="action"
                onClick={() =>
                  setShowCompanion({
                    show: true,
                    fullScreen: !showCompanion.fullScreen,
                  })
                }
              />
              {!showDisclaimer && (
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
                onClick={() =>
                  setShowCompanion({ show: false, fullScreen: false })
                }
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
        />
        {showDisclaimer && (
          <Disclaimer hideDisclaimer={() => setShowDisclaimer(false)} />
        )}
      </Card>
    </div>
  );
}
