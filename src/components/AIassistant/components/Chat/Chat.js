import { useEffect, useRef, useState } from 'react';
import { FlexBox, Icon, Input } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import PlainMessage from './messages/PlainMessage';
import Bubbles from './messages/Bubbles';
import ErrorMessage from './messages/ErrorMessage';
import { useTranslation } from 'react-i18next';
import getChatResponse from 'components/AIassistant/utils/getChatResponse';
import './Chat.scss';

export default function Chat() {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [errorOccured, setErrorOccured] = useState(false);
  const addMessage = (author, message) => {
    setChatHistory(prevItems => [...prevItems, { author, message }]);
  };
  const handleSuccess = response => {
    addMessage('ai', response);
  };
  const handleError = () => {
    setErrorOccured(true);
    setChatHistory(prevItems => prevItems.slice(0, -1));
  };
  const onClickBubble = prompt => {
    setErrorOccured(false);
    addMessage('user', prompt);
    return getChatResponse(prompt, handleSuccess, handleError);
  };
  const onSubmitInput = () => {
    const prompt = inputValue;
    setInputValue('');
    setErrorOccured(false);
    addMessage('user', prompt);
    return getChatResponse(prompt, handleSuccess, handleError);
  };

  const scrollToBottom = () => {
    if (containerRef?.current?.lastChild)
      containerRef.current.lastChild.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

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
        <Bubbles
          key="bubbles"
          onClick={onClickBubble}
          suggestions={[
            'test123123123123123xyzxyzuwquxzytsabcde123456',
            'Throw an error',
            'What is your favorite football team?',
          ]}
        />
        {chatHistory.map((message, index) => {
          return message.author === 'ai' ? (
            <>
              <PlainMessage
                key={index + '.1'}
                className="left-aligned"
                message={message.message}
              />
              <Bubbles
                key={index + '.2'}
                onClick={onClickBubble}
                suggestions={[
                  'test123123123123123xyzxyzuwquxzytsabcde123456',
                  'Throw an error',
                  'What is your favorite football team?',
                ]}
              />
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
          icon={<Icon name="paper-plane" onClick={onSubmitInput} />}
          value={inputValue}
          onKeyDown={e => {
            if (e.key === 'Enter' && inputValue.length > 0) onSubmitInput();
          }}
          onInput={e => setInputValue(e.target.value)}
          placeholder={t('ai-assistant.placeholder')}
        />
      </div>
    </FlexBox>
  );
}
