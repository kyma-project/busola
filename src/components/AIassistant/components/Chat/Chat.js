import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FlexBox, Icon, Input } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { initialPromptState } from 'components/AIassistant/state/initalPromptAtom';
import PlainMessage from './messages/PlainMessage';
import Bubbles from './messages/Bubbles';
import ErrorMessage from './messages/ErrorMessage';
import getChatResponse from 'components/AIassistant/api/getChatResponse';
import './Chat.scss';

export default function Chat() {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [errorOccured, setErrorOccured] = useState(false);
  const initialPrompt = useRecoilValue(initialPromptState);

  const addMessage = (author, message, isLoading) => {
    setChatHistory(prevItems => [...prevItems, { author, message, isLoading }]);
  };

  const handleSuccess = response => {
    setChatHistory(prevItems => {
      const newArray = [...prevItems];
      newArray[newArray.length - 1] = {
        author: 'ai',
        message: response,
        isLoading: false,
      };
      return newArray;
    });
  };

  const handleError = () => {
    setErrorOccured(true);
    setChatHistory(prevItems => prevItems.slice(0, -2));
  };

  const sendPrompt = prompt => {
    setErrorOccured(false);
    addMessage('user', prompt, false);
    getChatResponse(prompt, handleSuccess, handleError);
    addMessage('ai', null, true);
  };

  const onSubmitInput = () => {
    if (inputValue.length === 0) return;
    const prompt = inputValue;
    setInputValue('');
    sendPrompt(prompt);
  };

  const scrollToBottom = () => {
    if (containerRef?.current?.lastChild)
      containerRef.current.lastChild.scrollIntoView({
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
            <>
              <PlainMessage
                key={index}
                className="left-aligned"
                message={message.message}
                isLoading={message.isLoading}
              />
              {index === chatHistory.length - 1 && !message.isLoading && (
                <Bubbles
                  key={index + '.2'}
                  onClick={sendPrompt}
                  suggestions={
                    message.suggestions ?? [
                      'test123123123123123xyzxyzuwquxzytsabcde123456',
                      'Throw an error',
                      'What is your favorite football team?',
                    ]
                  }
                />
              )}
            </>
          ) : (
            <PlainMessage
              key={index}
              className="right-aligned"
              message={message.message}
            />
          );
        })}
        {errorOccured && <ErrorMessage />}
      </div>
      <div style={spacing.sapUiTinyMarginBeginEnd}>
        <Input
          className="full-width"
          disabled={chatHistory[chatHistory.length - 1]?.isLoading}
          placeholder={t('ai-assistant.placeholder')}
          value={inputValue}
          icon={<Icon name="paper-plane" onClick={onSubmitInput} />}
          onKeyDown={e => e.key === 'Enter' && onSubmitInput()}
          onInput={e => setInputValue(e.target.value)}
        />
      </div>
    </FlexBox>
  );
}
