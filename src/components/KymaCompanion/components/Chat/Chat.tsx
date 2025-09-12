import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { FlexBox } from '@ui5/webcomponents-react';
import Message from './Message/Message';
import Bubbles from './Bubbles/Bubbles';
import ErrorMessage from './ErrorMessage/ErrorMessage';
import { sessionIDAtom } from 'state/companion/sessionIDAtom';
import { clusterAtom } from 'state/clusterAtom';
import { authDataAtom } from 'state/authDataAtom';
import getFollowUpQuestions from 'components/KymaCompanion/api/getFollowUpQuestions';
import getChatResponse from 'components/KymaCompanion/api/getChatResponse';
import { usePromptSuggestions } from 'components/KymaCompanion/hooks/usePromptSuggestions';
import ContextLabel from './ContextLabel/ContextLabel';
import TimestampLabel from './TimestampLabel/TimestampLabel';
import QueryInput from './Input/QueryInput';
import {
  AIError,
  Author,
  ChatGroup,
  ErrResponse,
  ErrorType,
  MessageChunk,
  Message as MessageType,
} from './types';
import { chatHelpers } from './chatHelper';
import './Chat.scss';
import FeedbackMessage from './FeedbackMessage/FeedbackMessage';
import { WelcomeScreen } from '../WelcomeScreen/WelcomeScreen';
import loadingIcon from './icon_loading.gif';

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
  time: Date | null;
  isInitialScreen: boolean;
  onInitialLoadingChange?: (isLoading: boolean) => void;
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
  time,
  isInitialScreen,
  onInitialLoadingChange = () => {},
}: ChatProps) => {
  const { t } = useTranslation();
  const chatRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasLoadingScreenLoaded = useRef(false);

  const sessionID = useAtomValue<string>(sessionIDAtom);
  const cluster = useAtomValue<any>(clusterAtom);
  const authData = useAtomValue<any>(authDataAtom);

  const { initialSuggestions, initialSuggestionsLoading, currentResource } =
    usePromptSuggestions(isReset, setIsReset, {
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
    setChatHistory((prevGroups) =>
      chatHelpers.addMessage(prevGroups, message, currentContext),
    );
  };

  const updateLatestMessage = (updates: Partial<MessageType>) => {
    setChatHistory((prevGroups) =>
      chatHelpers.updateLatestMessage(prevGroups, updates),
    );
  };

  const concatMsgToLatestMessage = (
    response: MessageChunk,
    isLoading: boolean,
    isFeedback: boolean,
  ) => {
    setChatHistory((prevGroups) =>
      chatHelpers.concatMsgToLatestMessage(
        prevGroups,
        response,
        isLoading,
        isFeedback,
      ),
    );
  };

  const removeLastMessage = () => {
    setChatHistory((prevGroups) => chatHelpers.removeLastMessage(prevGroups));
  };

  const setErrorOnLastUserMsg = () => {
    setChatHistory((prevGroups) =>
      chatHelpers.setErrorOnLastUserMsg(prevGroups),
    );
  };

  const handleChatResponse = (response: MessageChunk) => {
    const isLoading = response?.data?.answer?.next !== '__end__';
    const isFeedback =
      !isLoading && response?.data?.answer?.is_feedback === true;

    if (!isLoading) {
      const hasError =
        response.data.answer?.tasks?.some((task) => task.status === 'error') ??
        false;

      if (hasError) {
        const allTasksError =
          response.data.answer?.tasks?.every(
            (task) => task.status === 'error',
          ) ?? false;
        if (!allTasksError) {
          // handle partial error
          updateLatestMessage({ partialAIFailure: true });
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
        } else {
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
        }
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
        if (errResponse.maxAttempts === 1) {
          updateLatestMessage({
            messageChunks: [
              {
                data: {
                  answer: {
                    content: t('kyma-companion.error.http-error-no-retry', {
                      statusCode: errResponse.statusCode,
                    }),
                    next: '__end__',
                  },
                },
              },
            ],
            isLoading: false,
          });
        }
        setError({
          title: errResponse.title,
          message: errResponse.message ?? t('kyma-companion.error.subtitle'),
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
    const previousPrompt = chatHelpers.findLastUserPrompt(chatHistory);
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
      t,
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
        setChatHistory((prevGroups) =>
          chatHelpers.updateFirstGroupContext(prevGroups, currentContext),
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

  const showWelcomeScreen =
    chatHistory[0].messages.length === 1 && isInitialScreen;

  useEffect(() => {
    if (
      !initialSuggestionsLoading &&
      isInitialScreen &&
      !hasLoadingScreenLoaded.current
    ) {
      hasLoadingScreenLoaded.current = true;
    }

    onInitialLoadingChange?.(
      initialSuggestionsLoading &&
        isInitialScreen &&
        !hasLoadingScreenLoaded.current,
    );
  }, [initialSuggestionsLoading, isInitialScreen, onInitialLoadingChange]);

  return (
    <>
      {initialSuggestionsLoading && !hasLoadingScreenLoaded.current ? (
        <div className="chat-loading-screen">
          <img
            src={loadingIcon}
            className="chat-loading-indicator"
            alt="Loading indicator"
          />
        </div>
      ) : (
        <div
          className={`chat-container ${showWelcomeScreen ? 'split' : ''}`}
          style={hide ? { display: 'none' } : {}}
        >
          {showWelcomeScreen && <WelcomeScreen />}
          <FlexBox
            style={{ height: '100%' }}
            direction="Column"
            justifyContent="SpaceBetween"
            ref={containerRef}
          >
            <div
              className="chat-list sap-margin-x-tiny sap-margin-top-tiny"
              ref={chatRef}
            >
              {time && !showWelcomeScreen && <TimestampLabel time={time} />}
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
                          isLastGroup &&
                          messageIndex === group.messages.length - 1;

                        return message.author === Author.AI ? (
                          <React.Fragment key={`${groupIndex}-${messageIndex}`}>
                            {message.isFeedback ? (
                              <FeedbackMessage />
                            ) : (
                              <>
                                <Message
                                  author={message.author}
                                  messageChunks={message.messageChunks}
                                  isLoading={message.isLoading}
                                  partialAIFailure={message.partialAIFailure}
                                  hasError={message.hasError}
                                  isLatestMessage={isLastMessage}
                                />
                                {isLastMessage && !message.isLoading && (
                                  <Bubbles
                                    onClick={sendPrompt}
                                    suggestions={message.suggestions}
                                    isLoading={
                                      message.suggestionsLoading ?? false
                                    }
                                  />
                                )}
                              </>
                            )}
                          </React.Fragment>
                        ) : (
                          <Message
                            author={Author.USER}
                            key={`${groupIndex}-${messageIndex}`}
                            messageChunks={message.messageChunks}
                            isLoading={message.isLoading}
                            hasError={message.hasError}
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
                  errorTitle={error?.title}
                  errorMessage={
                    error.message ?? t('kyma-companion.error.subtitle')
                  }
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
        </div>
      )}
    </>
  );
};
