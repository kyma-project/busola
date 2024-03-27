import { IllustratedMessage } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';

export default function ErrorMessage() {
  const { t } = useTranslation();

  return (
    <IllustratedMessage
      name="Connection"
      key="error-message"
      titleText={t('ai-assistant.error.title')}
      subtitleText={t('ai-assistant.error.subtitle')}
      style={{ ...spacing.sapUiSmallMarginTop, padding: 0 }}
    />
  );
}
