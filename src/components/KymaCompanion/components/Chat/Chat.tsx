import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FlexBox, Icon, Text, TextArea } from '@ui5/webcomponents-react';
import Message, {
  ErrorType,
  ErrResponse,
  MessageChunk,
} from './Message/Message';
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
import './Chat.scss';

export enum Author {
  USER = 'user',
  AI = 'ai',
}

export enum ChatItemType {
  MESSAGE = 'message',
  CONTEXT = 'context',
}

interface BaseChatItem {
  type: ChatItemType;
}

interface MessageChatItem extends BaseChatItem {
  type: ChatItemType.MESSAGE;
  author: Author;
  messageChunks: MessageChunk[];
  isLoading: boolean;
  suggestions?: string[];
  suggestionsLoading?: boolean;
  hasError?: boolean | undefined;
}

interface ContextChatItem extends BaseChatItem {
  type: ChatItemType.CONTEXT;
  labelText: string;
}

export type ChatItem = MessageChatItem | ContextChatItem;

type ChatProps = {
  chatHistory: ChatItem[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatItem[]>>;
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
    skip:
      chatHistory.filter(item => item.type === ChatItemType.MESSAGE).length > 1,
  });

  const handleContextChange = useCallback(() => {
    const newContext = currentResource.resourceName
      ? `${currentResource.resourceType} > ${currentResource.resourceName}`
      : currentResource.resourceType;

    const lastContextItem = chatHistory
      .slice()
      .reverse()
      .find(
        (item): item is ContextChatItem => item.type === ChatItemType.CONTEXT,
      );

    if (!lastContextItem || lastContextItem.labelText !== newContext) {
      const contextItem: ContextChatItem = {
        type: ChatItemType.CONTEXT,
        labelText: newContext,
      };
      setChatHistory(prevItems => prevItems.concat(contextItem));
    }
  }, [currentResource, chatHistory, setChatHistory]);

  const addMessage = ({
    author,
    messageChunks,
    isLoading,
  }: Omit<MessageChatItem, 'type'>) => {
    const messageItem: MessageChatItem = {
      type: ChatItemType.MESSAGE,
      author,
      messageChunks,
      isLoading,
    };
    setChatHistory(prevItems => prevItems.concat(messageItem));
  };

  const updateLatestMessage = (updates: Partial<MessageChatItem>) => {
    setChatHistory(prevItems => {
      if (prevItems.length === 0) return prevItems;

      const [latestItem] = prevItems.slice(-1);
      if (latestItem.type !== ChatItemType.MESSAGE) return prevItems;

      return prevItems.slice(0, -1).concat({
        ...latestItem,
        ...updates,
      });
    });
  };

  const concatMsgToLatestMessage = (
    response: MessageChunk,
    isLoading: boolean,
  ) => {
    setChatHistory(prevItems => {
      const [latestItem] = prevItems.slice(-1);
      if (latestItem.type !== ChatItemType.MESSAGE) return prevItems;

      return prevItems.slice(0, -1).concat({
        ...latestItem,
        messageChunks: latestItem.messageChunks.concat(response),
        isLoading,
      });
    });
  };

  const removeLastMessage = () => {
    setChatHistory(prevItems => prevItems.slice(0, -1));
  };

  const setErrorOnLastUserMsg = () => {
    setChatHistory(prevItems => {
      const lastUserMsgIdx = prevItems.findLastIndex(
        item =>
          item.type === ChatItemType.MESSAGE && item.author === Author.USER,
      );

      if (lastUserMsgIdx === -1) {
        return prevItems;
      }

      return prevItems.map((item, idx) => {
        if (idx === lastUserMsgIdx && item.type === ChatItemType.MESSAGE) {
          return {
            ...item,
            hasError: true,
            isLoading: false,
          };
        }
        return item;
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
        removeLastMessage();
        handleError(
          {
            type: ErrorType.FATAL,
            message: response.data.answer.content,
          },
          displayRetry,
        );
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
    concatMsgToLatestMessage(response, isLoading);
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
    const messageItems = chatHistory.filter(
      (item): item is MessageChatItem => item.type === ChatItemType.MESSAGE,
    );
    const lastUserMsg = messageItems.findLast(
      msg => msg.author === Author.USER,
    );
    const previousPrompt = lastUserMsg?.messageChunks[0].data.answer.content;

    if (previousPrompt) {
      removeLastMessage();
      sendPrompt(previousPrompt);
    }
  };

  const sendPrompt = (query: string) => {
    setError({ message: null, displayRetry: false });
    setLoading(true);

    handleContextChange();

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
    const messageCount = chatHistory.filter(
      item => item.type === ChatItemType.MESSAGE,
    ).length;

    if (messageCount === 1) {
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
        {chatHistory.map((item, index) => {
          if (item.type === ChatItemType.CONTEXT) {
            return <ContextLabel key={index} labelText={item.labelText} />;
          }

          const isLast = index === chatHistory.length - 1;
          return item.author === Author.AI ? (
            <React.Fragment key={index}>
              <Message
                author={item.author}
                messageChunks={item.messageChunks}
                isLoading={item.isLoading}
                hasError={item?.hasError ?? false}
                isLatestMessage={isLast}
              />
              {isLast && !item.isLoading && (
                <Bubbles
                  onClick={sendPrompt}
                  suggestions={item.suggestions}
                  isLoading={item.suggestionsLoading ?? false}
                />
              )}
            </React.Fragment>
          ) : (
            <Message
              author={Author.USER}
              key={index}
              messageChunks={item.messageChunks}
              isLoading={item.isLoading}
              hasError={item?.hasError ?? false}
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
