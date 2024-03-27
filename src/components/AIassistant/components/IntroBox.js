import { useTranslation } from 'react-i18next';
import { FlexBox, Icon, Text } from '@ui5/webcomponents-react';
import './IntroBox.scss';

export default function IntroBox() {
  const { t } = useTranslation();
  return (
    <FlexBox className="intro-box" direction="Column">
      <div className="illustration">
        <Icon name="da-2" className="joule-icon" />
      </div>
      <div className="introduction">
        <Text className="text" id="text1">
          {t('ai-assistant.introduction1')}
        </Text>
        <Text className="text" id="text2">
          {t('ai-assistant.introduction2')}
        </Text>
      </div>
    </FlexBox>
  );
}
