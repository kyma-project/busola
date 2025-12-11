import { Button } from '@ui5/webcomponents-react';
import copyToClipboard from 'copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

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

  const handleCopy = () => {
    copyToClipboard(contentToCopy);

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Button
      design="Transparent"
      icon="copy"
      onClick={() => handleCopy()}
      className={className}
      tooltip={
        iconOnly && copied
          ? t('common.tooltips.copied-to-clipboard', { resourceName })
          : t('common.tooltips.copy-to-clipboard')
      }
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
