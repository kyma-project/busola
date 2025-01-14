import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FlexBox, Icon, Input } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { initialPromptState } from 'components/KymaCompanion/state/initalPromptAtom';
import Message from './messages/Message';
import Bubbles from './messages/Bubbles';
import ErrorMessage from './messages/ErrorMessage';
import getChatResponse from 'components/KymaCompanion/api/getChatResponse';
import { sessionIDState } from 'components/KymaCompanion/state/sessionIDAtom';
import getFollowUpQuestions from 'components/KymaCompanion/api/getFollowUpQuestions';
import { clusterState } from 'state/clusterAtom';
import { authDataState } from 'state/authDataAtom';
import './Chat.scss';

interface MessageType {
  author: 'user' | 'ai';
  messageChunks: { step: string; result: string }[];
  isLoading: boolean;
  suggestions?: any[];
}

export default function Chat() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<MessageType[]>([]);
  const [errorOccured, setErrorOccured] = useState<boolean>(false);
  const initialPrompt = useRecoilValue<string>(initialPromptState);
  const sessionID = useRecoilValue<string>(sessionIDState);
  const cluster = useRecoilValue<any>(clusterState);
  const authData = useRecoilValue<any>(authDataState);

  const addMessage = ({ author, messageChunks, isLoading }: MessageType) => {
    setChatHistory(prevItems =>
      prevItems.concat({ author, messageChunks, isLoading }),
    );
  };

  const handleChatResponse = (response: any) => {
    const isLoading = response?.step !== 'output';
    if (!isLoading) {
      getFollowUpQuestions({
        sessionID,
        handleFollowUpQuestions,
        clusterUrl: cluster.currentContext.cluster.cluster.server,
        token: authData.token,
        certificateAuthorityData:
          cluster.currentContext.cluster.cluster['certificate-authority-data'],
      });
    }
    setChatHistory(prevMessages => {
      const [latestMessage] = prevMessages.slice(-1);
      return prevMessages.slice(0, -1).concat({
        author: 'ai',
        messageChunks: latestMessage.messageChunks.concat(response),
        isLoading,
      });
    });
  };

  const handleFollowUpQuestions = (questions: any) => {
    setChatHistory(prevMessages => {
      const [latestMessage] = prevMessages.slice(-1);
      return prevMessages
        .slice(0, -1)
        .concat({ ...latestMessage, suggestions: questions });
    });
  };

  const handleError = () => {
    setErrorOccured(true);
    setChatHistory(prevItems => prevItems.slice(0, -2));
  };

  const sendPrompt = (prompt: string) => {
    setErrorOccured(false);
    addMessage({
      author: 'user',
      messageChunks: [{ step: 'output', result: prompt }],
      isLoading: false,
    });
    getChatResponse({
      prompt,
      handleChatResponse,
      handleError,
      sessionID,
      clusterUrl: cluster.currentContext.cluster.cluster.server,
      token: authData.token,
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
    if (chatHistory.length === 0) sendPrompt(initialPrompt);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const delay = errorOccured ? 500 : 0;
    setTimeout(() => {
      scrollToBottom();
    }, delay);
  }, [chatHistory, errorOccured]);

  return (
    <FlexBox
      direction="Column"
      justifyContent="SpaceBetween"
      className="chat-container"
    >
      <div
        className="chat-list"
        style={spacing.sapUiTinyMargin}
        ref={containerRef}
      >
        {chatHistory.map((message, index) => {
          return message.author === 'ai' ? (
            <React.Fragment key={index}>
              <Message
                className="left-aligned"
                messageChunks={message.messageChunks}
                isLoading={message.isLoading}
              />
              {index === chatHistory.length - 1 && !message.isLoading && (
                <Bubbles
                  onClick={sendPrompt}
                  suggestions={message.suggestions}
                />
              )}
            </React.Fragment>
          ) : (
            <Message
              key={index}
              className="right-aligned"
              messageChunks={message.messageChunks}
              isLoading={message.isLoading}
            />
          );
        })}
        {errorOccured && (
          <ErrorMessage
            errorOnInitialMessage={chatHistory.length === 0}
            resendInitialPrompt={() => sendPrompt(initialPrompt)}
          />
        )}
      </div>
      <div style={spacing.sapUiTinyMarginBeginEnd}>
        <Input
          className="full-width"
          disabled={chatHistory[chatHistory.length - 1]?.isLoading}
          placeholder={t('kyma-companion.placeholder')}
          value={inputValue}
          icon={<Icon name="paper-plane" onClick={onSubmitInput} />}
          onKeyDown={e => e.key === 'Enter' && onSubmitInput()}
          onInput={e => setInputValue(e.target.value)}
        />
      </div>
    </FlexBox>
  );
}
