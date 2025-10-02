import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function ExternalLinkButton({ structure }) {
  const { t } = useTranslation();

  return (
    <Button
      accessibleRole="Link"
      accessibleName={structure?.name ?? t('common.buttons.learn-more')}
      accessibleDescription="Open in new tab link"
      endIcon="inspect"
      design={structure?.emphasized ? 'Emphasized' : 'Default'}
      inline={true}
      onClick={() => {
        window.open(structure?.link, '_blank');
      }}
    >
      {structure?.name ?? t('common.buttons.learn-more')}
    </Button>
  );
}
