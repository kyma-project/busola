import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexBox, Text } from '@ui5/webcomponents-react';
import { AnimatedJouleIcon } from './AnimatedJouleIcon';
import './WelcomeScreen.scss';
import '../Chat/Message/Message.scss';

export const WelcomeScreen = () => {
  const { t } = useTranslation();
  const messageVariants = [
    t('kyma-companion.welcome-screen.help'),
    t('kyma-companion.welcome-screen.assist'),
    t('kyma-companion.welcome-screen.guide'),
  ];

  const measureRef = useRef<HTMLElement | null>(null);

  // eslint-disable-next-line react-hooks/refs
  const width = measureRef.current?.offsetWidth || 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  // eslint-disable-next-line react-hooks/refs
  const [wordWidth, setWordWidth] = useState(width);

  useEffect(() => {
    if (measureRef.current) {
      setWordWidth(measureRef.current.offsetWidth || width);
    }
    // eslint-disable-next-line react-hooks/refs
  }, [currentIndex, width]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeout(() => {
        setFade(true);
        setIsVisible(true);
      }, 600);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messageVariants.length);
        setFade(false);
        setIsVisible(false);
      }, 650); // Duration of overlap
    }, 3600); // Delay before switching phrases

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="chat-initial-screen">
      <AnimatedJouleIcon className="initial-joule-icon" />
      <FlexBox className="initial-screen-text-container">
        <Text className="hello-text">
          {t('kyma-companion.welcome-screen.hello')},
        </Text>
        <Text className="chat-introduction">
          <div
            className="sap-margin-end-tiny"
            style={{ display: 'inline-block' }}
          >
            {t('kyma-companion.welcome-screen.how-can-i')}
          </div>
          {/* Hidden span for measuring */}
          <span ref={measureRef} className="word measure">
            {messageVariants[currentIndex]}
          </span>
          <div
            className="message-variants-container"
            style={{ width: `${wordWidth}px` }}
          >
            <Text
              className={`text current ${fade ? 'fade-out' : ''}`}
              style={{
                transition: !fade ? 'none' : 'opacity 0.1s ease-in-out', // Has to match styling in CSS file to not flash
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
          <div
            className="sap-margin-begin-tiny"
            style={{ display: 'inline-block' }}
          >
            {t('kyma-companion.welcome-screen.you-question')}
          </div>
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
