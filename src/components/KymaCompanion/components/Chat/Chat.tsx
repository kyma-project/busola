import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FlexBox, Icon, Text, TextArea } from '@ui5/webcomponents-react';
import Message, { MessageChunk } from './Message/Message';
import Bubbles from './Bubbles/Bubbles';
import ErrorMessage from './ErrorMessage/ErrorMessage';
import { sessionIDState } from 'state/companion/sessionIDAtom';
import { clusterState } from 'state/clusterAtom';
import { authDataState } from 'state/authDataAtom';
import getFollowUpQuestions from 'components/KymaCompanion/api/getFollowUpQuestions';
import getChatResponse from 'components/KymaCompanion/api/getChatResponse';
import { usePromptSuggestions } from 'components/KymaCompanion/hooks/usePromptSuggestions';
import { AIError } from '../KymaCompanion';
import './Chat.scss';

export interface MessageType {
  author: 'user' | 'ai';
  messageChunks: MessageChunk[];
  isLoading: boolean;
  suggestions?: string[];
  suggestionsLoading?: boolean;
  hasError?: boolean | undefined;
}

type ChatProps = {
  chatHistory: MessageType[];
  setChatHistory: React.Dispatch<React.SetStateAction<MessageType[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isReset: boolean;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
  error: AIError;
  setError: React.Dispatch<React.SetStateAction<AIError>>;
};

export const Chat = ({
  chatHistory,
  setChatHistory,
  error,
  setError,
  loading,
  setLoading,
  isReset,
  setIsReset,
}: ChatProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  const sessionID = useRecoilValue<string>(sessionIDState);
  const cluster = useRecoilValue<any>(clusterState);
  const authData = useRecoilValue<any>(authDataState);

  const {
    initialSuggestions,
    initialSuggestionsLoading,
    currentResource,
  } = usePromptSuggestions(isReset, setIsReset, {
    skip: chatHistory.length > 1,
  });

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
      const finalTask = response.data.answer?.tasks?.at(-1);
      const hasError = finalTask?.status === 'error';

      if (hasError) {
        const allTasksError =
          response.data.answer?.tasks?.every(task => task.status === 'error') ??
          false;
        const displayRetry = response.data.error !== null || allTasksError;
        handleError(response.data.answer.content, displayRetry);
        return;
      } else {
        setFollowUpLoading();
        getFollowUpQuestions({
          sessionID,
          handleFollowUpQuestions,
          handleFollowUpError,
          clusterUrl: cluster.currentContext.cluster.cluster.server,
          token: authData.token,
          certificateAuthorityData:
            cluster.currentContext.cluster.cluster[
              'certificate-authority-data'
            ],
        });
      }
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
    setError({ message: null, displayRetry: false });
    setLoading(true);
    updateLatestMessage({ suggestionsLoading: true });
  };

  const handleFollowUpQuestions = (questions: string[]) => {
    updateLatestMessage({ suggestions: questions, suggestionsLoading: false });
    setLoading(false);
  };

  const handleFollowUpError = () => {
    updateLatestMessage({
      hasError: true,
      suggestionsLoading: false,
    });
    setLoading(false);
  };

  const handleError = (error?: string, displayRetry?: boolean) => {
    const errorMessage = error ?? t('kyma-companion.error.subtitle') ?? '';
    setError({
      message: errorMessage,
      displayRetry: displayRetry ?? false,
    });
    setChatHistory(prevItems => prevItems.slice(0, -1));
    updateLatestMessage({ hasError: true });
    setLoading(false);
  };

  const retryPreviousPrompt = () => {
    const previousPrompt = chatHistory.at(-1)?.messageChunks[0].data.answer
      .content;
    if (previousPrompt) {
      setChatHistory(prevItems => prevItems.slice(0, -1));
      sendPrompt(previousPrompt);
    }
  };

  const sendPrompt = (query: string) => {
    setError({ message: null, displayRetry: false });
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
          const isLast = index === chatHistory.length - 1;
          return message.author === 'ai' ? (
            <React.Fragment key={index}>
              <Message
                author="ai"
                messageChunks={message.messageChunks}
                isLoading={message.isLoading}
                hasError={message?.hasError ?? false}
                isLatestMessage={isLast}
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
              author="user"
              key={index}
              messageChunks={message.messageChunks}
              isLoading={message.isLoading}
              hasError={message?.hasError ?? false}
              isLatestMessage={isLast}
            />
          );
        })}
        {error.message && (
          <ErrorMessage
            errorMessage={error.message ?? t('kyma-companion.error.subtitle')}
            retryPrompt={() => retryPreviousPrompt()}
            displayRetry={error.displayRetry}
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
            onClick={loading ? () => {} : onSubmitInput}
          />
        </div>
        <Text id="disclaimer">{t('kyma-companion.disclaimer')}</Text>
      </div>
    </FlexBox>
  );
};
