import { Button } from '@ui5/webcomponents-react';
import copyToClipboard from 'copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNotification } from 'shared/contexts/NotificationContext';

interface CopyButtonProps {
  contentToCopy: string;
  resourceName?: string;
  iconOnly?: boolean;
  className?: string;
}

const CopyButton = ({
  contentToCopy,
  resourceName,
  iconOnly = true,
  className,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  const notification = useNotification();

  const handleCopy = () => {
    copyToClipboard(contentToCopy);

    setCopied(true);

    notification.notifySuccess({
      content: t('common.tooltips.copied-to-clipboard', { resourceName }),
    });

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Button
      className={className}
      design="Transparent"
      icon="copy"
      onClick={() => handleCopy()}
      tooltip={!copied ? t('common.tooltips.copy-to-clipboard') : undefined}
      accessibleName={
        iconOnly && copied
          ? t('common.tooltips.copied-to-clipboard', { resourceName })
          : t('common.tooltips.copy-to-clipboard')
      }
      aria-live={iconOnly ? 'polite' : undefined}
    >
      {!iconOnly
        ? copied
          ? t('common.buttons.copied')
          : t('common.buttons.copy')
        : null}
    </Button>
  );
};

export default CopyButton;
