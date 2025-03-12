import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FlexBox, Icon, Text, TextArea } from '@ui5/webcomponents-react';
import Message, { MessageChunk } from './messages/Message';
import Bubbles from './messages/Bubbles';
import ErrorMessage from './messages/ErrorMessage';
import { sessionIDState } from 'state/companion/sessionIDAtom';
import { clusterState } from 'state/clusterAtom';
import { authDataState } from 'state/authDataAtom';
import getFollowUpQuestions from 'components/KymaCompanion/api/getFollowUpQuestions';
import getChatResponse from 'components/KymaCompanion/api/getChatResponse';
import { usePromptSuggestions } from 'components/KymaCompanion/hooks/usePromptSuggestions';
import './Chat.scss';

interface MessageType {
  author: 'user' | 'ai';
  messageChunks: MessageChunk[];
  isLoading: boolean;
  suggestions?: string[];
  suggestionsLoading?: boolean;
}

export default function Chat() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<MessageType[]>([
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
  ]);
  const [error, setError] = useState<string | null>(null);
  const sessionID = useRecoilValue<string>(sessionIDState);
  const cluster = useRecoilValue<any>(clusterState);
  const authData = useRecoilValue<any>(authDataState);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    initialSuggestions,
    initialSuggestionsLoading,
    currentResource,
  } = usePromptSuggestions({ skip: chatHistory.length > 1 });

  const addMessage = ({ author, messageChunks, isLoading }: MessageType) => {
    setChatHistory(prevItems =>
      prevItems.concat({ author, messageChunks, isLoading }),
    );
  };

  const updateLatestMessage = (updates: Partial<MessageType>) => {
    setChatHistory(prevMessages => {
      if (prevMessages.length === 0) return prevMessages;

      const [latestMessage] = prevMessages.slice(-1);
      return prevMessages.slice(0, -1).concat({
        ...latestMessage,
        ...updates,
      });
    });
  };

  const handleChatResponse = (response: MessageChunk) => {
    const isLoading = response?.data?.answer?.next !== '__end__';
    if (!isLoading) {
      setFollowUpLoading();
      getFollowUpQuestions({
        sessionID,
        handleFollowUpQuestions,
        clusterUrl: cluster.currentContext.cluster.cluster.server,
        token: authData.token,
        certificateAuthorityData:
          cluster.currentContext.cluster.cluster['certificate-authority-data'],
      });
      setLoading(false);
    }
    setChatHistory(prevMessages => {
      const [latestMessage] = prevMessages.slice(-1);
      return prevMessages.slice(0, -1).concat({
        ...latestMessage,
        messageChunks: latestMessage.messageChunks.concat(response),
        isLoading,
      });
    });
  };

  const setFollowUpLoading = () => {
    setError(null);
    updateLatestMessage({ suggestionsLoading: true });
  };

  const handleFollowUpQuestions = (questions: string[]) => {
    updateLatestMessage({ suggestions: questions, suggestionsLoading: false });
  };

  const handleError = (error?: Error) => {
    setError(error?.message ?? t('kyma-companion.error.subtitle'));
    setChatHistory(prevItems => prevItems.slice(0, -2));
  };

  const sendPrompt = (query: string) => {
    setError(null);
    setLoading(true);
    addMessage({
      author: 'user',
      messageChunks: [
        {
          data: {
            answer: {
              content: query,
              next: '__end__',
            },
          },
        },
      ],
      isLoading: false,
    });
    getChatResponse({
      query,
      namespace: currentResource?.namespace,
      resourceType: currentResource?.resourceType,
      groupVersion: currentResource?.groupVersion,
      resourceName: currentResource?.resourceName,
      handleChatResponse,
      handleError,
      sessionID,
      clusterUrl: cluster.currentContext.cluster.cluster.server,
      clusterAuth: {
        token: authData?.token,
        clientCertificateData: authData['client-certificate-data'],
        clientKeyData: authData['client-key-data'],
      },
      certificateAuthorityData:
        cluster.currentContext.cluster.cluster['certificate-authority-data'],
    });
    addMessage({ author: 'ai', messageChunks: [], isLoading: true });
  };

  const onSubmitInput = () => {
    if (inputValue.length === 0) return;
    const prompt = inputValue;
    setInputValue('');
    sendPrompt(prompt);
  };

  const scrollToBottom = () => {
    if (containerRef?.current?.lastChild)
      (containerRef.current.lastChild as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

  useEffect(() => {
    if (chatHistory.length === 1) {
      if (initialSuggestionsLoading) {
        updateLatestMessage({
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
        });
        setFollowUpLoading();
      } else if (initialSuggestions) {
        handleFollowUpQuestions(initialSuggestions);
        if (initialSuggestions.length === 0) {
          updateLatestMessage({
            messageChunks: [
              {
                data: {
                  answer: {
                    content: t('kyma-companion.introduction-no-suggestions'),
                    next: '__end__',
                  },
                },
              },
            ],
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSuggestions, initialSuggestionsLoading]);

  useEffect(() => {
    const delay = error ? 500 : 0;
    setTimeout(() => {
      scrollToBottom();
    }, delay);
  }, [chatHistory, error]);

  return (
    <FlexBox
      direction="Column"
      justifyContent="SpaceBetween"
      className="chat-container"
    >
      <div
        className="chat-list sap-margin-x-tiny sap-margin-top-small"
        ref={containerRef}
      >
        {chatHistory.map((message, index) => {
          return message.author === 'ai' ? (
            <React.Fragment key={index}>
              <Message
                className="left-aligned sap-margin-begin-tiny"
                messageChunks={message.messageChunks}
                isLoading={message.isLoading}
              />
              {index === chatHistory.length - 1 && !message.isLoading && (
                <Bubbles
                  onClick={sendPrompt}
                  suggestions={message.suggestions}
                  isLoading={message.suggestionsLoading ?? false}
                />
              )}
            </React.Fragment>
          ) : (
            <Message
              key={index}
              className="right-aligned sap-margin-end-tiny"
              messageChunks={message.messageChunks}
              isLoading={message.isLoading}
            />
          );
        })}
        {error && (
          <ErrorMessage
            errorMessage={error}
            errorOnInitialMessage={chatHistory.length === 0}
            retryPrompt={() => {}}
          />
        )}
      </div>
      <div className="outer-input-container sap-margin-x-small sap-margin-bottom-small sap-margin-top-tiny">
        <div className="input-container">
          <TextArea
            disabled={loading}
            className="full-width"
            growing
            growingMaxRows={10}
            rows={1}
            placeholder={t('kyma-companion.placeholder')}
            value={inputValue}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmitInput();
              }
            }}
            onInput={e => {
              setInputValue(e.target.value);
            }}
            valueState="None"
          />
          <Icon
            id="text-area-icon"
            name="paper-plane"
            mode={loading ? 'Image' : 'Interactive'}
            design={loading ? 'NonInteractive' : 'Default'}
            onClick={onSubmitInput}
          />
        </div>
        <Text id="disclaimer">{t('kyma-companion.disclaimer')}</Text>
      </div>
    </FlexBox>
  );
}
