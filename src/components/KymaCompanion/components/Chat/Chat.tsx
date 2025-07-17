import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { FlexBox } from '@ui5/webcomponents-react';
import Message from './Message/Message';
import Bubbles from './Bubbles/Bubbles';
import ErrorMessage from './ErrorMessage/ErrorMessage';
import { sessionIDState } from 'state/companion/sessionIDAtom';
import { clusterState } from 'state/clusterAtom';
import { authDataState } from 'state/authDataAtom';
import getFollowUpQuestions from 'components/KymaCompanion/api/getFollowUpQuestions';
import getChatResponse from 'components/KymaCompanion/api/getChatResponse';
import { usePromptSuggestions } from 'components/KymaCompanion/hooks/usePromptSuggestions';
import { AIError } from '../KymaCompanion';
import ContextLabel from './ContextLabel/ContextLabel';
import QueryInput from './Input/QueryInput';
import {
  Author,
  ChatGroup,
  ErrResponse,
  ErrorType,
  MessageChunk,
  Message as MessageType,
  chatGroupHelpers,
} from './types';
import './Chat.scss';
import FeedbackMessage from './FeedbackMessage/FeedbackMessage';

type ChatProps = {
  chatHistory: ChatGroup[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatGroup[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isReset: boolean;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
  error: AIError;
  setError: React.Dispatch<React.SetStateAction<AIError>>;
  hide: boolean;
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
  hide = false,
}: ChatProps) => {
  const { t } = useTranslation();
  const chatRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sessionID = useRecoilValue<string>(sessionIDState);
  const cluster = useRecoilValue<any>(clusterState);
  const authData = useRecoilValue<any>(authDataState);

  const {
    initialSuggestions,
    initialSuggestionsLoading,
    currentResource,
  } = usePromptSuggestions(isReset, setIsReset, {
    skip:
      chatHistory.reduce((count, group) => count + group.messages.length, 0) >
      1,
  });

  const getCurrentContext = useCallback(() => {
    if (!currentResource.resourceType) return undefined;
    return currentResource.resourceName
      ? `${currentResource.resourceType} - ${currentResource.resourceName}`
      : currentResource.resourceType;
  }, [currentResource]);

  const addMessage = (message: MessageType) => {
    const currentContext = getCurrentContext();
    setChatHistory(prevGroups =>
      chatGroupHelpers.addMessage(prevGroups, message, currentContext),
    );
  };

  const updateLatestMessage = (updates: Partial<MessageType>) => {
    setChatHistory(prevGroups =>
      chatGroupHelpers.updateLatestMessage(prevGroups, updates),
    );
  };

  const concatMsgToLatestMessage = (
    response: MessageChunk,
    isLoading: boolean,
    isFeedback: boolean,
  ) => {
    setChatHistory(prevGroups =>
      chatGroupHelpers.concatMsgToLatestMessage(
        prevGroups,
        response,
        isLoading,
        isFeedback,
      ),
    );
  };

  const removeLastMessage = () => {
    setChatHistory(prevGroups =>
      chatGroupHelpers.removeLastMessage(prevGroups),
    );
  };

  const setErrorOnLastUserMsg = () => {
    setChatHistory(prevGroups =>
      chatGroupHelpers.setErrorOnLastUserMsg(prevGroups),
    );
  };

  const handleChatResponse = (response: MessageChunk) => {
    const isLoading = response?.data?.answer?.next !== '__end__';
    const isFeedback = response?.data?.answer?.is_feedback === true;

    if (!isLoading) {
      const finalTask = response.data.answer?.tasks?.at(-1);
      const hasError = finalTask?.status === 'error';

      if (hasError) {
        const allTasksError =
          response.data.answer?.tasks?.every(task => task.status === 'error') ??
          false;
        const displayRetry = response.data.error !== null || allTasksError;
        removeLastMessage();
        handleError(
          {
            type: ErrorType.FATAL,
            message: response.data.answer.content,
          },
          displayRetry,
        );
        return;
      } else if (isFeedback) {
        setLoading(false);
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
    concatMsgToLatestMessage(response, isLoading, isFeedback);
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

  const handleError = (errResponse: ErrResponse, displayRetry?: boolean) => {
    switch (errResponse.type) {
      case ErrorType.FATAL: {
        setErrorOnLastUserMsg();
        setLoading(false);
        setError({
          message:
            errResponse.message ?? t('kyma-companion.error.subtitle') ?? '',
          displayRetry: displayRetry ?? false,
        });
        break;
      }
      case ErrorType.RETRYABLE: {
        const errMsg = t('kyma-companion.error.http-error', {
          attempt: `${errResponse.attempt}/${errResponse.maxAttempts}`,
          statusCode: errResponse.statusCode,
        });
        setLoading(true);
        updateLatestMessage({
          author: Author.AI,
          messageChunks: [
            {
              data: {
                answer: {
                  content: errMsg,
                  next: '__end__',
                },
              },
            },
          ],
          isLoading: false,
        });
        break;
      }
    }
  };

  const retryPreviousPrompt = () => {
    const previousPrompt = chatGroupHelpers.findLastUserPrompt(chatHistory);
    if (previousPrompt) {
      removeLastMessage();
      sendPrompt(previousPrompt);
    }
  };

  const sendPrompt = (query: string) => {
    setError({ message: null, displayRetry: false });
    setLoading(true);

    addMessage({
      author: Author.USER,
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
    addMessage({ author: Author.AI, messageChunks: [], isLoading: true });
  };

  const scrollToBottom = () => {
    const lastChild = chatRef?.current?.lastElementChild as HTMLElement | null;
    if (!lastChild) return;

    const userMessages = lastChild.querySelectorAll<HTMLElement>(
      '.message-context .message-container.right-aligned',
    );
    const lastMessage = userMessages[userMessages.length - 1];
    if (!lastMessage) return;

    const contextLabel = lastChild.querySelector<HTMLElement>('.context-label');
    const offset = contextLabel?.offsetHeight || 0;

    chatRef.current?.scrollTo({
      top: lastMessage.offsetTop - offset,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const totalMessageCount = chatHistory.reduce(
      (count, group) => count + group.messages.length,
      0,
    );

    if (totalMessageCount === 1) {
      if (initialSuggestionsLoading) {
        // Update the context of the first group
        const currentContext = getCurrentContext();
        setChatHistory(prevGroups =>
          chatGroupHelpers.updateFirstGroupContext(prevGroups, currentContext),
        );
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
      style={hide ? { display: 'none' } : undefined}
      direction="Column"
      justifyContent="SpaceBetween"
      className="chat-container"
      ref={containerRef}
    >
      <div
        className="chat-list sap-margin-x-tiny sap-margin-top-tiny"
        ref={chatRef}
      >
        {chatHistory.map((group, groupIndex) => {
          const isLastGroup = groupIndex === chatHistory.length - 1;

          return (
            <div key={groupIndex} className="context-group">
              {group.context && (
                <ContextLabel labelText={group.context.labelText} />
              )}
              <div className="message-context">
                {group.messages.map((message, messageIndex) => {
                  const isLastMessage =
                    isLastGroup && messageIndex === group.messages.length - 1;
                  console.log(message);
                  return message.author === Author.AI ? (
                    <React.Fragment key={`${groupIndex}-${messageIndex}`}>
                      {message.isFeedback ? (
                        <FeedbackMessage />
                      ) : (
                        <React.Fragment>
                          <Message
                            author={message.author}
                            messageChunks={message.messageChunks}
                            isLoading={message.isLoading}
                            hasError={message.hasError ?? false}
                            isLatestMessage={isLastMessage}
                          />
                          {isLastMessage && !message.isLoading && (
                            <Bubbles
                              onClick={sendPrompt}
                              suggestions={message.suggestions}
                              isLoading={message.suggestionsLoading ?? false}
                            />
                          )}
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  ) : (
                    <Message
                      author={Author.USER}
                      key={`${groupIndex}-${messageIndex}`}
                      messageChunks={message.messageChunks}
                      isLoading={message.isLoading}
                      hasError={message.hasError ?? false}
                      isLatestMessage={isLastMessage}
                    />
                  );
                })}
              </div>
            </div>
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
      <QueryInput
        loading={loading}
        sendPrompt={sendPrompt}
        containerRef={containerRef}
      />
    </FlexBox>
  );
};
