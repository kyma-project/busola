import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexBox, Text } from '@ui5/webcomponents-react';
import { AnimatedJouleIcon } from './AnimatedJouleIcon';
import './WelcomeScreen.scss';
import '../Chat/Message/Message.scss';

export const WelcomeScreen = () => {
  const { t } = useTranslation();
  const messageVariants = ['help', 'assist', 'guide'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setIsVisible(true);

      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % messageVariants.length);
        setFade(false);
      }, 500); // duration of overlap

      setTimeout(() => {
        setIsVisible(false);
      }, 500); // duration of overlap
    }, 3000); // delay before switching phrases

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chat-initial-screen">
      <AnimatedJouleIcon className="initial-joule-icon" />
      <FlexBox className="initial-screen-text-container">
        <Text className="hello-text">
          {t('kyma-companion.welcome-screen.hello')}
        </Text>
        <Text className="chat-introduction">
          How can I
          <div className="message-variants-container">
            <Text
              className={`text current ${fade ? 'fade-out' : ''}`}
              style={{
                transition: !fade ? 'none' : 'opacity 0.1s ease-in-out',
              }}
            >
              {messageVariants[currentIndex]}
            </Text>
            <Text
              className={`text next ${fade ? 'fade-in' : ''}`}
              style={{ visibility: isVisible ? 'visible' : 'hidden' }}
            >
              {messageVariants[(currentIndex + 1) % messageVariants.length]}
            </Text>
          </div>
          you?
        </Text>
        <div className={'message-container left-aligned'}>
          <div className={'markdown message left-aligned'}>
            {t('kyma-companion.welcome-screen.talk-to-me')}
          </div>
        </div>
      </FlexBox>
    </div>
  );
};
