import {
  Button,
  Card,
  IllustratedMessage,
  Text,
} from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import { useTranslation } from 'react-i18next';
import { configFeaturesNames } from 'state/types';

export default function FeedbackMessage(): JSX.Element {
  const { t } = useTranslation();
  const { config: companionConfig } = useFeature(
    configFeaturesNames.KYMA_COMPANION,
  );

  return (
    <div className="sap-margin-x-tiny">
      <Card>
        <IllustratedMessage
          name="Survey"
          design="Small"
          key="feedback-message-chat"
          titleText={t('kyma-companion.feedback.title')}
          subtitle={<Text>{t('kyma-companion.feedback.subtitle')}</Text>}
        >
          <Button
            key="ai-feedback-chat"
            endIcon="inspect"
            design="Emphasized"
            onClick={() => {
              window.open(companionConfig?.feedbackLink, '_blank');
            }}
          >
            {t('kyma-companion.banner.buttons.feedback')}
          </Button>
        </IllustratedMessage>
      </Card>
    </div>
  );
}
