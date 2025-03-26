import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Title } from '@ui5/webcomponents-react';
import { useRecoilState } from 'recoil';
import {
  ShowKymaCompanion,
  showKymaCompanionState,
} from 'state/companion/showKymaCompanionAtom';
import { Chat, MessageType } from './Chat/Chat';
import './KymaCompanion.scss';

export interface AIError {
  message: string | null;
  displayRetry: boolean;
}

export default function KymaCompanion() {
  const { t } = useTranslation();

  const initialChatHistory: MessageType[] = [
    {
      author: 'ai',
      messageChunks: [
        {
          data: {
            answer: {
              content: t('kyma-companion.introduction'),
              next: '__end__',
            },
          },
        },
      ],
      isLoading: false,
      suggestionsLoading: true,
    },
  ];

  const [showCompanion, setShowCompanion] = useRecoilState<ShowKymaCompanion>(
    showKymaCompanionState,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isReset, setIsReset] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<MessageType[]>(
    initialChatHistory,
  );
  const [error, setError] = useState<AIError>({
    message: null,
    displayRetry: false,
  });

  function handleRefresh() {
    setChatHistory(() => {
      return initialChatHistory;
    });
    setError({
      message: null,
      displayRetry: false,
    });
    setIsReset(true);
  }

  return (
    <div id="companion_wrapper">
      <Card
        className="kyma-companion"
        header={
          <div className="kyma-companion__header">
            <Title level="H4" size="H4" className="title">
              {t('kyma-companion.name')}
            </Title>
            <div className="actions-container">
              <Button
                design="Transparent"
                icon="restart"
                disabled={loading}
                tooltip={t('common.buttons.reset')}
                className="action"
                onClick={() => handleRefresh()}
              />
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
        />
      </Card>
    </div>
  );
}
